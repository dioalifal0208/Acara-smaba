<?php

namespace App\Console\Commands;

use App\Models\Attendance;
use App\Models\Workcode;
use App\Support\Holidays;
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

        // Libur nasional: tidak ada kewajiban presensi, jadi tidak ada alpha/lupa absen.
        if (Holidays::isHoliday($today)) {
            $this->info('Hari ini libur nasional; status kehadiran tidak dihitung.');

            return;
        }

        // Cari workcode harian yang aktif
        $workcodes = Workcode::where('is_active', true)->where('kategori', 'harian')->get()
            ->filter(fn (Workcode $workcode) => $workcode->isEffectivelyActive());

        foreach ($workcodes as $workcode) {
            $hariAktif = $workcode->hari_aktif ?? [];
            if (! empty($hariAktif) && ! in_array($today->dayOfWeekIso, $hariAktif)) {
                continue; // Tidak aktif hari ini
            }

            // Batas hari ini mengikuti jadwal_per_hari, bukan hanya jam bawaan workcode.
            $schedule = $workcode->scheduleFor($today);
            // Lupa absen datang baru dicatat setelah toleransi terlambat habis, agar peserta yang datang
            // terlambat masih tercatat sebagai presensi datang (bukan dianggap presensi pulang).
            $jamDatangSelesai = $schedule['jam_datang_selesai']
                ? Workcode::withLateTolerance($today->copy()->setTimeFromTimeString($schedule['jam_datang_selesai']))->format('H:i:s')
                : null;
            $jamPulangSelesai = $schedule['jam_pulang_selesai'];

            // Hanya peserta yang wajib presensi di workcode ini (peserta terpilih, atau semua bila tidak dibatasi).
            $participantIds = $workcode->eligibleParticipants()->pluck('id');

            // Satu query untuk semua catatan hari ini; dicocokkan lewat kolom tanggal (bagian unique key).
            $attendances = Attendance::where('workcode_id', $workcode->id)
                ->whereDate('tanggal', $today)
                ->whereIn('participant_id', $participantIds)
                ->with('leaveRequest')
                ->get()
                ->keyBy('participant_id');

            foreach ($participantIds as $participantId) {
                $attendance = $attendances->get($participantId);

                // Skenario 1: Sudah lewat batas absen DATANG, belum ada record sama sekali
                if ($jamDatangSelesai && $currentTime > $jamDatangSelesai) {
                    if (! $attendance) {
                        $attendance = Attendance::create([
                            'workcode_id' => $workcode->id,
                            'participant_id' => $participantId,
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
                            'participant_id' => $participantId,
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
