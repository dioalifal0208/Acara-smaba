<?php

namespace Tests\Feature;

use App\Models\LeaveRequest;
use App\Models\Participant;
use App\Models\User;
use App\Models\Workcode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ParticipantLeaveHistoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_sees_every_leave_of_one_participant_with_summary(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $participant = Participant::create(['nama' => 'Guru Izin', 'nis_nip' => '1001']);
        $other = Participant::create(['nama' => 'Guru Lain', 'nis_nip' => '1002']);
        $workcode = Workcode::create(['nama_workcode' => 'Presensi Harian', 'kategori' => 'harian', 'is_active' => true]);

        $approved = $this->leave($participant, $workcode, ['tanggal' => '2026-09-29', 'tanggal_selesai' => '2026-10-01', 'status_approval' => 'approved'], '2026-09-28 08:00:00');
        $rejected = $this->leave($participant, $workcode, ['tanggal' => '2026-10-05', 'status_approval' => 'rejected', 'alasan_penolakan' => 'Dokumen tidak terbaca'], '2026-10-04 08:00:00');
        $pending = $this->leave($participant, $workcode, ['tanggal' => '2026-10-20'], '2026-10-19 08:00:00');
        $this->leave($other, $workcode, ['tanggal' => '2026-10-20'], '2026-10-19 09:00:00');

        $this->actingAs($admin)
            ->getJson(route('participants.leave-history', $participant))
            ->assertOk()
            ->assertJsonPath('summary', ['pending' => 1, 'approved' => 1, 'rejected' => 1, 'approved_days' => 3])
            ->assertJsonCount(3, 'items')
            ->assertJsonPath('items.0.id', $pending->id)
            ->assertJsonPath('items.1.id', $rejected->id)
            ->assertJsonPath('items.1.alasan_penolakan', 'Dokumen tidak terbaca')
            ->assertJsonPath('items.2.id', $approved->id)
            ->assertJsonPath('items.2.days', 3)
            ->assertJsonPath('items.2.months', ['2026-09', '2026-10'])
            ->assertJsonPath('items.2.tipe_izin_label', 'Izin penuh')
            ->assertJsonPath('items.2.jenis_izin_label', 'Cuti');
    }

    public function test_participants_cannot_read_leave_history_of_others(): void
    {
        $participant = Participant::create(['nama' => 'Guru Izin', 'nis_nip' => '1001']);
        $user = User::factory()->create(['role' => 'participant']);

        $this->actingAs($user)->getJson(route('participants.leave-history', $participant))->assertForbidden();
    }

    public function test_leave_page_opens_the_requested_leave(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $participant = Participant::create(['nama' => 'Guru Izin', 'nis_nip' => '1001']);
        $workcode = Workcode::create(['nama_workcode' => 'Presensi Harian', 'kategori' => 'harian', 'is_active' => true]);
        $leave = $this->leave($participant, $workcode, ['tanggal' => '2026-10-20']);

        $this->actingAs($admin)
            ->get(route('admin.leave.index', ['id' => $leave->id]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('initialId', $leave->id)
                ->where('leaveRequests.0.participant_id', $participant->id)
                ->where('leaveRequests.0.months', ['2026-10']));
    }

    private function leave(Participant $participant, Workcode $workcode, array $attributes, ?string $createdAt = null): LeaveRequest
    {
        $leave = LeaveRequest::create($attributes + [
            'participant_id' => $participant->id,
            'workcode_id' => $workcode->id,
            'tipe' => 'izin',
            'tipe_izin' => 'izin_penuh',
            'jenis_izin' => 'cuti',
            'keterangan' => 'Keperluan keluarga.',
            'alasan' => 'Keperluan keluarga.',
        ]);

        if ($createdAt) {
            $leave->forceFill(['created_at' => $createdAt])->save();
        }

        return $leave;
    }
}
