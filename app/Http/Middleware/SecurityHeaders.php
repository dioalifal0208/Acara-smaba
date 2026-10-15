<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Header keamanan untuk semua halaman web.
 *
 * CSP masih mode Report-Only: pelanggaran hanya dilaporkan di console browser, tidak memblokir,
 * sampai daftar sumber (Vite, Google Maps, font, model AI wajah) terbukti lengkap.
 */
class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        $headers = $response->headers;

        $defaults = [
            'X-Frame-Options' => 'SAMEORIGIN',
            'X-Content-Type-Options' => 'nosniff',
            'Referrer-Policy' => 'strict-origin-when-cross-origin',
            // Kamera & lokasi hanya untuk halaman sendiri (presensi wajah, GPS); mikrofon tidak dipakai.
            'Permissions-Policy' => 'camera=(self), geolocation=(self), microphone=(), payment=(), usb=()',
            'Content-Security-Policy-Report-Only' => implode('; ', [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://maps.gstatic.com",
                "style-src 'self' 'unsafe-inline' https://fonts.bunny.net",
                "font-src 'self' data: https://fonts.bunny.net",
                "img-src 'self' data: blob: https://maps.googleapis.com https://maps.gstatic.com https://*.googleapis.com https://*.ggpht.com",
                "connect-src 'self' https://maps.googleapis.com https://*.googleapis.com",
                "media-src 'self' blob:",
                "worker-src 'self' blob:",
                "frame-ancestors 'self'",
                "base-uri 'self'",
                "form-action 'self'",
                "object-src 'none'",
            ]),
        ];

        foreach ($defaults as $name => $value) {
            if (! $headers->has($name)) {
                $headers->set($name, $value);
            }
        }

        // HSTS hanya di produksi HTTPS. Tanpa includeSubDomains: subdomain sekolah lain mungkin belum HTTPS.
        if (app()->environment('production') && $request->isSecure()) {
            $headers->set('Strict-Transport-Security', 'max-age=31536000');
        }

        return $response;
    }
}
