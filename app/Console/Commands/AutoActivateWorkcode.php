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

    public function handle(FcmService $fcmService)
    {
        $now = now();

        $expiredWorkcodes = Workcode::where('kategori', 'workcode')
            ->where('is_active', true)
            ->get()
            ->filter(fn (Workcode $workcode) => $workcode->hasScheduledActiveWindow()
                && ! $workcode->isWithinActiveWindow($now));

        foreach ($expiredWorkcodes as $workcode) {
            $workcode->update(['is_active' => false]);
            $fcmService->sendWorkcodeUpdate('deactivated', $workcode, [
                'auto_deactivated' => '1',
            ]);
            $this->info("Workcode otomatis dinonaktifkan: {$workcode->nama_workcode}");
        }

        $targetWorkcode = Workcode::where('kategori', 'workcode')
            ->whereDate('tanggal', $now->toDateString())
            ->whereNotNull('jam_aktif_mulai')
            ->whereNotNull('jam_aktif_selesai')
            ->orderByDesc('jam_aktif_mulai')
            ->orderByDesc('id')
            ->get()
            ->first(fn (Workcode $workcode) => $workcode->isWithinActiveWindow($now));

        if (! $targetWorkcode) {
            $this->info('Tidak ada workcode terjadwal yang sedang berada dalam jam aktif.');

            return self::SUCCESS;
        }

        $otherActiveWorkcodes = Workcode::where('is_active', true)
            ->where('id', '!=', $targetWorkcode->id)
            ->get();

        foreach ($otherActiveWorkcodes as $workcode) {
            $workcode->update(['is_active' => false]);
            $fcmService->sendWorkcodeUpdate('deactivated', $workcode, [
                'auto_deactivated' => '1',
            ]);
        }

        if (! $targetWorkcode->is_active) {
            $targetWorkcode->update(['is_active' => true]);
            $fcmService->sendWorkcodeUpdate('activated', $targetWorkcode, [
                'auto_activated' => '1',
            ]);

            $this->info("Workcode otomatis diaktifkan: {$targetWorkcode->nama_workcode}");
        } else {
            $this->info("Workcode tetap aktif sesuai jadwal: {$targetWorkcode->nama_workcode}");
        }

        return self::SUCCESS;
    }
}
