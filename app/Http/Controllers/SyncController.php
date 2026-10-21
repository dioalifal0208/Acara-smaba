<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\FcmService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class SyncController extends Controller
{
    /** Info sinkronisasi terakhir (waktu, admin, jumlah perangkat) untuk ditampilkan di tombol Sync. */
    public const LAST_SYNC_KEY = 'sync:last';

    private const COOLDOWN_KEY = 'sync:cooldown';

    /** Satu push topic membuat semua HP memuat ulang data; batasi agar server tidak dibanjiri request. */
    private const COOLDOWN_SECONDS = 30;

    /**
     * Sinkronisasi web → Android: kirim pesan FCM `workcode_sync` (action `full_sync`) ke semua HP.
     * Aplikasi menanggapinya dengan memuat ulang seluruh datanya dari API, jadi data di HP sama
     * dengan web. Halaman web memuat ulang datanya sendiri setelah respons ini.
     */
    public function push(Request $request, FcmService $fcmService): JsonResponse
    {
        $availableAt = now()->addSeconds(self::COOLDOWN_SECONDS)->timestamp;

        if (! Cache::add(self::COOLDOWN_KEY, $availableAt, self::COOLDOWN_SECONDS)) {
            $retryAfter = max(1, (int) Cache::get(self::COOLDOWN_KEY, $availableAt) - now()->timestamp);

            return response()->json([
                'status' => 'error',
                'message' => "Sinkronisasi baru saja dijalankan. Coba lagi dalam {$retryAfter} detik.",
                'retry_after_seconds' => $retryAfter,
            ], 429);
        }

        if (! $fcmService->sendFullSync()) {
            Cache::forget(self::COOLDOWN_KEY);

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengirim sinkronisasi ke aplikasi Android. Periksa konfigurasi Firebase (FCM).',
            ], 502);
        }

        $lastSync = [
            'at' => now()->toIso8601String(),
            'by' => $request->user()->name,
            'devices' => User::where('role', 'participant')->whereNotNull('fcm_token')->count(),
        ];
        Cache::forever(self::LAST_SYNC_KEY, $lastSync);

        return response()->json([
            'status' => 'success',
            'message' => "Sinkronisasi dikirim ke {$lastSync['devices']} perangkat Android. Data di HP diperbarui dalam ±15 detik.",
            'last_sync' => $lastSync,
        ]);
    }
}
