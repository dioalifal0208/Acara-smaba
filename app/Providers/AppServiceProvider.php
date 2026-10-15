<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (config('app.env') === 'production' || str_starts_with(config('app.url'), 'https://')) {
            URL::forceScheme('https');
        }

        Vite::prefetch(concurrency: 3);

        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        // Presensi wajah web (scanner admin & peserta login). Dibatasi per pengguna, bukan per IP,
        // agar sekolah dengan satu IP publik (NAT) tidak saling memblokir saat ramai.
        RateLimiter::for('face-match', function (Request $request) {
            return Limit::perMinute(config('attendance.face.rate_per_minute'))->by('face-match|'.($request->user()?->id ?: $request->ip()));
        });

        RateLimiter::for('api-login', function (Request $request) {
            return Limit::perMinute(5)->by(strtolower($request->input('login', '')).'|'.$request->ip());
        });
    }
}
