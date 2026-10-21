<?php

namespace App\Providers;

use App\Models\Attendance;
use App\Observers\AttendanceObserver;
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

        // Push FCM `state_changed` ke HP peserta saat presensi berubah di luar aplikasi Android.
        Attendance::observe(AttendanceObserver::class);

        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('api-login', function (Request $request) {
            return Limit::perMinute(5)->by(strtolower($request->input('login', '')).'|'.$request->ip());
        });
    }
}
