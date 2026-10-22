<?php

namespace App\Http\Middleware;

use App\Support\WebSync;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Setiap perubahan data yang berhasil dari aplikasi Android (presensi, izin, daftar wajah, login, ...)
 * menaikkan sinyal WebSync, sehingga halaman admin web langsung menampilkannya tanpa menunggu polling.
 */
class BumpWebSyncOnWrite
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (! $request->isMethodSafe() && $response->isSuccessful()) {
            WebSync::bump();
        }

        return $response;
    }
}
