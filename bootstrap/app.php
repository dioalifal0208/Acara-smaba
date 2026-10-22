<?php

use App\Http\Middleware\AdminMiddleware;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\RoleMiddleware;
use App\Http\Middleware\SecurityHeaders;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        // File pribadi di luar grup `web`: tanpa session/cookie/Inertia (lihat routes/files.php).
        then: fn () => Route::group([], __DIR__.'/../routes/files.php'),
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            SecurityHeaders::class,
        ]);

        // Situs berada di belakang CDN Hostinger (hCDN) yang rentang IP-nya tidak dipublikasikan, jadi
        // semua proxy dipercaya agar request()->ip() = IP klien asli. Risiko sisa: server asal juga bisa
        // diakses langsung, sehingga X-Forwarded-For bisa dipalsukan untuk mengakali batas per-IP.
        // Proteksi utama (face match per akun, login per username, kunci perangkat) tidak bergantung IP.
        $middleware->trustProxies(at: '*');

        $middleware->alias([
            'admin' => AdminMiddleware::class,
            'role' => RoleMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(function (Request $request, Throwable $e) {
            if ($request->is('api/v1/*')) {
                return true;
            }

            return $request->expectsJson();
        });

        $exceptions->respond(function (Response $response) {
            if ($response->getStatusCode() === 419) {
                return back()->with([
                    'message' => 'Halaman telah kedaluwarsa karena tidak ada aktivitas. Silakan coba lagi.',
                ]);
            }

            return $response;
        });
    })->create();
