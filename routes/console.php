<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Hapus token API yang sudah kedaluwarsa lebih dari 24 jam (masa berlaku: config/sanctum.php).
Schedule::command('sanctum:prune-expired --hours=24')->daily();

// Jadwalkan pengecekan status absensi secara rutin (setiap 5 menit)
Schedule::command('attendance:calculate-alpha')->everyFiveMinutes()->withoutOverlapping();
