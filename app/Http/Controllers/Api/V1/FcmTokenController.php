<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\FcmService;
use Illuminate\Http\Request;

class FcmTokenController extends Controller
{
    /**
     * Register atau update FCM token untuk user yang login.
     *
     * Dipanggil oleh aplikasi mobile saat:
     * - Pertama kali login
     * - Token FCM di-refresh oleh Firebase SDK
     */
    public function register(Request $request, FcmService $fcmService)
    {
        $request->validate([
            'token' => ['required', 'string', 'max:512'],
        ]);

        $user = $request->user();
        $newToken = $request->input('token');
        $oldToken = $user->fcm_token;

        // Update token di database
        $user->update(['fcm_token' => $newToken]);

        // Unsubscribe token lama jika berbeda
        if ($oldToken && $oldToken !== $newToken) {
            $fcmService->unsubscribeFromWorkcodeUpdates($oldToken);
        }

        // Subscribe token baru ke topic
        $fcmService->subscribeToWorkcodeUpdates($newToken);

        return response()->json([
            'status' => 'success',
            'message' => 'FCM token berhasil didaftarkan.',
        ]);
    }

    /**
     * Hapus FCM token (dipanggil saat logout).
     */
    public function unregister(Request $request, FcmService $fcmService)
    {
        $user = $request->user();
        $token = $user->fcm_token;

        if ($token) {
            $fcmService->unsubscribeFromWorkcodeUpdates($token);
            $user->update(['fcm_token' => null]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'FCM token berhasil dihapus.',
        ]);
    }
}
