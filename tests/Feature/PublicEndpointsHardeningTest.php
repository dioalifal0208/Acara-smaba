<?php

namespace Tests\Feature;

use App\Models\Participant;
use App\Models\User;
use App\Models\Workcode;
use App\Services\SelfCheckInTokenService;
use App\Support\DeviceLock;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
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

    // ── 2.1 Presensi wajah web dihapus ──────────────────────────────

    public function test_web_face_attendance_endpoint_is_removed(): void
    {
        Workcode::create(['nama_workcode' => 'Rapat', 'kategori' => 'workcode', 'is_active' => true]);
        Participant::create(['nama' => 'A', 'nis_nip' => '1', 'face_descriptor' => $this->vector(0.1), 'face_status' => 'approved']);
        $admin = User::factory()->create(['role' => 'admin']);

        $this->assertFalse(Route::has('face.match'));
        $this->actingAs($admin)->postJson('/api/face/match', ['descriptor' => $this->vector(0.1)])->assertNotFound();
        $this->assertDatabaseCount('attendances', 0);
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
        $workcode = Workcode::create(['nama_workcode' => 'Rapat', 'kategori' => 'workcode', 'is_active' => true]);
        $token = app(SelfCheckInTokenService::class)->tokenFor($workcode);
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
        $workcode = Workcode::create(['nama_workcode' => 'Rapat', 'kategori' => 'workcode', 'is_active' => true]);
        $token = app(SelfCheckInTokenService::class)->tokenFor($workcode);
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

    public function test_api_tokens_never_expire_and_do_not_pile_up(): void
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

        // Tanpa batas waktu: peserta tetap masuk walau aplikasi lama tidak dibuka.
        Carbon::setTestNow(now()->addYear());
        $this->app['auth']->forgetGuards();
        $this->withToken($token)->getJson('/api/v1/me')->assertOk();

        // Token hanya berakhir bila dicabut: logout ...
        $this->withToken($token)->postJson('/api/v1/auth/logout')->assertOk();
        $this->app['auth']->forgetGuards();
        $this->withToken($token)->getJson('/api/v1/me')->assertUnauthorized();

        // ... atau admin melepas kunci perangkat (ganti perangkat lewat DeviceLock::bind juga mencabut semua token).
        $token = $this->postJson('/api/v1/auth/login', ['login' => 'guru1', 'password' => 'rahasia123', 'device_name' => 'HP'])->json('data.token');
        $this->app['auth']->forgetGuards();
        DeviceLock::release($user->fresh());
        $this->withToken($token)->getJson('/api/v1/me')->assertUnauthorized();
    }
}
