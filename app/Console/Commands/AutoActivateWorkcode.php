<?php

namespace App\Console\Commands;

use App\Models\Workcode;
use App\Services\FcmService;
use Illuminate\Console\Command;

class AutoActivateWorkcode extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'workcode:auto-activate';

    protected $description = 'Synchronize scheduled workcodes with their configured active time window.';

    /**
     * Status aktif kegiatan terjadwal sudah dihitung dari jadwalnya (Workcode::isEffectivelyActive).
     * Command ini menyamakan kolom is_active dengan jadwal itu dan mengirim push FCM tepat saat
     * kegiatan dibuka/ditutup, supaya aplikasi Android langsung memuat ulang.
     *
     * Hanya kegiatan terjadwal yang disentuh. Beberapa workcode boleh aktif bersamaan, jadi workcode
     * harian dan kegiatan tanpa jadwal tidak ikut dinonaktifkan saat kegiatan terjadwal dimulai.
     */
    public function handle(FcmService $fcmService)
    {
        $now = now();

        // Jam aktif tidak melewati tengah malam (validasi after:jam_aktif_mulai), jadi cukup
        // kegiatan hari ini dan kegiatan yang masih tercatat aktif.
        $scheduled = Workcode::where('kategori', 'workcode')
            ->whereNotNull('tanggal')
            ->whereNotNull('jam_aktif_mulai')
            ->whereNotNull('jam_aktif_selesai')
            ->where(fn ($query) => $query->where('is_active', true)->orWhereDate('tanggal', $now->toDateString()))
            ->get();

        $changed = 0;

        foreach ($scheduled as $workcode) {
            $shouldBeActive = $workcode->isWithinActiveWindow($now);

            if ($workcode->is_active === $shouldBeActive) {
                continue;
            }

            $workcode->update(['is_active' => $shouldBeActive]);
            $fcmService->sendWorkcodeUpdate($shouldBeActive ? 'activated' : 'deactivated', $workcode, [
                $shouldBeActive ? 'auto_activated' : 'auto_deactivated' => '1',
            ]);
            $changed++;

            $this->info(($shouldBeActive ? 'Workcode otomatis diaktifkan: ' : 'Workcode otomatis dinonaktifkan: ').$workcode->nama_workcode);
        }

        if ($changed === 0) {
            $this->info('Tidak ada perubahan status workcode terjadwal.');
        }

        // Stakeholder kegiatan hari ini otomatis tercatat hadir begitu jam aktif mulai tercapai.
        Workcode::where('kategori', 'workcode')
            ->whereDate('tanggal', $now->toDateString())
            ->whereHas('autoAttendees')
            ->get()
            ->each(fn (Workcode $workcode) => $workcode->syncAutoAttendance($now));

        return self::SUCCESS;
    }
}
