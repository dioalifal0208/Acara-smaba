<?php

namespace Tests\Feature;

use App\Models\Participant;
use App\Models\PhotoChangeRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PhotoChangeRequestManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_participant_list_marks_a_pending_photo_change_request(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => 'admin']);
        $participant = Participant::create([
            'nama' => 'Peserta Foto Baru',
            'nis_nip' => '198001012000011001',
        ]);
        $request = PhotoChangeRequest::create([
            'participant_id' => $participant->id,
            'photo_path' => 'photo-change-requests/peserta.jpg',
            'status' => 'pending',
        ]);
        Storage::disk('public')->put($request->photo_path, 'candidate-photo');

        $this->actingAs($admin)
            ->get(route('participants.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Participants/Index')
                ->where('participants.0.pending_photo_change_request.id', $request->id)
                ->where('participants.0.pending_photo_change_request.photo_url', url('/storage/'.$request->photo_path)));
    }

    public function test_admin_can_approve_pending_photo_change_from_participant_management(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => 'admin']);
        $participant = Participant::create([
            'nama' => 'Peserta Foto Baru',
            'nis_nip' => '198001012000011002',
            'photo_path' => 'faces/old.jpg',
            'face_status' => 'approved',
            'face_descriptor' => [0.1, 0.2],
        ]);
        Storage::disk('public')->put('faces/old.jpg', 'old-photo');
        $request = PhotoChangeRequest::create([
            'participant_id' => $participant->id,
            'photo_path' => 'photo-change-requests/new.jpg',
            'face_descriptor' => [0.8, 0.7],
            'status' => 'pending',
        ]);
        Storage::disk('public')->put($request->photo_path, 'candidate-photo');

        $this->actingAs($admin)
            ->post(route('photo-change-requests.approve', $request))
            ->assertRedirect();

        $participant->refresh();
        $request->refresh();
        $this->assertSame('approved', $request->status);
        $this->assertSame($admin->id, $request->reviewed_by);
        $this->assertSame('photo-change-requests/new.jpg', $participant->photo_path);
        $this->assertSame([0.8, 0.7], $participant->face_descriptor);
        Storage::disk('public')->assertMissing('faces/old.jpg');
    }
}
