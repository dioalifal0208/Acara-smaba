<?php

namespace App\Http\Controllers;

use App\Models\LeaveRequest;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class LeaveRequestController extends Controller
{
    public function history(Request $request)
    {
        $participant = $request->user()->participant;

        if (! $participant) {
            abort(403, 'Akses riwayat izin hanya untuk peserta.');
        }

        $leaveRequests = LeaveRequest::query()
            ->with('workcode:id,nama_workcode')
            ->where('participant_id', $participant->id)
            ->latest()
            ->get()
            ->map(fn (LeaveRequest $leaveRequest) => $this->historyItem($leaveRequest));

        return Inertia::render('Participant/LeaveHistory', [
            'leaveRequests' => $leaveRequests,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'tipe_izin' => ['required', 'string', Rule::in(LeaveRequest::TIPE_IZIN)],
            'jenis_izin' => ['required', 'string', Rule::in(LeaveRequest::JENIS_IZIN)],
            'keterangan' => 'required|string|max:500',
            'dokumen' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'workcode_id' => 'required|exists:workcodes,id',
            'tanggal' => 'required|date_format:Y-m-d',
            'izin_lebih_dari_satu_hari' => 'nullable|boolean',
            'tanggal_selesai' => [
                Rule::requiredIf($request->boolean('izin_lebih_dari_satu_hari')),
                'nullable',
                'date_format:Y-m-d',
                'after:tanggal',
            ],
        ]);

        $participant = auth()->user()->participant;

        if (! $participant) {
            return back()->with('error', 'Akses ditolak. Anda bukan peserta.');
        }

        $tanggalMulai = $request->tanggal;
        $tanggalSelesai = $request->boolean('izin_lebih_dari_satu_hari')
            ? $request->tanggal_selesai
            : $tanggalMulai;

        // Cek tumpang tindih dengan pengajuan sebelumnya pada rentang tanggal yang sama.
        $existing = LeaveRequest::where('participant_id', $participant->id)
            ->where('workcode_id', $request->workcode_id)
            ->whereDate('tanggal', '<=', $tanggalSelesai)
            ->where(function ($query) use ($tanggalMulai) {
                $query->whereDate('tanggal_selesai', '>=', $tanggalMulai)
                    ->orWhere(function ($query) use ($tanggalMulai) {
                        $query->whereNull('tanggal_selesai')
                            ->whereDate('tanggal', '>=', $tanggalMulai);
                    });
            })
            ->first();

        if ($existing) {
            return back()->with('error', 'Anda sudah mengajukan izin untuk workcode ini pada tanggal tersebut.');
        }

        $path = $request->file('dokumen')->store('dokumen_izin', 'public');

        LeaveRequest::create([
            'participant_id' => $participant->id,
            'workcode_id' => $request->workcode_id,
            'tanggal' => $tanggalMulai,
            'tanggal_selesai' => $request->boolean('izin_lebih_dari_satu_hari')
                ? $tanggalSelesai
                : null,
            'tipe' => 'izin',
            'tipe_izin' => $request->tipe_izin,
            'jenis_izin' => $request->jenis_izin,
            'keterangan' => $request->keterangan,
            'alasan' => $request->keterangan,
            'bukti_path' => $path,
            'status_approval' => 'pending',
        ]);

        return back()->with('success', 'Pengajuan izin berhasil dikirim. Menunggu persetujuan admin.');
    }

    private function historyItem(LeaveRequest $leaveRequest): array
    {
        return [
            'id' => $leaveRequest->id,
            'workcode_name' => $leaveRequest->workcode?->nama_workcode ?? '-',
            'tanggal' => $leaveRequest->tanggal?->translatedFormat('d F Y'),
            'tanggal_selesai' => $leaveRequest->tanggal_selesai?->translatedFormat('d F Y'),
            'tipe_izin' => $leaveRequest->tipe_izin,
            'jenis_izin' => $leaveRequest->jenis_izin,
            'keterangan' => $leaveRequest->keterangan ?? $leaveRequest->alasan,
            'status_approval' => $leaveRequest->status_approval,
            'created_at' => $leaveRequest->created_at?->translatedFormat('d F Y H:i'),
        ];
    }
}
