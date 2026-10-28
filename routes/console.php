<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Hosting (Hostinger) mematikan proc_open, sedangkan Schedule::command menjalankan artisan di proses
// terpisah dan selalu gagal di sana. Karena itu setiap tugas dijalankan di proses yang sama lewat
// Artisan::call. Cukup satu cron: `php artisan schedule:run` tiap 5 menit (atau tiap menit).

// Hapus token API yang sudah kedaluwarsa lebih dari 24 jam (masa berlaku: config/sanctum.php).
Schedule::call(fn () => Artisan::call('sanctum:prune-expired', ['--hours' => 24]))
    ->name('sanctum:prune-expired')
    ->daily();

// Jadwalkan pengecekan status absensi secara rutin (setiap 5 menit)
Schedule::call(fn () => Artisan::call('attendance:calculate-alpha'))
    ->name('attendance:calculate-alpha')
    ->everyFiveMinutes()
    ->withoutOverlapping();

// Samakan is_active kegiatan terjadwal dengan jam aktifnya dan kirim push FCM saat dibuka/ditutup.
// Bila cron produksi berjalan tiap 5 menit, push terlambat paling lama 5 menit; status presensinya
// sendiri tetap tepat waktu karena dihitung dari jadwal (Workcode::isEffectivelyActive).
Schedule::call(fn () => Artisan::call('workcode:auto-activate'))
    ->name('workcode:auto-activate')
    ->everyMinute()
    ->withoutOverlapping();

// Foto & tanda tangan presensi hanya disimpan attendance.media_retention_days (bawaan 30 hari).
Schedule::call(fn () => Artisan::call('attendance:prune-media'))
    ->name('attendance:prune-media')
    ->dailyAt('01:00');
