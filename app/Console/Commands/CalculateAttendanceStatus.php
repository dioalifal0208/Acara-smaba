<?php

namespace App\Console\Commands;

use App\Models\Attendance;
use App\Models\Participant;
use App\Models\Workcode;
use Carbon\Carbon;
use Illuminate\Console\Command;

class CalculateAttendanceStatus extends Command
{
    protected $signature = 'attendance:calculate-alpha';

    protected $description = 'Hitung status Alpha dan Lupa Absen untuk event secara berkala';

    public function handle()
    {
        $today = Carbon::today();
        $currentTime = now()->format('H:i:s');

        // Cari workcode harian yang aktif
        $workcodes = Workcode::where('is_active', true)->where('kategori', 'harian')->get();

        foreach ($workcodes as $workcode) {
            $hariAktif = $workcode->hari_aktif ?? [];
            if (! empty($hariAktif) && ! in_array($today->dayOfWeekIso, $hariAktif)) {
                continue; // Tidak aktif hari ini
            }

            $jamDatangSelesai = $workcode->jam_datang_selesai;
            $jamPulangSelesai = $workcode->jam_pulang_selesai;

            $participants = Participant::all();

            foreach ($participants as $participant) {
                $attendance = Attendance::where('workcode_id', $workcode->id)
                    ->where('participant_id', $participant->id)
                    ->whereDate('created_at', $today)
                    ->with('leaveRequest')
                    ->first();

                // Skenario 1: Sudah lewat batas absen DATANG, belum ada record sama sekali
                if ($jamDatangSelesai && $currentTime > $jamDatangSelesai) {
                    if (! $attendance) {
                        $attendance = Attendance::create([
                            'workcode_id' => $workcode->id,
                            'participant_id' => $participant->id,
                            'tanggal' => $today,
                            'status' => 'lupa_absen', // Lupa absen masuk
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }

                // Skenario 2: Sudah lewat batas absen PULANG (akhir hari)
                if ($jamPulangSelesai && $currentTime > $jamPulangSelesai) {
                    if ($attendance) {
                        $hasApprovedPulangPermission = $attendance->leaveRequest
                            && $attendance->leaveRequest->status_approval === 'approved'
                            && $attendance->leaveRequest->tipe_izin === 'tidak_absen_pulang';

                        if ($hasApprovedPulangPermission) {
                            continue;
                        }

                        // Jangan ubah jika status sudah izin/sakit
                        if (in_array($attendance->status, ['izin', 'sakit'])) {
                            continue;
                        }

                        // Jika dia tidak absen masuk DAN tidak absen pulang (sepanjang hari hilang)
                        if (is_null($attendance->waktu_hadir) && is_null($attendance->waktu_pulang)) {
                            if ($attendance->status !== 'alpha') {
                                $attendance->update(['status' => 'alpha']);
                            }
                        }
                        // Jika dia absen masuk tapi tidak absen pulang
                        elseif (! is_null($attendance->waktu_hadir) && is_null($attendance->waktu_pulang)) {
                            if ($attendance->status !== 'lupa_absen') {
                                $attendance->update(['status' => 'lupa_absen']);
                            }
                        }
                    } else {
                        // Jika karena suatu hal tidak ada record sama sekali di akhir hari
                        Attendance::create([
                            'workcode_id' => $workcode->id,
                            'participant_id' => $participant->id,
                            'tanggal' => $today,
                            'status' => 'alpha',
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }
            }
        }

        $this->info('Kalkulasi status kehadiran berkala selesai dieksekusi.');
    }
}
