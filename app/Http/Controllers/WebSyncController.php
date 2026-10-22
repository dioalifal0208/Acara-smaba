<?php

namespace App\Http\Controllers;

use App\Support\WebSync;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Sinkronisasi Android → web (lihat App\Support\WebSync). */
class WebSyncController extends Controller
{
    /**
     * POST /api/v1/sync: peserta menarik layar ke bawah di aplikasi Android. Halaman admin web yang
     * sedang terbuka memuat ulang datanya dalam beberapa detik.
     */
    public function trigger(Request $request): JsonResponse
    {
        if (! $request->user()->tokenCan('role:participant')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses ditolak. Endpoint ini khusus untuk peserta.',
            ], 403);
        }

        WebSync::bump();

        return response()->json([
            'status' => 'success',
            'message' => 'Data tersinkron ke web.',
        ]);
    }

    /**
     * GET /sync/signal: versi sinyal untuk polling halaman admin. Tanpa session/database (routes/signal.php)
     * dan tanpa data pribadi, hanya angka versi dan waktu.
     */
    public function signal(): JsonResponse
    {
        return response()->json(WebSync::current())
            ->header('Cache-Control', 'no-store, max-age=0');
    }
}
