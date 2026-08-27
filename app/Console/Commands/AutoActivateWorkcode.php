<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class AutoActivateWorkcode extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'workcode:auto-activate';
    protected $description = 'Automatically activate scheduled workcodes that fall on today.';

    public function handle()
    {
        $today = now()->toDateString();
        
        // Cari workcode yang kategorinya 'workcode', tidak aktif, dan tanggalnya hari ini
        $workcodesToActivate = \App\Models\Workcode::where('kategori', 'workcode')
            ->whereDate('tanggal', $today)
            ->where('is_active', false)
            ->get();

        if ($workcodesToActivate->isNotEmpty()) {
            // Nonaktifkan semua workcode yang sedang aktif
            \App\Models\Workcode::query()->update(['is_active' => false]);
            
            // Aktifkan salah satu workcode (yang terbaru atau bebas)
            $targetWorkcode = $workcodesToActivate->first();
            $targetWorkcode->update(['is_active' => true]);

            $this->info("Berhasil mengaktifkan workcode: {$targetWorkcode->nama_workcode}");
        } else {
            $this->info("Tidak ada jadwal workcode yang perlu diaktifkan hari ini.");
        }
    }
}
