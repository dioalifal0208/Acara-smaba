<?php

namespace Tests\Feature;

use App\Models\FaceHistory;
use App\Models\Participant;
use App\Models\PhotoChangeRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\TestCase;

class FaceHistoryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('private');
    }

    public function test_approved_photo_change_is_recorded_and_old_photo_is_kept(): void
    {
        $participant = $this->participant(['face_status' => 'approved', 'photo_path' => 'faces/lama.jpg']);
        Storage::disk('private')->put('faces/lama.jpg', 'foto-lama');
        FaceHistory::create(['participant_id' => $participant->id, 'photo_path' => 'faces/lama.jpg', 'source' => 'registration', 'approved_at' => now()->subDay()]);

        $request = PhotoChangeRequest::create(['participant_id' => $participant->id, 'photo_path' => 'photo-change-requests/baru.jpg', 'status' => 'pending']);
        Storage::disk('private')->put($request->photo_path, 'foto-baru');

        $admin = $this->admin();
        $this->actingAs($admin)->post(route('photo-change-requests.approve', $request))->assertSessionHas('success');

        Storage::disk('private')->assertExists('faces/lama.jpg');
        $this->assertSame(2, $participant->faceHistories()->count());

        $items = $this->actingAs($admin)->getJson(route('participants.face-history', $participant))
            ->assertOk()
            ->assertJsonPath('participant.nama', 'Peserta Riwayat')
            ->json('items');

        $this->assertCount(2, $items);
        $this->assertSame('photo_change', $items[0]['source']);
        $this->assertSame('Ganti foto', $items[0]['source_label']);
        $this->assertSame($admin->name, $items[0]['approved_by']);
        $this->assertTrue($items[0]['is_active']);
        $this->assertNotNull($items[0]['photo_url']);
        $this->assertSame('registration', $items[1]['source']);
        $this->assertFalse($items[1]['is_active']);
        $this->assertNotNull($items[1]['photo_url'], 'Foto lama masih bisa dibuka dari riwayat');
        $this->assertStringNotContainsString('faces/lama.jpg', json_encode($items), 'Path file tidak dibocorkan');
    }

    public function test_face_registration_approval_and_admin_registration_are_recorded(): void
    {
        $participant = $this->participant([
            'face_status' => 'pending',
            'photo_path' => 'faces/daftar.jpg',
            'face_descriptor' => [array_fill(0, 128, 0.1)],
        ]);

        $this->actingAs($this->admin())->post(route('participants.face.approve', $participant))->assertSessionHas('success');

        $this->assertSame(['registration'], $participant->faceHistories()->pluck('source')->all());
        $this->assertSame('faces/daftar.jpg', $participant->faceHistories()->value('photo_path'));
    }

    public function test_replacing_or_deleting_face_keeps_photos_in_history(): void
    {
        $participant = $this->participant(['face_status' => 'approved', 'photo_path' => 'faces/aktif.jpg']);
        Storage::disk('private')->put('faces/aktif.jpg', 'foto');
        FaceHistory::create(['participant_id' => $participant->id, 'photo_path' => 'faces/aktif.jpg', 'source' => 'registration', 'approved_at' => now()]);

        $this->actingAs($this->admin())->deleteJson(route('participants.face.delete', $participant))->assertOk();

        $this->assertNull($participant->fresh()->photo_path);
        Storage::disk('private')->assertExists('faces/aktif.jpg');
    }

    public function test_history_photos_are_deleted_with_the_participant(): void
    {
        $participant = $this->participant(['face_status' => 'approved', 'photo_path' => 'faces/baru.jpg']);
        foreach (['faces/lama.jpg', 'faces/baru.jpg'] as $path) {
            Storage::disk('private')->put($path, 'foto');
            FaceHistory::create(['participant_id' => $participant->id, 'photo_path' => $path, 'source' => 'photo_change', 'approved_at' => now()]);
        }

        $this->actingAs($this->admin())->delete(route('participants.destroy', $participant))->assertRedirect();

        Storage::disk('private')->assertMissing('faces/lama.jpg');
        Storage::disk('private')->assertMissing('faces/baru.jpg');
        $this->assertSame(0, FaceHistory::count());
    }

    public function test_history_endpoint_is_admin_only(): void
    {
        $participant = $this->participant();
        $user = User::factory()->create(['role' => 'participant', 'participant_id' => $participant->id]);

        $this->actingAs($user)->getJson(route('participants.face-history', $participant))->assertForbidden();
    }

    private function participant(array $attributes = []): Participant
    {
        return Participant::create($attributes + [
            'nama' => 'Peserta Riwayat',
            'nis_nip' => 'riwayat-'.Str::random(8),
            'qr_token' => Str::uuid(),
        ]);
    }

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }
}
