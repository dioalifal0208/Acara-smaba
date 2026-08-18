<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Workcode;
use App\Models\Participant;
use App\Models\Attendance;
use Carbon\Carbon;

class CalculateAttendanceStatus extends Command
{
    protected $signature = 'attendance:calculate-alpha';
    protected $description = 'Hitung status Alpha dan Lupa Absen untuk event hari ini';

    public function handle()
    {
        $today = Carbon::today();
        
        // Find active events
        $workcodes = Workcode::where('is_active', true)->where('kategori', 'harian')->get();

        foreach ($workcodes as $workcode) {
            // Cek apakah hari ini event harian aktif
            if ($workcode->kategori === 'harian') {
                $hariAktif = $workcode->hari_aktif ?? [];
                if (!empty($hariAktif) && !in_array($today->dayOfWeekIso, $hariAktif)) {
                    continue; // Tidak aktif hari ini
                }
            }

            $participants = Participant::all();

            foreach ($participants as $participant) {
                // Cek data attendance untuk hari ini
                $attendance = Attendance::where('workcode_id', $workcode->id)
                    ->where('participant_id', $participant->id)
                    ->whereDate('created_at', $today)
                    ->first();

                if (!$attendance) {
                    // Tidak ada record absen, izin, atau sakit = Alpha
                    Attendance::create([
                        'workcode_id' => $workcode->id,
                        'participant_id' => $participant->id,
                        'status' => 'alpha',
                        'created_at' => clone $today->setTime(8, 0, 0),
                        'updated_at' => now(),
                    ]);
                } else {
                    // Jika ada record tapi event harian (ada datang & pulang)
                    if ($event->kategori === 'harian') {
                        // Jangan ubah jika status sudah izin/sakit
                        if (in_array($attendance->status, ['izin', 'sakit'])) {
                            continue;
                        }

                        // Jika salah satu waktu kosong = Lupa Absen
                        if (is_null($attendance->waktu_hadir) || is_null($attendance->waktu_pulang)) {
                            $attendance->update(['status' => 'lupa_absen']);
                        }
                    }
                }
            }
        }

        $this->info('Kalkulasi Alpha dan Lupa Absen selesai untuk hari ini.');
    }
}
