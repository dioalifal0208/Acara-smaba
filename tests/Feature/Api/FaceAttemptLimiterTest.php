<?php

namespace Tests\Feature\Api;

use App\Models\Participant;
use App\Models\User;
use App\Models\Workcode;
use App\Support\FaceAttemptLimiter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Tests\TestCase;

class FaceAttemptLimiterTest extends TestCase
{
    use RefreshDatabase;

    public function test_five_mobile_failures_lock_face_attendance_temporarily(): void
    {
        [$participant, , $token] = $this->participantWithApprovedFace();
        Workcode::create(['nama_workcode' => 'Workcode Lockout', 'kategori' => 'workcode', 'is_active' => true]);

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->mobileAttendance($token, $this->otherDescriptor())
                ->assertStatus(400)
                ->assertJsonPath('status', 'face_mismatch');
        }

        $this->assertTrue(FaceAttemptLimiter::isLocked($participant));
        $this->assertNotNull(FaceAttemptLimiter::retryAfterSeconds($participant));

        // Selama terkunci, wajah yang benar pun ditolak.
        $locked = $this->mobileAttendance($token, $this->descriptor())
            ->assertStatus(429)
            ->assertJsonPath('status', 'face_locked');
        $this->assertArrayNotHasKey('distance', $locked->json());

        // Setelah masa kunci habis, wajah yang benar diterima lagi.
        Carbon::setTestNow(now()->addMinutes(config('attendance.face.lockout_minutes') + 1));
        $this->mobileAttendance($token, $this->descriptor())
            ->assertCreated()
            ->assertJsonPath('status', 'success');
        Carbon::setTestNow();
    }

    public function test_successful_match_clears_prior_failures(): void
    {
        [$participant, $user, $token] = $this->participantWithApprovedFace();
        Workcode::create(['nama_workcode' => 'Workcode Reset', 'kategori' => 'workcode', 'is_active' => true]);

        for ($attempt = 0; $attempt < 2; $attempt++) {
            $this->mobileAttendance($token, $this->otherDescriptor())
                ->assertStatus(400)
                ->assertJsonPath('status', 'face_mismatch');
        }

        $this->mobileAttendance($token, $this->descriptor())
            ->assertCreated()
            ->assertJsonPath('status', 'success');

        for ($attempt = 0; $attempt < 4; $attempt++) {
            $this->mobileAttendance($token, $this->otherDescriptor())
                ->assertStatus(400)
                ->assertJsonPath('status', 'face_mismatch');
        }

        $this->assertFalse(FaceAttemptLimiter::isLocked($participant));
    }

    /** @return array{0: Participant, 1: User, 2: string} */
    private function participantWithApprovedFace(): array
    {
        $participant = Participant::create([
            'nama' => 'Peserta Lockout',
            'nis_nip' => 'lock-'.Str::random(8),
            'qr_token' => Str::uuid(),
            'face_descriptor' => $this->descriptor(),
            'face_status' => 'approved',
        ]);
        $user = User::factory()->create(['role' => 'participant', 'participant_id' => $participant->id]);
        $token = $user->createToken('lockout-test', ['role:participant'])->plainTextToken;

        return [$participant, $user, $token];
    }

    private function mobileAttendance(string $token, array $descriptor)
    {
        return $this->withToken($token)->postJson('/api/v1/attendance', [
            'installation_id' => Str::uuid()->toString(),
            'face_descriptor' => $descriptor,
        ], ['Idempotency-Key' => Str::uuid()->toString()]);
    }

    /** @return list<float> */
    private function descriptor(): array
    {
        return array_fill(0, 128, 0.1);
    }

    /** @return list<float> */
    private function otherDescriptor(): array
    {
        return array_pad([1.0], 128, 0.0);
    }
}
