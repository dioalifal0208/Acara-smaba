<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\LeaveRequest;
use Inertia\Inertia;

class AdminLeaveController extends Controller
{
    public function index()
    {
        $leaveRequests = LeaveRequest::with(['participant', 'workcode'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($req) {
                $tanggalMulai = $req->tanggal->format('d M Y');
                $tanggalSelesai = $req->tanggal_selesai?->format('d M Y');

                return [
                    'id' => $req->id,
                    'participant_name' => $req->participant->nama ?? 'Unknown',
                    'participant_nip' => $req->participant->nis_nip ?? '-',
                    'workcode_name' => $req->workcode->nama_workcode ?? 'Unknown',
                    'tanggal' => $tanggalSelesai ? "{$tanggalMulai} s.d. {$tanggalSelesai}" : $tanggalMulai,
                    'kategori' => 'Izin',
                    'tipe_izin' => $req->tipe_izin,
                    'tipe_izin_label' => $this->tipeIzinLabel($req->tipe_izin),
                    'jenis_izin' => $req->jenis_izin,
                    'jenis_izin_label' => $this->jenisIzinLabel($req->jenis_izin),
                    'keterangan' => $req->keterangan ?? $req->alasan,
                    'bukti_url' => $req->bukti_path ? asset('storage/'.$req->bukti_path) : null,
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

        if ($leaveRequest->tipe_izin === 'tidak_absen_pulang') {
            return back()->with('success', 'Pengajuan izin tidak absen pulang berhasil disetujui.');
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

    private function tipeIzinLabel(?string $tipeIzin): string
    {
        return match ($tipeIzin) {
            'izin_penuh' => 'Izin penuh',
            'tidak_absen_datang' => 'Tidak absen datang',
            'tidak_absen_pulang' => 'Tidak absen pulang',
            default => 'Izin',
        };
    }

    private function jenisIzinLabel(?string $jenisIzin): ?string
    {
        return match ($jenisIzin) {
            'izin_sakit' => 'Izin sakit',
            'force_majeure' => 'Force majeure',
            'tidak_masuk_kerja_dengan_keterangan' => 'Tidak masuk kerja dengan keterangan',
            'perjalanan_dinas_dalam_kota' => 'Perjalanan dinas dalam kota',
            'perjalanan_dinas_luar_kota' => 'Perjalanan dinas luar kota',
            'cuti' => 'Cuti',
            'diklat_dan_pelatihan' => 'Diklat dan pelatihan',
            default => null,
        };
    }
}
