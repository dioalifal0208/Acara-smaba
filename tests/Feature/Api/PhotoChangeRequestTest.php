<?php

namespace Tests\Feature\Api;

use App\Models\Participant;
use App\Models\PhotoChangeRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PhotoChangeRequestTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_participant_can_read_only_an_approved_active_photo(): void
    {
        Storage::fake('public');
        [$user, $participant] = $this->participantUser();
        $participant->update([
            'face_status' => 'approved',
            'photo_path' => 'faces/active.jpg',
        ]);
        Storage::disk('public')->put('faces/active.jpg', 'active-photo');

        Sanctum::actingAs($user, ['role:participant']);

        $this->getJson('/api/v1/me/photo')
            ->assertOk()
            ->assertJsonPath('data.face_status', 'approved')
            ->assertJsonPath('data.photo_url', url('/storage/faces/active.jpg'))
            ->assertJsonPath('data.photo_change_request', null);

        $participant->update(['face_status' => 'pending']);

        $this->getJson('/api/v1/me')
            ->assertOk()
            ->assertJsonPath('data.user.participant.photo_url', null);
    }

    public function test_participant_can_submit_one_pending_photo_change_without_replacing_active_photo(): void
    {
        Storage::fake('public');
        [$user, $participant] = $this->participantUser();
        $participant->update([
            'face_status' => 'approved',
            'photo_path' => 'faces/approved.jpg',
            'face_descriptor' => [0.1, 0.2],
        ]);
        Storage::disk('public')->put('faces/approved.jpg', 'approved-photo');

        Sanctum::actingAs($user, ['role:participant']);
        $key = '2ec2c422-f8af-4c7b-a045-e6a2d6dd2355';

        $response = $this->withHeaders(['Idempotency-Key' => $key])
            ->post('/api/v1/me/photo-change-requests', [
                'photo' => UploadedFile::fake()->image('wajah-baru.jpg', 320, 320),
                'face_descriptor' => [0.9, 0.8],
            ]);

        $response->assertCreated()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.photo_change_request.status', 'pending');

        $changeRequest = PhotoChangeRequest::sole();
        $participant->refresh();
        $this->assertSame('faces/approved.jpg', $participant->photo_path);
        $this->assertSame('approved', $participant->face_status);
        $this->assertSame([0.1, 0.2], $participant->face_descriptor);
        Storage::disk('public')->assertExists($changeRequest->photo_path);

        $this->withHeaders(['Idempotency-Key' => $key])
            ->post('/api/v1/me/photo-change-requests', [
                'photo' => UploadedFile::fake()->image('wajah-baru.jpg', 320, 320),
                'face_descriptor' => [0.9, 0.8],
            ])
            ->assertCreated();

        $this->assertSame(1, PhotoChangeRequest::count());

        $this->withHeaders(['Idempotency-Key' => 'b40b6bf7-2a21-45ae-ae91-7d5c76be1dc6'])
            ->post('/api/v1/me/photo-change-requests', [
                'photo' => UploadedFile::fake()->image('wajah-lain.jpg', 320, 320),
                'face_descriptor' => [0.7, 0.6],
            ])
            ->assertStatus(409);
    }

    public function test_admin_approval_activates_candidate_photo_and_descriptor(): void
    {
        Storage::fake('public');
        [, $participant] = $this->participantUser();
        $participant->update([
            'face_status' => 'approved',
            'photo_path' => 'faces/previous.jpg',
            'face_descriptor' => [0.1, 0.2],
        ]);
        Storage::disk('public')->put('faces/previous.jpg', 'previous-photo');

        $changeRequest = PhotoChangeRequest::create([
            'participant_id' => $participant->id,
            'photo_path' => 'photo-change-requests/candidate.jpg',
            'face_descriptor' => [0.8, 0.7],
            'status' => 'pending',
        ]);
        Storage::disk('public')->put($changeRequest->photo_path, 'candidate-photo');

        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['role:admin']);

        $this->patchJson('/api/v1/admin/photo-change-requests/'.$changeRequest->id.'/approve')
            ->assertOk()
            ->assertJsonPath('data.photo_change_request.status', 'approved');

        $participant->refresh();
        $changeRequest->refresh();
        $this->assertSame('approved', $participant->face_status);
        $this->assertSame('photo-change-requests/candidate.jpg', $participant->photo_path);
        $this->assertSame([0.8, 0.7], $participant->face_descriptor);
        $this->assertSame('approved', $changeRequest->status);
        $this->assertSame($admin->id, $changeRequest->reviewed_by);
        Storage::disk('public')->assertMissing('faces/previous.jpg');
        Storage::disk('public')->assertExists('photo-change-requests/candidate.jpg');
    }

    public function test_admin_rejection_keeps_active_photo_and_removes_candidate(): void
    {
        Storage::fake('public');
        [, $participant] = $this->participantUser();
        $participant->update([
            'face_status' => 'approved',
            'photo_path' => 'faces/approved.jpg',
        ]);
        Storage::disk('public')->put('faces/approved.jpg', 'approved-photo');

        $changeRequest = PhotoChangeRequest::create([
            'participant_id' => $participant->id,
            'photo_path' => 'photo-change-requests/rejected.jpg',
            'status' => 'pending',
        ]);
        Storage::disk('public')->put($changeRequest->photo_path, 'candidate-photo');

        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['role:admin']);

        $this->patchJson('/api/v1/admin/photo-change-requests/'.$changeRequest->id.'/reject', [
            'rejection_reason' => 'Wajah tidak terlihat jelas.',
        ])->assertOk()
            ->assertJsonPath('data.photo_change_request.status', 'rejected');

        $participant->refresh();
        $changeRequest->refresh();
        $this->assertSame('faces/approved.jpg', $participant->photo_path);
        $this->assertSame('approved', $participant->face_status);
        $this->assertSame('rejected', $changeRequest->status);
        $this->assertSame('Wajah tidak terlihat jelas.', $changeRequest->rejection_reason);
        Storage::disk('public')->assertExists('faces/approved.jpg');
        Storage::disk('public')->assertMissing('photo-change-requests/rejected.jpg');
    }

    public function test_non_participants_and_non_admins_cannot_use_other_roles_endpoints(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['role:admin']);

        $this->getJson('/api/v1/me/photo')->assertForbidden();

        [$participantUser] = $this->participantUser();
        Sanctum::actingAs($participantUser, ['role:participant']);

        $this->getJson('/api/v1/admin/photo-change-requests')->assertForbidden();
    }

    /** @return array{User, Participant} */
    private function participantUser(): array
    {
        $participant = Participant::create([
            'nama' => 'Peserta Uji',
            'nis_nip' => Str::uuid()->toString(),
            'qr_token' => Str::uuid()->toString(),
        ]);
        $user = User::factory()->create([
            'role' => 'participant',
            'participant_id' => $participant->id,
        ]);

        return [$user, $participant];
    }
}
