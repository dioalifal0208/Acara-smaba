<?php

namespace App\Http\Controllers;

use App\Support\PrivateFile;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Menyajikan file pribadi dari disk `private`. Route ini dilindungi middleware `signed`:
 * URL-nya hanya dibuat oleh server untuk admin atau pemilik data (lihat App\Support\PrivateFile).
 */
class PrivateFileController extends Controller
{
    public function show(string $type, int $id): StreamedResponse
    {
        $path = PrivateFile::pathFor($type, $id);

        if (! $path || ! PrivateFile::disk()->exists($path)) {
            abort(404);
        }

        $mime = PrivateFile::disk()->mimeType($path) ?: 'application/octet-stream';
        $inline = str_starts_with($mime, 'image/') || $mime === 'application/pdf';

        return PrivateFile::disk()->response($path, basename($path), [
            'Content-Type' => $inline ? $mime : 'application/octet-stream',
            'Cache-Control' => 'private, max-age=300, no-transform',
            'X-Content-Type-Options' => 'nosniff',
            'Content-Security-Policy' => "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox",
        ], $inline ? 'inline' : 'attachment');
    }
}
