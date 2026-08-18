<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\LeaveRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminLeaveController extends Controller
{
    public function index()
    {
        $leaveRequests = LeaveRequest::with(['participant', 'workcode'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($req) {
                return [
                    'id' => $req->id,
                    'participant_name' => $req->participant->nama ?? 'Unknown',
                    'participant_nip' => $req->participant->nis_nip ?? '-',
                    'workcode_name' => $req->workcode->nama_workcode ?? 'Unknown',
                    'tanggal' => $req->tanggal->format('d M Y'),
                    'tipe' => $req->tipe,
                    'alasan' => $req->alasan,
                    'bukti_url' => $req->bukti_path ? asset('storage/' . $req->bukti_path) : null,
                    'status_approval' => $req->status_approval,
                    'created_at' => $req->created_at->format('d M Y H:i'),
                ];
            });

        return Inertia::render('LeaveApprovals/Index', [
            'leaveRequests' => $leaveRequests,
        ]);
    }

    public function approve(LeaveRequest $leaveRequest)
    {
        if ($leaveRequest->status_approval !== 'pending') {
            return back()->with('error', 'Pengajuan ini sudah diproses sebelumnya.');
        }

        $leaveRequest->update(['status_approval' => 'approved']);

        $attendance = Attendance::where('workcode_id', $leaveRequest->workcode_id)
            ->where('participant_id', $leaveRequest->participant_id)
            ->whereDate('created_at', $leaveRequest->tanggal)
            ->first();

        if ($attendance) {
            $attendance->update([
                'status' => $leaveRequest->tipe,
                'leave_request_id' => $leaveRequest->id,
            ]);
        } else {
            Attendance::create([
                'workcode_id' => $leaveRequest->workcode_id,
                'participant_id' => $leaveRequest->participant_id,
                'waktu_hadir' => null, // Tidak hadir secara fisik
                'status' => $leaveRequest->tipe,
                'leave_request_id' => $leaveRequest->id,
                'created_at' => clone $leaveRequest->tanggal->setTime(8, 0, 0),
                'updated_at' => now(),
            ]);
        }

        return back()->with('success', 'Pengajuan berhasil disetujui.');
    }

    public function reject(LeaveRequest $leaveRequest)
    {
        if ($leaveRequest->status_approval !== 'pending') {
            return back()->with('error', 'Pengajuan ini sudah diproses sebelumnya.');
        }

        $leaveRequest->update(['status_approval' => 'rejected']);

        return back()->with('success', 'Pengajuan ditolak.');
    }
}
