<?php

namespace Tests\Feature;

use App\Models\LeaveRequest;
use App\Models\Participant;
use App\Models\PhotoChangeRequest;
use App\Models\User;
use App\Models\Workcode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminNotificationsTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_sees_every_pending_item_that_needs_action(): void
    {
        $budi = $this->participant('Budi');
        $sari = $this->participant('Sari', ['face_status' => 'pending', 'face_descriptor' => [0.1, 0.2]]);
        $photo = PhotoChangeRequest::create([
            'participant_id' => $budi->id,
            'photo_path' => 'photo-change-requests/budi.jpg',
            'face_descriptor' => [0.3, 0.4],
            'status' => 'pending',
        ]);
        $this->leave($budi);
        // Yang sudah diproses tidak muncul.
        PhotoChangeRequest::create(['participant_id' => $sari->id, 'photo_path' => 'x.jpg', 'status' => 'rejected']);

        $response = $this->actingAs($this->admin())->getJson(route('admin.notifications'))->assertOk();

        $response->assertJsonPath('total', 3)
            ->assertJsonPath('groups', [
                ['type' => 'photo_change', 'label' => 'Pengajuan ganti foto', 'count' => 1, 'url' => route('participants.index', ['review' => 'pending'])],
                ['type' => 'face_registration', 'label' => 'Pendaftaran wajah', 'count' => 1, 'url' => route('participants.index', ['review' => 'pending'])],
                ['type' => 'leave', 'label' => 'Pengajuan izin', 'count' => 1, 'url' => route('admin.leave.index')],
            ]);

        $items = collect($response->json('items'))->keyBy('id');
        $this->assertCount(3, $items);
        $this->assertSame('Budi mengajukan foto wajah baru.', $items["photo_change:{$photo->id}"]['body']);
        $this->assertSame(
            route('participants.index', ['review' => 'photo', 'participant' => $budi->id]),
            $items["photo_change:{$photo->id}"]['url'],
        );
        $this->assertSame(route('participants.index', ['review' => 'face', 'participant' => $sari->id]), $items["face_registration:{$sari->id}"]['url']);

        // Notifikasi tidak membawa data wajah, path file, atau hash perangkat.
        foreach (['face_descriptor', 'photo_path', 'budi.jpg'] as $secret) {
            $this->assertStringNotContainsString($secret, $response->getContent());
        }
    }

    public function test_item_disappears_once_admin_processes_it(): void
    {
        Storage::fake('private');
        $budi = $this->participant('Budi', ['face_status' => 'approved', 'photo_path' => 'faces/lama.jpg']);
        $photo = PhotoChangeRequest::create(['participant_id' => $budi->id, 'photo_path' => 'photo-change-requests/baru.jpg', 'status' => 'pending']);
        Storage::disk('private')->put($photo->photo_path, 'foto');
        $admin = $this->admin();

        $this->actingAs($admin)->getJson(route('admin.notifications'))->assertJsonPath('total', 1);

        $this->actingAs($admin)->post(route('photo-change-requests.approve', $photo))->assertRedirect();

        $this->actingAs($admin)->getJson(route('admin.notifications'))
            ->assertJsonPath('total', 0)
            ->assertJsonPath('items', []);
    }

    public function test_notifications_are_shared_with_admin_pages_only(): void
    {
        $budi = $this->participant('Budi');
        PhotoChangeRequest::create(['participant_id' => $budi->id, 'photo_path' => 'x.jpg', 'status' => 'pending']);

        $this->actingAs($this->admin())->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('adminNotifications.total', 1)
                ->where('adminNotifications.items.0.type', 'photo_change'));

        $participantUser = User::factory()->create(['role' => 'participant', 'participant_id' => $budi->id]);
        $this->actingAs($participantUser)->get(route('participant.dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('adminNotifications', null));

        $this->actingAs($participantUser)->getJson(route('admin.notifications'))->assertForbidden();
        auth()->logout();
        $this->getJson(route('admin.notifications'))->assertUnauthorized();
    }

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    private function participant(string $name, array $attributes = []): Participant
    {
        return Participant::create(array_merge([
            'nama' => $name,
            'nis_nip' => Str::uuid()->toString(),
            'qr_token' => Str::uuid()->toString(),
        ], $attributes));
    }

    private function leave(Participant $participant): LeaveRequest
    {
        $workcode = Workcode::create(['nama_workcode' => 'Harian', 'kategori' => 'harian', 'is_active' => true]);

        return LeaveRequest::create([
            'participant_id' => $participant->id,
            'workcode_id' => $workcode->id,
            'tanggal' => '2026-10-20',
            'tipe' => 'izin',
            'tipe_izin' => 'izin_penuh',
            'jenis_izin' => 'cuti',
            'keterangan' => 'Keperluan keluarga.',
            'alasan' => 'Keperluan keluarga.',
        ]);
    }
}
