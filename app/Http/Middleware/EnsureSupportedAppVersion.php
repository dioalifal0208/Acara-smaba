<?php

namespace App\Http\Middleware;

use App\Models\AppRelease;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Versi minimum aplikasi Android (AppRelease::minimumVersionCode). APK lama yang tidak mengirim
 * X-App-Version-Code dianggap versi 0. Versi yang dipakai peserta dicatat untuk halaman Perangkat.
 */
class EnsureSupportedAppVersion
{
    public function handle(Request $request, Closure $next): Response
    {
        $versionCode = (int) $request->header('X-App-Version-Code', '0');
        $minVersionCode = AppRelease::minimumVersionCode();

        if ($minVersionCode > 0 && $versionCode < $minVersionCode) {
            return response()->json([
                'status' => 'error',
                'code' => 'app_update_required',
                'message' => 'Versi aplikasi Anda sudah usang. Perbarui aplikasi untuk melanjutkan.',
                'data' => [
                    'min_version_code' => $minVersionCode,
                    'update_url' => AppRelease::downloadUrl(),
                ],
            ], 426);
        }

        $response = $next($request);

        // Setelah auth:sanctum berjalan, $request->user() berisi pemilik token.
        $user = $request->user();
        if ($versionCode > 0 && $user instanceof User && $user->role === 'participant') {
            $versionName = mb_substr((string) $request->header('X-App-Version-Name', ''), 0, 30) ?: null;

            if ($user->app_version_code !== $versionCode || $user->app_version_name !== $versionName) {
                $user->forceFill(['app_version_code' => $versionCode, 'app_version_name' => $versionName])->saveQuietly();
            }
        }

        return $response;
    }
}
