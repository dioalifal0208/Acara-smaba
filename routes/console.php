<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Jadwalkan pengecekan status absensi secara rutin (setiap 5 menit)
Schedule::command('attendance:calculate-alpha')->everyFiveMinutes()->withoutOverlapping();

// Sinkronkan aktivasi kegiatan berdasarkan tanggal dan jam aktifnya.
Schedule::command('workcode:auto-activate')->everyMinute()->withoutOverlapping();
