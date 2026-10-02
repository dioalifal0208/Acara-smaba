<?php

namespace Tests\Feature;

use App\Models\LeaveRequest;
use App\Models\Participant;
use App\Models\User;
use App\Models\Workcode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LeaveHistoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_participant_can_only_view_their_own_leave_history(): void
    {
        $participant = Participant::create(['nama' => 'Peserta Pertama', 'nis_nip' => '1001']);
        $otherParticipant = Participant::create(['nama' => 'Peserta Lain', 'nis_nip' => '1002']);
        $user = User::factory()->create(['role' => 'participant', 'participant_id' => $participant->id]);
        $workcode = Workcode::create(['nama_workcode' => 'Presensi Harian', 'kategori' => 'harian']);

        $ownRequest = $this->leaveRequest($participant, $workcode, 'approved');
        $this->leaveRequest($otherParticipant, $workcode, 'pending');

        $this->actingAs($user)
            ->get(route('leave.history'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Participant/LeaveHistory')
                ->has('leaveRequests', 1)
                ->where('leaveRequests.0.id', $ownRequest->id)
                ->where('leaveRequests.0.status_approval', 'approved'));
    }

    private function leaveRequest(Participant $participant, Workcode $workcode, string $status): LeaveRequest
    {
        return LeaveRequest::create([
            'participant_id' => $participant->id,
            'workcode_id' => $workcode->id,
            'tanggal' => '2026-09-30',
            'tipe' => 'izin',
            'tipe_izin' => 'izin_penuh',
            'jenis_izin' => 'cuti',
            'keterangan' => 'Keperluan keluarga.',
            'alasan' => 'Keperluan keluarga.',
            'status_approval' => $status,
        ]);
    }
}
