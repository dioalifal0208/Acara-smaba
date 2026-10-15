<?php

namespace Tests\Feature;

use App\Models\Participant;
use App\Models\User;
use App\Models\Workcode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class PublicEndpointsHardeningTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    private function vector(float $base): array
    {
        return array_fill(0, 128, $base);
    }

    private function participantUser(array $attributes = []): array
    {
        $participant = Participant::create(array_merge(['nama' => 'Peserta Uji', 'nis_nip' => '198001012006041001'], $attributes));
        $user = User::factory()->create(['role' => 'participant', 'participant_id' => $participant->id]);

        return [$participant, $user];
    }

    // ── 2.1 Face match ──────────────────────────────────────────────

    public function test_face_match_requires_login(): void
    {
        Workcode::create(['nama_workcode' => 'Rapat', 'kategori' => 'workcode', 'is_active' => true]);
        Participant::create(['nama' => 'A', 'nis_nip' => '1', 'face_descriptor' => $this->vector(0.1), 'face_status' => 'approved']);

        $this->postJson(route('face.match'), ['descriptor' => $this->vector(0.1)])->assertUnauthorized();
    }

    public function test_non_admin_account_without_participant_never_gets_one_to_many_search(): void
    {
        Workcode::create(['nama_workcode' => 'Rapat', 'kategori' => 'workcode', 'is_active' => true]);
        Participant::create(['nama' => 'A', 'nis_nip' => '1', 'face_descriptor' => $this->vector(0.1), 'face_status' => 'approved']);
        $user = User::factory()->create(['role' => 'participant', 'participant_id' => null]);

        $this->actingAs($user)->postJson(route('face.match'), ['descriptor' => $this->vector(0.1)])
            ->assertForbidden()
            ->assertJsonPath('status', 'face_not_registered');
    }

    public function test_repeated_face_failures_lock_participant_temporarily(): void
    {
        Workcode::create(['nama_workcode' => 'Rapat', 'kategori' => 'workcode', 'is_active' => true]);
        [, $user] = $this->participantUser(['face_descriptor' => $this->vector(0.1), 'face_status' => 'approved']);

        for ($i = 0; $i < config('attendance.face.max_failures'); $i++) {
            $this->actingAs($user)->postJson(route('face.match'), ['descriptor' => $this->vector(0.4)])->assertNotFound();
        }

        // Terkunci: wajah benar pun ditolak sementara, tanpa membocorkan jarak.
        $locked = $this->actingAs($user)->postJson(route('face.match'), ['descriptor' => $this->vector(0.1)]);
        $locked->assertStatus(429)->assertJsonPath('status', 'locked');
        $this->assertArrayNotHasKey('distance', $locked->json());

        Carbon::setTestNow(now()->addMinutes(config('attendance.face.lockout_minutes') + 1));
        $this->actingAs($user)->postJson(route('face.match'), ['descriptor' => $this->vector(0.1)])
            ->assertOk()
            ->assertJsonPath('status', 'success');
    }

    public function test_face_match_is_rate_limited_per_user(): void
    {
        config(['attendance.face.rate_per_minute' => 2]);
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->postJson(route('face.match'), ['descriptor' => $this->vector(0.1)]);
        $this->actingAs($admin)->postJson(route('face.match'), ['descriptor' => $this->vector(0.1)]);
        $this->actingAs($admin)->postJson(route('face.match'), ['descriptor' => $this->vector(0.1)])->assertStatus(429);
    }

    // ── 2.2 Lookup, search, QR ──────────────────────────────────────

    public function test_public_participant_lookup_and_search_are_removed(): void
    {
        $this->getJson('/api/participants/lookup?query=Peserta')->assertNotFound();
        $this->getJson('/api/participants/search?query=Peserta')->assertNotFound();
    }

    public function test_personal_qr_is_only_for_admin_or_owner(): void
    {
        [$participant, $owner] = $this->participantUser();
        [, $other] = $this->participantUser(['nama' => 'Lain', 'nis_nip' => '2']);
        $admin = User::factory()->create(['role' => 'admin']);

        $routes = ['participants.qr', 'participants.download.svg', 'participants.download.png'];

        foreach ($routes as $routeName) {
            $this->get(route($routeName, $participant))->assertRedirect(); // tamu -> login
        }

        foreach ($routes as $routeName) {
            $url = route($routeName, $participant);
            $this->actingAs($other)->get($url)->assertForbidden();
            $this->actingAs($owner)->get($url)->assertOk();
            $this->actingAs($admin)->get($url)->assertOk();
        }
    }

    public function test_admin_can_reset_participant_qr_token(): void
    {
        [$participant] = $this->participantUser();
        $oldToken = $participant->qr_token;
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->post(route('participants.qr.regenerate', $participant))->assertRedirect();

        $this->assertNotSame($oldToken, $participant->fresh()->qr_token);
    }

    public function test_participant_serialization_never_contains_qr_token(): void
    {
        [$participant] = $this->participantUser();

        $this->assertArrayNotHasKey('qr_token', $participant->fresh()->toArray());
    }

    public function test_self_checkin_search_returns_minimal_masked_data(): void
    {
        $token = 'token-master-qr';
        Cache::put('active_workcode_token', $token, now()->endOfDay());
        Workcode::create(['nama_workcode' => 'Rapat', 'kategori' => 'workcode', 'is_active' => true]);
        $this->participantUser(['nama' => 'Budi Santoso', 'nis_nip' => '198001012006041001']);
        $search = fn (string $q) => $this->getJson(route('self-checkin.participants', ['token' => $token, 'query' => $q]));

        $search('Bu')->assertOk()->assertExactJson([]); // < 3 huruf
        $search('1980')->assertOk()->assertExactJson([]); // awalan NIP tidak bisa dipakai menebak

        $byName = $search('Budi')->assertOk()->json();
        $this->assertCount(1, $byName);
        $this->assertSame('••••••••••••••1001', $byName[0]['nis_nip']);
        $this->assertArrayNotHasKey('qr_token', $byName[0]);

        $this->assertCount(1, $search('198001012006041001')->json()); // NIP lengkap tetap bisa

        $this->getJson(route('self-checkin.participants', ['token' => 'salah', 'query' => 'Budi']))->assertForbidden();
    }

    public function test_self_checkin_response_does_not_leak_participant_secrets(): void
    {
        Storage::fake('private');
        $token = 'token-master-qr';
        Cache::put('active_workcode_token', $token, now()->endOfDay());
        Workcode::create(['nama_workcode' => 'Rapat', 'kategori' => 'workcode', 'is_active' => true]);
        [$participant] = $this->participantUser();

        $response = $this->postJson("/self-checkin/{$token}", [
            'participant_id' => $participant->id,
            'device_id' => 'dev-1',
            'signature' => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
        ])->assertOk()->assertJsonPath('status', 'success');

        $this->assertSame(['id', 'nama', 'nis_nip', 'status'], array_keys($response->json('participant')));
        $this->assertStringNotContainsString($participant->qr_token, $response->getContent());
        $this->assertStringNotContainsString('198001012006041001', $response->getContent());
    }

    public function test_signature_verification_requires_signed_url_and_hides_workcode_details(): void
    {
        $workcode = Workcode::create(['nama_workcode' => 'Rapat Pleno', 'kategori' => 'workcode', 'latitude' => -7.1, 'longitude' => 112.1]);

        $this->get("/verify-signature/{$workcode->id}")->assertForbidden();

        $this->get(URL::signedRoute('signature.verify', ['workcode' => $workcode->id]))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('workcode.nama_workcode', 'Rapat Pleno')
                ->missing('workcode.latitude')
                ->missing('workcode.longitude'));
    }

    // ── 2.4 Header keamanan ─────────────────────────────────────────

    public function test_security_headers_are_sent(): void
    {
        $response = $this->get('/');

        $response->assertHeader('X-Frame-Options', 'SAMEORIGIN')
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        $this->assertStringContainsString('camera=(self)', $response->headers->get('Permissions-Policy'));
        $this->assertStringContainsString("default-src 'self'", $response->headers->get('Content-Security-Policy-Report-Only'));
    }

    // ── 2.5 Sanctum ─────────────────────────────────────────────────

    public function test_api_tokens_expire_and_do_not_pile_up(): void
    {
        // Batas login 5/menit diuji terpisah; di sini fokus pada jumlah & masa berlaku token.
        $this->withoutMiddleware(ThrottleRequests::class);
        $user = User::factory()->create(['role' => 'participant', 'username' => 'guru1', 'password' => Hash::make('rahasia123')]);

        for ($i = 0; $i < 7; $i++) {
            $this->postJson('/api/v1/auth/login', ['login' => 'guru1', 'password' => 'rahasia123', 'device_name' => 'HP'])->assertOk();
            $this->app['auth']->forgetGuards();
        }
        $this->assertSame(5, $user->tokens()->count());

        $token = $this->postJson('/api/v1/auth/login', ['login' => 'guru1', 'password' => 'rahasia123', 'device_name' => 'HP'])->json('data.token');
        $this->app['auth']->forgetGuards();
        $this->withToken($token)->getJson('/api/v1/me')->assertOk();

        Carbon::setTestNow(now()->addMinutes(config('sanctum.expiration') + 1));
        $this->app['auth']->forgetGuards();
        $this->withToken($token)->getJson('/api/v1/me')->assertUnauthorized();
    }
}
