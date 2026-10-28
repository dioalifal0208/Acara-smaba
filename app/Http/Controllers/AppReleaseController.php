<?php

namespace App\Http\Controllers;

use App\Models\AppRelease;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class AppReleaseController extends Controller
{
    /** Unduh APK terbaru (publik: halaman depan & layar "Perbarui aplikasi" di Android). */
    public function download(Request $request): BinaryFileResponse
    {
        $release = AppRelease::latestRelease();

        abort_if(! $release || ! is_file($release->path()), 404, 'Aplikasi Android belum tersedia.');

        // HEAD dipakai health check deploy; tidak dihitung sebagai unduhan.
        if (! $request->isMethod('HEAD')) {
            $release->increment('download_count');
        }

        return response()->download($release->path(), "Presensi-SMABA-v{$release->version_name}.apk", [
            'Content-Type' => 'application/vnd.android.package-archive',
        ]);
    }
}
