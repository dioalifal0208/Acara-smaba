<?php

namespace App\Http\Middleware;

use App\Support\DefaultPassword;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Peserta yang masih memakai password awal (NIS/NIP) hanya boleh membuka halaman Profil untuk
 * mengganti kata sandi, atau keluar. Aplikasi Android tidak terpengaruh (grup api).
 */
class EnsurePasswordChanged
{
    private const ALLOWED_ROUTES = ['profile.edit', 'password.update', 'logout'];

    public function handle(Request $request, Closure $next): Response
    {
        if ($request->routeIs(self::ALLOWED_ROUTES) || ! DefaultPassword::inUse($request)) {
            return $next($request);
        }

        $message = 'Ganti kata sandi awal (NIS/NIP) Anda dulu sebelum memakai website.';

        if ($request->expectsJson() && ! $request->header('X-Inertia')) {
            return response()->json(['message' => $message], 403);
        }

        return redirect()->route('profile.edit')->with('error', $message);
    }
}
