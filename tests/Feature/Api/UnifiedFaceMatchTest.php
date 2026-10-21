<?php

namespace Tests\Feature\Api;

use App\Models\Attendance;
use App\Models\Participant;
use App\Models\User;
use App\Models\Workcode;
use App\Support\FaceDescriptor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Satu model & satu aturan pencocokan: wajah yang didaftarkan lewat web maupun Android dicocokkan
 * dengan batas yang sama saat presensi wajah di Android (satu-satunya jalur presensi wajah).
 */
class UnifiedFaceMatchTest extends TestCase
{
    use RefreshDatabase;

    public function test_android_accepts_and_rejects_at_the_threshold_boundary(): void
    {
        Workcode::create(['nama_workcode' => 'Rapat Terpadu', 'kategori' => 'workcode', 'is_active' => true]);
        // Descriptor tersimpan mentah (norma ±1.3 seperti face-api.js); input sengaja berskala lain.
        [, $user] = $this->participantUser($this->vectorAtL2Distance(0, 1.3));
        Sanctum::actingAs($user, ['role:participant']);

        $this->postJson('/api/v1/attendance', $this->payload($this->vectorAtL2Distance(0.451, 1.0)), ['Idempotency-Key' => Str::uuid()->toString()])
            ->assertStatus(400)
            ->assertJsonPath('status', 'face_mismatch');

        $this->assertSame(0, Attendance::count());

        $this->postJson('/api/v1/attendance', $this->payload($this->vectorAtL2Distance(0.449, 1.0)), ['Idempotency-Key' => Str::uuid()->toString()])
            ->assertCreated()
            ->assertJsonPath('status', 'success');

        $this->assertSame(1, Attendance::count());
    }

    public function test_face_enrolled_from_android_is_usable_after_admin_approval(): void
    {
        Storage::fake('private');
        Workcode::create(['nama_workcode' => 'Rapat Terpadu', 'kategori' => 'workcode', 'is_active' => true]);
        [$participant, $user] = $this->participantUser(null, 'none');
        $samples = [$this->vectorAtL2Distance(0, 1.3), $this->vectorAtL2Distance(0.05, 1.3), $this->vectorAtL2Distance(0.1, 1.3)];

        Sanctum::actingAs($user, ['role:participant']);
        $this->postJson('/api/v1/me/face-enrollment', ['model' => 'faceapi-resnet34-128', 'descriptors' => $samples])
            ->assertCreated()
            ->assertJsonPath('data.face.status', 'pending');

        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin)->post(route('participants.face.approve', $participant))->assertRedirect();
        $this->assertSame('approved', $participant->fresh()->face_status);

        // Token sungguhan: sesi admin web di atas tidak boleh terbawa ke request API peserta.
        $this->app['auth']->forgetGuards();
        $token = $user->createToken('unified-test', ['role:participant'])->plainTextToken;
        $this->withToken($token)
            ->postJson('/api/v1/attendance', $this->payload($this->vectorAtL2Distance(0.02, 1.0)), ['Idempotency-Key' => Str::uuid()->toString()])
            ->assertCreated()
            ->assertJsonPath('status', 'success');
    }

    public function test_transient_face_mismatch_is_reevaluated_on_retry_with_same_key(): void
    {
        Workcode::create(['nama_workcode' => 'Rapat Terpadu', 'kategori' => 'workcode', 'is_active' => true]);
        [, $user] = $this->participantUser($this->vectorAtL2Distance(0, 1.3));
        Sanctum::actingAs($user, ['role:participant']);
        $key = Str::uuid()->toString();
        $installationId = Str::uuid()->toString();

        $this->postJson('/api/v1/attendance', $this->payload($this->vectorAtL2Distance(0.9, 1.0), $installationId), ['Idempotency-Key' => $key])
            ->assertStatus(400)
            ->assertJsonPath('status', 'face_mismatch');
        $this->assertDatabaseMissing('api_idempotency_logs', ['idempotency_key' => $key]);

        // Kegagalan wajah tidak di-cache, jadi key yang sama dievaluasi ulang alih-alih memutar ulang kegagalan.
        $this->postJson('/api/v1/attendance', $this->payload($this->vectorAtL2Distance(0.1, 1.0), $installationId), ['Idempotency-Key' => $key])
            ->assertCreated()
            ->assertJsonPath('status', 'success');
    }

    private function vectorAtL2Distance(float $distance, float $scale): array
    {
        // Jarak antar vector satuan bersudut t adalah 2 sin(t/2).
        $angle = 2 * asin($distance / 2);

        return array_pad([cos($angle) * $scale, sin($angle) * $scale], FaceDescriptor::DIMENSIONS, 0.0);
    }

    private function participantUser(?array $descriptor, string $faceStatus = 'approved'): array
    {
        $participant = Participant::create([
            'nama' => 'Peserta Terpadu',
            'nis_nip' => 'unified-'.Str::random(8),
            'qr_token' => Str::uuid(),
            'face_descriptor' => $descriptor,
            'face_status' => $faceStatus,
        ]);
        $user = User::factory()->create(['role' => 'participant', 'participant_id' => $participant->id]);

        return [$participant, $user];
    }

    private function payload(array $descriptor, ?string $installationId = null): array
    {
        return [
            'latitude' => -6.1234,
            'longitude' => 106.1234,
            'accuracy' => 10,
            'device_timestamp' => now()->toIso8601String(),
            'installation_id' => $installationId ?? Str::uuid()->toString(),
            'face_descriptor' => $descriptor,
            'face_model' => 'faceapi-resnet34-128',
        ];
    }
}
