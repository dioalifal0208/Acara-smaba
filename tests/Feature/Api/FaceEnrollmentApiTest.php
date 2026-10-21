<?php

namespace Tests\Feature\Api;

use App\Models\Participant;
use App\Models\User;
use App\Services\FcmService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FaceEnrollmentApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('private');
    }

    public function test_participant_can_enroll_128_dimensional_face_and_enters_pending_state(): void
    {
        $participant = $this->actingParticipant();
        $fcm = $this->mock(FcmService::class);
        $fcm->shouldReceive('sendStateChanged')->once()->withArgs(function ($target, $reason) use ($participant): bool {
            return $target instanceof Participant && $target->is($participant) && $reason === 'face';
        });

        $response = $this->postJson('/api/v1/me/face-enrollment', [
            'model' => 'faceapi-resnet34-128',
            'descriptors' => $this->descriptors(),
            'photo' => $this->jpegDataUrl(),
        ]);

        $response->assertCreated()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.face.status', 'pending')
            ->assertJsonPath('data.face.ready', false)
            ->assertJsonPath('data.face.blocker.status', 'face_pending')
            ->assertJsonPath('data.face.sample_count', 3);

        $participant->refresh();
        $this->assertSame('pending', $participant->face_status);
        $this->assertSame($this->descriptors(), $participant->face_descriptor);
        $this->assertNotNull($participant->photo_path);
        Storage::disk('private')->assertExists($participant->photo_path);
        $this->assertArrayNotHasKey('face_descriptor', $response->json('data.face'));
    }

    public function test_enrollment_rejects_other_face_model_or_invalid_descriptor_data(): void
    {
        $this->actingParticipant();

        $this->postJson('/api/v1/me/face-enrollment', [
            'model' => 'legacy-facenet-512',
            'descriptors' => $this->descriptors(),
            'photo' => $this->jpegDataUrl(),
        ])->assertStatus(426)
            ->assertJsonPath('status', 'face_model_mismatch');

        $this->postJson('/api/v1/me/face-enrollment', [
            'model' => 'faceapi-resnet34-128',
            'descriptors' => [array_fill(0, 512, 0.1)],
            'photo' => $this->jpegDataUrl(),
        ])->assertUnprocessable()
            ->assertJsonPath('status', 'invalid_face_data');
    }

    public function test_approved_participant_cannot_overwrite_face_with_enrollment_endpoint(): void
    {
        $participant = $this->actingParticipant([
            'face_status' => 'approved',
            'face_descriptor' => $this->descriptor(),
        ]);

        $this->postJson('/api/v1/me/face-enrollment', [
            'model' => 'faceapi-resnet34-128',
            'descriptors' => $this->descriptors(),
            'photo' => $this->jpegDataUrl(),
        ])->assertConflict()
            ->assertJsonPath('status', 'face_already_registered');

        $this->assertSame('approved', $participant->fresh()->face_status);
        $this->assertSame($this->descriptor(), $participant->fresh()->face_descriptor);
    }

    private function actingParticipant(array $attributes = []): Participant
    {
        $participant = Participant::create(array_merge([
            'nama' => 'Peserta Enrollment',
            'nis_nip' => 'enroll-'.Str::random(8),
            'qr_token' => Str::uuid(),
            'face_status' => 'none',
        ], $attributes));
        $user = User::factory()->create(['role' => 'participant', 'participant_id' => $participant->id]);
        Sanctum::actingAs($user, ['role:participant']);

        return $participant;
    }

    /** @return list<float> */
    private function descriptor(float $jitter = 0.0): array
    {
        return array_map(fn (int $index) => 0.1 + ($index % 2 === 0 ? $jitter : -$jitter), range(0, 127));
    }

    /** @return list<list<float>> */
    private function descriptors(): array
    {
        return [$this->descriptor(), $this->descriptor(0.001), $this->descriptor(0.002)];
    }

    private function jpegDataUrl(): string
    {
        return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAF//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABBQJ//8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAwEBPwF//8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAgEBPwF//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQAGPwJ//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPyF//9k=';
    }
}
