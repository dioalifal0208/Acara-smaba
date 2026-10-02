<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\LeaveRequest;
use App\Models\Participant;
use App\Models\User;
use App\Models\Workcode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LeaveApprovalTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_open_the_leave_verification_center(): void
    {
        [$admin, $participant, $workcode] = $this->createApprovalContext();
        $leaveRequest = $this->createLeaveRequest($participant, $workcode, 'izin_penuh');

        $this->actingAs($admin)
            ->get(route('admin.leave.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('LeaveApprovals/Index')
                ->where('leaveRequests.0.id', $leaveRequest->id)
                ->where('leaveRequests.0.status_approval', 'pending'));
    }

    public function test_full_permission_approval_creates_an_izin_attendance_record(): void
    {
        [$admin, $participant, $workcode] = $this->createApprovalContext();
        $leaveRequest = $this->createLeaveRequest($participant, $workcode, 'izin_penuh');

        $this->actingAs($admin)
            ->post(route('admin.leave.approve', $leaveRequest))
            ->assertSessionHas('success');

        $this->assertDatabaseHas('attendances', [
            'participant_id' => $participant->id,
            'workcode_id' => $workcode->id,
            'leave_request_id' => $leaveRequest->id,
            'status' => 'izin',
        ]);
    }

    public function test_pending_permission_does_not_create_an_attendance_record_before_admin_approval(): void
    {
        [, $participant, $workcode] = $this->createApprovalContext();
        $leaveRequest = $this->createLeaveRequest($participant, $workcode, 'izin_penuh');

        $this->assertSame('pending', $leaveRequest->status_approval);
        $this->assertDatabaseMissing('attendances', [
            'participant_id' => $participant->id,
            'workcode_id' => $workcode->id,
            'leave_request_id' => $leaveRequest->id,
        ]);
    }

    public function test_checkout_permission_keeps_existing_checkin_as_hadir(): void
    {
        [$admin, $participant, $workcode] = $this->createApprovalContext();
        $leaveRequest = $this->createLeaveRequest($participant, $workcode, 'tidak_absen_pulang');
        $attendance = Attendance::create([
            'participant_id' => $participant->id,
            'workcode_id' => $workcode->id,
            'tanggal' => '2026-09-30',
            'waktu_hadir' => '2026-09-30 07:00:00',
            'status' => 'hadir',
            'created_at' => '2026-09-30 07:00:00',
            'updated_at' => '2026-09-30 07:00:00',
        ]);

        $this->actingAs($admin)
            ->post(route('admin.leave.approve', $leaveRequest))
            ->assertSessionHas('success');

        $attendance->refresh();

        $this->assertSame('hadir', $attendance->status);
        $this->assertSame($leaveRequest->id, $attendance->leave_request_id);
    }

    public function test_full_permission_approval_creates_attendance_for_every_date_in_the_range(): void
    {
        [$admin, $participant, $workcode] = $this->createApprovalContext();
        $leaveRequest = $this->createLeaveRequest($participant, $workcode, 'izin_penuh', '2026-10-02');

        $this->actingAs($admin)
            ->post(route('admin.leave.approve', $leaveRequest))
            ->assertSessionHas('success');

        $this->assertSame(3, Attendance::where('leave_request_id', $leaveRequest->id)->count());
    }

    private function createApprovalContext(): array
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $participant = Participant::create([
            'nama' => 'Peserta Uji',
            'nis_nip' => '1234567890',
        ]);
        $workcode = Workcode::create([
            'nama_workcode' => 'Presensi Harian',
            'kategori' => 'harian',
            'is_active' => true,
        ]);

        return [$admin, $participant, $workcode];
    }

    private function createLeaveRequest(Participant $participant, Workcode $workcode, string $tipeIzin, ?string $tanggalSelesai = null): LeaveRequest
    {
        return LeaveRequest::create([
            'participant_id' => $participant->id,
            'workcode_id' => $workcode->id,
            'tanggal' => '2026-09-30',
            'tanggal_selesai' => $tanggalSelesai,
            'tipe' => 'izin',
            'tipe_izin' => $tipeIzin,
            'jenis_izin' => 'cuti',
            'keterangan' => 'Keperluan keluarga.',
            'alasan' => 'Keperluan keluarga.',
        ]);
    }
}
