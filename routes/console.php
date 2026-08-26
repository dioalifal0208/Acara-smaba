<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Jadwalkan pengecekan status absensi secara rutin (setiap 5 menit)
Schedule::command('attendance:calculate-alpha')->everyFiveMinutes()->withoutOverlapping();

// Aktivasi otomatis workcode yang dijadwalkan pada hari ini
Schedule::call(function () {
    $today = now()->toDateString();
    $scheduledWorkcode = \App\Models\Workcode::where('tanggal', $today)
        ->orderBy('created_at', 'desc')
        ->first();
    
    if ($scheduledWorkcode) {
        \App\Models\Workcode::query()->update(['is_active' => false]);
        $scheduledWorkcode->update(['is_active' => true]);
    }
})->dailyAt('00:00')->name('workcodes-activate-today')->withoutOverlapping();
