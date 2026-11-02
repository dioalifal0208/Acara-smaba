<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\LeaveRequest;
use App\Models\Participant;
use App\Services\FcmService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminLeaveController extends Controller
{
    public function index(Request $request)
    {
        $leaveRequests = LeaveRequest::with(['participant', 'workcode'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn (LeaveRequest $leaveRequest) => $leaveRequest->toAdminArray());

        return Inertia::render('LeaveApprovals/Index', [
            'leaveRequests' => $leaveRequests,
            // ?id= dari tombol "Tinjau di Perizinan" pada riwayat izin di detail peserta.
            'initialId' => $request->integer('id') ?: null,
        ]);
    }

    /** Riwayat izin satu peserta (semua status, terbaru di atas) untuk halaman detail peserta. */
    public function participantHistory(Participant $participant): JsonResponse
    {
        $leaveRequests = LeaveRequest::with(['participant', 'workcode'])
            ->where('participant_id', $participant->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'summary' => [
                'pending' => $leaveRequests->where('status_approval', 'pending')->count(),
                'approved' => $leaveRequests->where('status_approval', 'approved')->count(),
                'rejected' => $leaveRequests->where('status_approval', 'rejected')->count(),
                'approved_days' => $leaveRequests->where('status_approval', 'approved')->sum(fn (LeaveRequest $item) => $item->days()),
            ],
            'items' => $leaveRequests->map(fn (LeaveRequest $item) => $item->toAdminArray())->values(),
        ]);
    }

    public function approve(LeaveRequest $leaveRequest)
    {
        // Satu transaksi: status disetujui dan semua baris presensi izin tersimpan bersama, atau tidak
        // sama sekali. Baris dikunci agar klik ganda / dua admin tidak memproses pengajuan yang sama.
        $processed = DB::transaction(function () use ($leaveRequest) {
            $leaveRequest = LeaveRequest::lockForUpdate()->findOrFail($leaveRequest->id);

            if ($leaveRequest->status_approval !== 'pending') {
                return false;
            }

            $leaveRequest->update(['status_approval' => 'approved']);
            $this->recordLeaveAttendances($leaveRequest);
            // Push FCM dikirim setelah commit (FcmService memakai DB::afterCommit).
            $this->notifyParticipant($leaveRequest);

            return true;
        });

        if (! $processed) {
            return back()->with('error', 'Pengajuan ini sudah diproses sebelumnya.');
        }

        if ($leaveRequest->tipe_izin === 'tidak_absen_pulang') {
            return back()->with('success', 'Pengajuan izin tidak absen pulang berhasil disetujui.');
        }

        return back()->with('success', 'Pengajuan berhasil disetujui.');
    }

    public function reject(Request $request, LeaveRequest $leaveRequest)
    {
        // Alasan wajib: peserta melihatnya di riwayat izin agar tahu apa yang perlu diperbaiki.
        $validated = $request->validate([
            'alasan_penolakan' => 'required|string|max:500',
        ], [
            'alasan_penolakan.required' => 'Tulis alasan penolakan agar peserta tahu apa yang perlu diperbaiki.',
        ]);

        $processed = DB::transaction(function () use ($leaveRequest, $validated) {
            $leaveRequest = LeaveRequest::lockForUpdate()->findOrFail($leaveRequest->id);

            if ($leaveRequest->status_approval !== 'pending') {
                return false;
            }

            $leaveRequest->update(['status_approval' => 'rejected', 'alasan_penolakan' => trim($validated['alasan_penolakan'])]);
            $this->notifyParticipant($leaveRequest);

            return true;
        });

        if (! $processed) {
            return back()->with('error', 'Pengajuan ini sudah diproses sebelumnya.');
        }

        return back()->with('success', 'Pengajuan ditolak.');
    }

    /** Buat/perbarui baris presensi untuk setiap tanggal dalam rentang izin yang disetujui. */
    private function recordLeaveAttendances(LeaveRequest $leaveRequest): void
    {
        $tanggalMulai = $leaveRequest->tanggal->copy()->startOfDay();
        $tanggalSelesai = $leaveRequest->tanggal_selesai?->copy()->startOfDay() ?? $tanggalMulai->copy();

        for ($tanggal = $tanggalMulai->copy(); $tanggal->lte($tanggalSelesai); $tanggal->addDay()) {
            $attendance = Attendance::where('workcode_id', $leaveRequest->workcode_id)
                ->where('participant_id', $leaveRequest->participant_id)
                ->where('tanggal', $tanggal->toDateString())
                ->first();

            if ($leaveRequest->tipe_izin === 'tidak_absen_pulang') {
                if ($attendance) {
                    $attendance->update([
                        'status' => $attendance->waktu_hadir ? 'hadir' : $attendance->status,
                        'leave_request_id' => $leaveRequest->id,
                    ]);
                }

                continue;
            }

            if ($attendance) {
                $attendance->update([
                    'status' => 'izin',
                    'leave_request_id' => $leaveRequest->id,
                ]);
            } else {
                Attendance::create([
                    'workcode_id' => $leaveRequest->workcode_id,
                    'participant_id' => $leaveRequest->participant_id,
                    'tanggal' => $tanggal->toDateString(),
                    'waktu_hadir' => null, // Tidak hadir secara fisik
                    'status' => 'izin',
                    'leave_request_id' => $leaveRequest->id,
                    'created_at' => $tanggal->copy()->setTime(8, 0, 0),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    /** Push FCM `state_changed` (reason leave) ke HP peserta pemilik pengajuan. */
    private function notifyParticipant(LeaveRequest $leaveRequest): void
    {
        if ($participant = Participant::find($leaveRequest->participant_id)) {
            app(FcmService::class)->sendStateChanged($participant, 'leave');
        }
    }
}
