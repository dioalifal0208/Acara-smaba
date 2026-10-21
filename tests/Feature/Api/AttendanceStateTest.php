<?php

namespace Tests\Feature\Api;

use App\Models\Attendance;
use App\Models\Participant;
use App\Models\User;
use App\Models\Workcode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AttendanceStateTest extends TestCase
{
    use RefreshDatabase;

    public function test_participant_state_has_etag_and_refreshes_after_state_change(): void
    {
        $participant = Participant::create([
            'nama' => 'Peserta State',
            'nis_nip' => 'state-'.Str::random(8),
            'qr_token' => Str::uuid(),
            'face_descriptor' => array_fill(0, 128, 0.1),
            'face_status' => 'approved',
        ]);
        $user = User::factory()->create(['role' => 'participant', 'participant_id' => $participant->id]);
        Sanctum::actingAs($user, ['role:participant']);

        Workcode::create([
            'nama_workcode' => 'Workcode State',
            'kategori' => 'workcode',
            'is_active' => true,
        ]);

        $first = $this->getJson('/api/v1/me/state')
            ->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.workcode_aktif.nama_workcode', 'Workcode State')
            ->assertJsonPath('data.presensi_hari_ini', null)
            ->assertJsonPath('data.face.status', 'approved')
            ->assertJsonPath('data.face.ready', true)
            ->assertJsonPath('data.face.model', 'faceapi-resnet34-128')
            ->assertJsonPath('data.face.sample_count', 1)
            ->assertJsonPath('data.face.locked', false)
            ->assertJsonStructure([
                'data' => [
                    'server_time',
                    'state_version',
                    'attendance_ui',
                    'face' => ['status', 'ready', 'blocker', 'model', 'sample_count', 'can_enroll', 'locked', 'retry_after_seconds'],
                ],
            ]);

        $this->assertArrayNotHasKey('face_descriptor', $first->json('data.face'));
        $etag = $first->headers->get('ETag');
        $this->assertNotEmpty($etag);

        $this->getJson('/api/v1/me/state', ['If-None-Match' => $etag])
            ->assertStatus(304)
            ->assertHeader('ETag', $etag);

        $participant->update(['face_status' => 'pending']);

        $changed = $this->getJson('/api/v1/me/state', ['If-None-Match' => $etag])
            ->assertOk()
            ->assertJsonPath('data.face.status', 'pending')
            ->assertJsonPath('data.face.ready', false)
            ->assertJsonPath('data.face.blocker.status', 'face_pending');

        $this->assertNotSame($etag, $changed->headers->get('ETag'));
    }

    public function test_arrival_button_is_closed_on_a_device_already_used_by_another_account(): void
    {
        $workcode = Workcode::create([
            'nama_workcode' => 'Workcode HP',
            'kategori' => 'workcode',
            'is_active' => true,
        ]);
        $pemakaiSebelumnya = Participant::create([
            'nama' => 'Pemakai HP Sebelumnya',
            'nis_nip' => 'hp-'.Str::random(8),
            'qr_token' => Str::uuid(),
        ]);
        Attendance::create([
            'workcode_id' => $workcode->id,
            'participant_id' => $pemakaiSebelumnya->id,
            'tanggal' => now()->toDateString(),
            'waktu_hadir' => now(),
            'device_hash' => hash('sha256', 'instalasi-hp-1'),
            'status' => 'hadir',
        ]);

        $participant = Participant::create([
            'nama' => 'Peserta HP Sama',
            'nis_nip' => 'hp-'.Str::random(8),
            'qr_token' => Str::uuid(),
        ]);
        $user = User::factory()->create(['role' => 'participant', 'participant_id' => $participant->id]);
        Sanctum::actingAs($user, ['role:participant']);

        $this->getJson('/api/v1/me/state', ['X-Installation-Id' => 'instalasi-hp-1'])
            ->assertOk()
            ->assertJsonPath('data.attendance_ui.action', 'none')
            ->assertJsonPath('data.attendance_ui.reason', 'device_used')
            ->assertJsonPath('data.attendance_ui.message', 'Perangkat ini sudah digunakan untuk presensi pada workcode ini.');

        // HP lain, atau aplikasi lama yang tidak mengirim ID instalasi, tetap melihat tombol.
        $this->getJson('/api/v1/me/state', ['X-Installation-Id' => 'instalasi-hp-2'])
            ->assertJsonPath('data.attendance_ui.action', 'arrival');
        $this->getJson('/api/v1/me/state')
            ->assertJsonPath('data.attendance_ui.action', 'arrival');
    }

    public function test_me_includes_additive_face_state_for_participant(): void
    {
        $participant = Participant::create([
            'nama' => 'Peserta Profil',
            'nis_nip' => 'profile-'.Str::random(8),
            'qr_token' => Str::uuid(),
            'face_status' => 'none',
        ]);
        $user = User::factory()->create(['role' => 'participant', 'participant_id' => $participant->id]);
        Sanctum::actingAs($user, ['role:participant']);

        $response = $this->getJson('/api/v1/me')
            ->assertOk()
            ->assertJsonPath('data.user.participant.face.status', 'none')
            ->assertJsonPath('data.user.participant.face.ready', false)
            ->assertJsonPath('data.user.participant.face.blocker.status', 'face_not_registered');

        $this->assertArrayNotHasKey('face_descriptor', $response->json('data.user.participant.face'));
    }

    public function test_state_endpoint_rejects_non_participant(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']), ['role:admin']);

        $this->getJson('/api/v1/me/state')
            ->assertForbidden()
            ->assertJsonPath('status', 'error');
    }
}
