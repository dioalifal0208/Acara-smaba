<?php

namespace App\Http\Controllers;

use App\Support\PrivateFile;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Menyajikan file pribadi dari disk `private`. Route ini dilindungi middleware `signed`:
 * URL-nya hanya dibuat oleh server untuk admin atau pemilik data (lihat App\Support\PrivateFile).
 *
 * Route sengaja tanpa session/cookie/Inertia (routes/files.php): halaman admin bisa memuat
 * puluhan foto dalam satu detik, dan setiap request cukup satu query ringan ke database.
 * Browser menyimpan file sampai URL-nya kedaluwarsa; request ulang dijawab 304.
 */
class PrivateFileController extends Controller
{
    public function show(Request $request, string $type, int $id): Response
    {
        $path = PrivateFile::pathFor($type, $id);
        $disk = PrivateFile::disk();

        if (! $path || ! $disk->exists($path)) {
            abort(404);
        }

        $lastModified = $disk->lastModified($path);
        $etag = '"'.sha1($path.'|'.$lastModified).'"';
        $maxAge = max(0, (int) $request->query('expires') - now()->timestamp);
        $cacheHeaders = [
            'Cache-Control' => "private, max-age={$maxAge}, no-transform",
            'ETag' => $etag,
            'Last-Modified' => gmdate('D, d M Y H:i:s', $lastModified).' GMT',
            'X-Content-Type-Options' => 'nosniff',
        ];

        if (in_array($etag, $request->getETags(), true)) {
            return response('', 304, $cacheHeaders);
        }

        $mime = $disk->mimeType($path) ?: 'application/octet-stream';
        $inline = str_starts_with($mime, 'image/') || $mime === 'application/pdf';

        return $disk->response($path, basename($path), $cacheHeaders + [
            'Content-Type' => $inline ? $mime : 'application/octet-stream',
            'Content-Security-Policy' => "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox",
        ], $inline ? 'inline' : 'attachment');
    }
}
