<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Support\DeviceLock;
use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

/**
 * Kunci perangkat dipasang saat login (Api\V1\AuthController), jadi peserta yang login sebelum
 * device_id wajib masih memegang token tanpa HP terkunci, dan token tidak kedaluwarsa. Bila
 * DEVICE_LOCK_REQUIRE_ID aktif, token seperti itu dicabut dan aplikasi diminta login ulang (401):
 * login berikutnya mengirim device_id dan langsung mengunci akun ke HP tersebut.
 */
class EnsureDeviceBound
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (config('attendance.device_lock.require_device_id')
            && $user instanceof User
            && DeviceLock::appliesTo($user)
            && $user->device_id_hash === null) {
            $token = $user->currentAccessToken();
            if ($token instanceof PersonalAccessToken) {
                $token->delete();
            }

            return response()->json([
                'status' => 'error',
                'code' => 'device_not_bound',
                'message' => 'Sesi berakhir. Masuk kembali untuk mengunci akun ke HP ini.',
            ], 401);
        }

        return $next($request);
    }
}
