<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\Participant;
use App\Models\User;
use App\Models\Workcode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class FaceRegistrationAndMatchTest extends TestCase
{
    use RefreshDatabase;

    /** Vector 128 dimensi dengan nilai dasar tertentu, ditambah sedikit variasi per sudut. */
    private function vector(float $base, float $jitter = 0.0): array
    {
        return array_map(fn ($i) => $base + ($i % 2 ? $jitter : -$jitter), range(0, 127));
    }

    private function enrollment(float $base = 0.1): array
    {
        return [$this->vector($base), $this->vector($base, 0.002), $this->vector($base, 0.004)]; // 3 sampel wajah depan
    }

    /** Vektor berbeda arah dari fixture default; tidak identik setelah normalisasi L2. */
    private function otherVector(float $jitter = 0.0): array
    {
        $vector = array_fill(0, 128, $jitter);
        $vector[0] = 1.0;

        return $vector;
    }

    private function otherEnrollment(): array
    {
        return [$this->otherVector(), $this->otherVector(0.001), $this->otherVector(0.002)];
    }

    private function participantUser(array $participantAttributes = []): array
    {
        $participant = Participant::create(array_merge([
            'nama' => 'Peserta Uji',
            'nis_nip' => (string) random_int(100000, 999999),
        ], $participantAttributes));
        $user = User::factory()->create(['role' => 'participant', 'participant_id' => $participant->id]);

        return [$participant, $user];
    }

    private function activateWorkcode(): Workcode
    {
        return Workcode::create(['nama_workcode' => 'Rapat', 'kategori' => 'workcode', 'is_active' => true]);
    }

    public function test_self_registration_requires_multiple_front_samples(): void
    {
        [$participant, $user] = $this->participantUser();

        $this->actingAs($user)
            ->postJson("/api/participants/{$participant->id}/face/self", ['descriptor' => $this->vector(0.1)])
            ->assertStatus(422)
            ->assertJsonValidationErrors('descriptor');

        $this->assertSame('none', $participant->fresh()->face_status ?? 'none');
    }

    public function test_self_registration_rejects_inconsistent_faces(): void
    {
        [$participant, $user] = $this->participantUser();
        $mixed = [$this->vector(0.1), $this->vector(0.1), $this->vector(0.3)];

        $this->actingAs($user)
            ->postJson("/api/participants/{$participant->id}/face/self", ['descriptor' => $mixed])
            ->assertStatus(422)
            ->assertJsonValidationErrors('descriptor');
    }

    public function test_self_registration_with_front_samples_is_pending(): void
    {
        [$participant, $user] = $this->participantUser();

        $this->actingAs($user)
            ->postJson("/api/participants/{$participant->id}/face/self", ['descriptor' => $this->enrollment()])
            ->assertOk();

        $participant->refresh();
        $this->assertSame('pending', $participant->face_status);
        $this->assertCount(3, $participant->face_descriptor);
    }

    public function test_participant_without_approved_face_gets_clear_message_and_never_matches_others(): void
    {
        $workcode = $this->activateWorkcode();
        // Peserta lain yang sudah approved dengan wajah identik dengan input.
        Participant::create(['nama' => 'Orang Lain', 'nis_nip' => '111', 'face_descriptor' => $this->enrollment(0.1), 'face_status' => 'approved']);

        foreach ([
            [['face_status' => 'none'], 'face_not_registered', 'belum terdaftar'],
            [['face_status' => 'pending', 'face_descriptor' => $this->enrollment(0.1)], 'face_pending', 'menunggu persetujuan admin'],
            [['face_status' => 'rejected'], 'face_rejected', 'ditolak'],
        ] as [$attributes, $status, $phrase]) {
            [, $user] = $this->participantUser($attributes);

            $response = $this->mobileSubmit($user, $this->vector(0.1));

            $response->assertForbidden()->assertJsonPath('status', $status);
            $this->assertStringContainsString($phrase, $response->json('message'));
        }

        $this->assertSame(0, Attendance::where('workcode_id', $workcode->id)->count());
    }

    public function test_approved_participant_matches_only_own_face(): void
    {
        $workcode = $this->activateWorkcode();
        Participant::create(['nama' => 'Orang Lain', 'nis_nip' => '111', 'face_descriptor' => $this->otherEnrollment(), 'face_status' => 'approved']);
        [$participant, $user] = $this->participantUser(['face_descriptor' => $this->enrollment(0.1), 'face_status' => 'approved']);

        // Wajah orang lain tidak boleh dicatat atas nama siapa pun.
        $this->mobileSubmit($user, $this->otherVector())
            ->assertStatus(400)
            ->assertJsonPath('status', 'face_mismatch');
        $this->assertSame(0, Attendance::count());

        // Setelah approved, wajah sendiri langsung bisa presensi.
        $this->mobileSubmit($user, $this->vector(0.1, 0.003))
            ->assertCreated()
            ->assertJsonPath('status', 'success');

        $this->assertSame(1, Attendance::where('workcode_id', $workcode->id)->where('participant_id', $participant->id)->count());
    }

    private function mobileSubmit(User $user, array $descriptor)
    {
        $this->app['auth']->forgetGuards();
        $token = $user->createToken('android', ['role:participant'])->plainTextToken;

        return $this->withHeaders([
            'Authorization' => "Bearer {$token}",
            'Idempotency-Key' => (string) Str::uuid(),
        ])->postJson('/api/v1/attendance', [
            'installation_id' => (string) Str::uuid(),
            'face_descriptor' => $descriptor,
        ]);
    }

    public function test_mobile_api_requires_approved_face_and_supports_multiple_samples(): void
    {
        $workcode = $this->activateWorkcode();
        [$participant, $user] = $this->participantUser(['face_descriptor' => $this->enrollment(0.1), 'face_status' => 'pending']);
        $token = $user->createToken('android', ['role:participant'])->plainTextToken;

        $submit = fn () => $this->withHeaders([
            'Authorization' => "Bearer {$token}",
            'Idempotency-Key' => (string) Str::uuid(),
        ])->postJson('/api/v1/attendance', [
            'installation_id' => (string) Str::uuid(),
            'face_descriptor' => $this->vector(0.1, 0.003),
        ]);

        $submit()->assertForbidden()->assertJsonPath('status', 'face_pending');

        $participant->update(['face_status' => 'approved']);
        $this->app['auth']->forgetGuards(); // request baru = user dimuat ulang, seperti di produksi
        $submit()->assertCreated()->assertJsonPath('status', 'success');

        $this->assertSame(1, Attendance::where('workcode_id', $workcode->id)->count());
    }
}
