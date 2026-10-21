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
        Storage::fake('private');
        [$user, $participant] = $this->participantUser();
        $participant->update([
            'face_status' => 'approved',
            'photo_path' => 'faces/active.jpg',
        ]);
        Storage::disk('private')->put('faces/active.jpg', 'active-photo');

        Sanctum::actingAs($user, ['role:participant']);

        $photoUrl = $this->getJson('/api/v1/me/photo')
            ->assertOk()
            ->assertJsonPath('data.face_status', 'approved')
            ->assertJsonPath('data.photo_change_request', null)
            ->json('data.photo_url');

        // Foto disajikan lewat URL bertanda tangan (bisa dimuat Android tanpa header Authorization).
        $this->assertStringContainsString("/files/participant-photo/{$participant->id}", $photoUrl);
        $this->assertStringContainsString('signature=', $photoUrl);
        $this->get($photoUrl)->assertOk()->assertStreamedContent('active-photo');

        $participant->update(['face_status' => 'pending']);

        $this->getJson('/api/v1/me')
            ->assertOk()
            ->assertJsonPath('data.user.participant.photo_url', null);
    }

    public function test_participant_can_submit_one_pending_photo_change_without_replacing_active_photo(): void
    {
        Storage::fake('private');
        [$user, $participant] = $this->participantUser();
        $participant->update([
            'face_status' => 'approved',
            'photo_path' => 'faces/approved.jpg',
            'face_descriptor' => array_fill(0, 128, 0.1),
        ]);
        Storage::disk('private')->put('faces/approved.jpg', 'approved-photo');

        Sanctum::actingAs($user, ['role:participant']);
        $key = '2ec2c422-f8af-4c7b-a045-e6a2d6dd2355'; // gitleaks:allow (UUID contoh Idempotency-Key, bukan rahasia)

        $response = $this->withHeaders(['Idempotency-Key' => $key])
            ->post('/api/v1/me/photo-change-requests', [
                'photo' => UploadedFile::fake()->image('wajah-baru.jpg', 320, 320),
                'face_descriptor' => array_fill(0, 128, 0.9),
            ]);

        $response->assertCreated()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.photo_change_request.status', 'pending');

        $changeRequest = PhotoChangeRequest::sole();
        $participant->refresh();
        $this->assertSame('faces/approved.jpg', $participant->photo_path);
        $this->assertSame('approved', $participant->face_status);
        $this->assertSame(array_fill(0, 128, 0.1), $participant->face_descriptor);
        Storage::disk('private')->assertExists($changeRequest->photo_path);

        $this->withHeaders(['Idempotency-Key' => $key])
            ->post('/api/v1/me/photo-change-requests', [
                'photo' => UploadedFile::fake()->image('wajah-baru.jpg', 320, 320),
                'face_descriptor' => array_fill(0, 128, 0.9),
            ])
            ->assertCreated();

        $this->assertSame(1, PhotoChangeRequest::count());

        $this->withHeaders(['Idempotency-Key' => 'b40b6bf7-2a21-45ae-ae91-7d5c76be1dc6']) // gitleaks:allow (UUID contoh)
            ->post('/api/v1/me/photo-change-requests', [
                'photo' => UploadedFile::fake()->image('wajah-lain.jpg', 320, 320),
                'face_descriptor' => array_fill(0, 128, 0.7),
            ])
            ->assertStatus(409);
    }

    public function test_admin_approval_activates_candidate_photo_and_descriptor(): void
    {
        Storage::fake('private');
        [, $participant] = $this->participantUser();
        $participant->update([
            'face_status' => 'approved',
            'photo_path' => 'faces/previous.jpg',
            'face_descriptor' => array_fill(0, 128, 0.1),
        ]);
        Storage::disk('private')->put('faces/previous.jpg', 'previous-photo');

        $changeRequest = PhotoChangeRequest::create([
            'participant_id' => $participant->id,
            'photo_path' => 'photo-change-requests/candidate.jpg',
            'face_descriptor' => array_fill(0, 128, 0.8),
            'status' => 'pending',
        ]);
        Storage::disk('private')->put($changeRequest->photo_path, 'candidate-photo');

        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['role:admin']);

        $this->patchJson('/api/v1/admin/photo-change-requests/'.$changeRequest->id.'/approve')
            ->assertOk()
            ->assertJsonPath('data.photo_change_request.status', 'approved');

        $participant->refresh();
        $changeRequest->refresh();
        $this->assertSame('approved', $participant->face_status);
        $this->assertSame('photo-change-requests/candidate.jpg', $participant->photo_path);
        $this->assertSame(array_fill(0, 128, 0.8), $participant->face_descriptor);
        $this->assertSame('approved', $changeRequest->status);
        $this->assertSame($admin->id, $changeRequest->reviewed_by);
        Storage::disk('private')->assertMissing('faces/previous.jpg');
        Storage::disk('private')->assertExists('photo-change-requests/candidate.jpg');
    }

    public function test_admin_rejection_keeps_active_photo_and_removes_candidate(): void
    {
        Storage::fake('private');
        [, $participant] = $this->participantUser();
        $participant->update([
            'face_status' => 'approved',
            'photo_path' => 'faces/approved.jpg',
        ]);
        Storage::disk('private')->put('faces/approved.jpg', 'approved-photo');

        $changeRequest = PhotoChangeRequest::create([
            'participant_id' => $participant->id,
            'photo_path' => 'photo-change-requests/rejected.jpg',
            'status' => 'pending',
        ]);
        Storage::disk('private')->put($changeRequest->photo_path, 'candidate-photo');

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
        Storage::disk('private')->assertExists('faces/approved.jpg');
        Storage::disk('private')->assertMissing('photo-change-requests/rejected.jpg');
    }

    public function test_photo_status_separates_active_photo_from_latest_change_request_through_review(): void
    {
        Storage::fake('private');
        [$user, $participant] = $this->participantUser();
        $participant->update([
            'face_status' => 'approved',
            'photo_path' => 'faces/approved.jpg',
            'face_descriptor' => array_fill(0, 128, 0.1),
        ]);
        Storage::disk('private')->put('faces/approved.jpg', 'approved-photo');
        $admin = User::factory()->create(['role' => 'admin']);

        Sanctum::actingAs($user, ['role:participant']);
        $this->getJson('/api/v1/me/photo')
            ->assertOk()
            ->assertJsonPath('data.photo_change_request', null)
            ->assertJsonPath('data.has_pending_photo_change', false);

        // Pengajuan pertama: pending, foto aktif tetap approved.
        $created = $this->withHeaders(['Idempotency-Key' => Str::uuid()->toString()])
            ->post('/api/v1/me/photo-change-requests', [
                'photo' => UploadedFile::fake()->image('baru.jpg', 320, 320),
                'face_descriptor' => array_fill(0, 128, 0.9),
            ])
            ->assertCreated()
            ->assertJsonPath('data.photo_change_request.status', 'pending')
            ->assertJsonPath('data.photo_change_request.reviewed_at', null)
            ->assertJsonPath('data.has_pending_photo_change', true);
        $requestId = $created->json('data.photo_change_request.id');
        $this->assertNotNull($created->json('data.photo_change_request.submitted_at'));
        $this->assertStringNotContainsString('face_descriptor', $created->getContent());

        $this->getJson('/api/v1/me/photo')
            ->assertOk()
            ->assertJsonPath('data.face_status', 'approved')
            ->assertJsonPath('data.active_photo.status', 'approved')
            ->assertJsonPath('data.photo_change_request.id', $requestId)
            ->assertJsonPath('data.photo_change_request.status', 'pending')
            ->assertJsonPath('data.has_pending_photo_change', true);
        $this->assertSame(array_fill(0, 128, 0.1), $participant->fresh()->face_descriptor);

        // Admin menolak: pengajuan terbaru rejected, foto aktif tidak berubah.
        Sanctum::actingAs($admin, ['role:admin']);
        $this->patchJson("/api/v1/admin/photo-change-requests/{$requestId}/reject")->assertOk();

        Sanctum::actingAs($user, ['role:participant']);
        $rejected = $this->getJson('/api/v1/me/photo')
            ->assertOk()
            ->assertJsonPath('data.active_photo.status', 'approved')
            ->assertJsonPath('data.photo_change_request.id', $requestId)
            ->assertJsonPath('data.photo_change_request.status', 'rejected')
            ->assertJsonPath('data.has_pending_photo_change', false);
        $this->assertNotNull($rejected->json('data.photo_change_request.reviewed_at'));
        $this->assertSame(array_fill(0, 128, 0.1), $participant->fresh()->face_descriptor);

        // Pengajuan kedua disetujui admin web: status pengajuan terbaru approved dan descriptor baru aktif.
        $second = $this->withHeaders(['Idempotency-Key' => Str::uuid()->toString()])
            ->post('/api/v1/me/photo-change-requests', [
                'photo' => UploadedFile::fake()->image('baru-lagi.jpg', 320, 320),
                'face_descriptor' => array_fill(0, 128, 0.7),
            ])
            ->assertCreated()
            ->json('data.photo_change_request.id');
        $this->assertNotSame($requestId, $second);

        $this->actingAs($admin)
            ->post(route('photo-change-requests.approve', $second))
            ->assertRedirect();

        Sanctum::actingAs($user, ['role:participant']);
        $this->getJson('/api/v1/me/photo')
            ->assertOk()
            ->assertJsonPath('data.active_photo.status', 'approved')
            ->assertJsonPath('data.photo_change_request.id', $second)
            ->assertJsonPath('data.photo_change_request.status', 'approved')
            ->assertJsonPath('data.has_pending_photo_change', false);
        $this->assertSame(array_fill(0, 128, 0.7), $participant->fresh()->face_descriptor);
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
