<?php

namespace App\Services;

use SimpleSoftwareIO\QrCode\Facades\QrCode;

class QrCodeService
{
    /**
     * Generate QR code SVG dari token (Default Hitam).
     */
    public function generate(string $token, int $size = 300): string
    {
        return QrCode::format('svg')
            ->size($size)
            ->errorCorrection('H')
            ->margin(1)
            ->color(0, 0, 0) // Hitam Pekat
            ->generate($token);
    }

    /**
     * Generate Master QR code SVG dengan Logo Sekolah di bagian tengah.
     */
    public function generateWithLogo(string $token, int $size = 400): string
    {
        $qrSvg = $this->generate($token, $size);

        // Logo sekolah di tengah QR dengan background bulat putih & border halus
        $logoSize = (int) round($size * 0.22); // 22% dari ukuran QR
        $logoPos = (int) round(($size - $logoSize) / 2);
        $circleRadius = (int) round(($logoSize / 2) + 4);
        $circleCenter = (int) round($size / 2);

        $logoPath = public_path('images/logo.png');
        $logoBase64 = '';
        if (file_exists($logoPath)) {
            $logoData = file_get_contents($logoPath);
            $logoBase64 = 'data:image/png;base64,' . base64_encode($logoData);
        } else {
            $logoBase64 = '/images/logo.png';
        }

        // Sisipkan elemen logo di tengah SVG
        $centerLogoSvg = <<<SVG
        <g id="center-school-logo">
            <circle cx="{$circleCenter}" cy="{$circleCenter}" r="{$circleRadius}" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
            <image href="{$logoBase64}" x="{$logoPos}" y="{$logoPos}" width="{$logoSize}" height="{$logoSize}" preserveAspectRatio="xMidYMid meet"/>
        </g>
        </svg>
        SVG;

        return str_replace('</svg>', $centerLogoSvg, $qrSvg);
    }

    /**
     * Generate QR code SVG dengan label nama dan NIS/NIP untuk cetak.
     */
    public function generateWithLabel(string $token, string $nama, string $nisNip, int $size = 300): string
    {
        $qrSvg = $this->generate($token, $size);

        // Wrap QR SVG dalam container dengan label
        $totalHeight = $size + 80;
        $fontSize = min(16, max(12, $size / 20));
        $subFontSize = $fontSize - 2;

        return <<<SVG
        <svg xmlns="http://www.w3.org/2000/svg" width="{$size}" height="{$totalHeight}" viewBox="0 0 {$size} {$totalHeight}">
            <rect width="{$size}" height="{$totalHeight}" fill="white" rx="8"/>
            <g transform="translate(0, 0)">
                {$qrSvg}
            </g>
            <text x="{($size/2)}" y="{($size + 30)}" text-anchor="middle" font-family="Arial, sans-serif" font-size="{$fontSize}" font-weight="bold" fill="#0f172a">{$nama}</text>
            <text x="{($size/2)}" y="{($size + 55)}" text-anchor="middle" font-family="Arial, sans-serif" font-size="{$subFontSize}" fill="#475569">{$nisNip}</text>
        </svg>
        SVG;
    }

    /**
     * Generate QR code sebagai PNG menggunakan SVG conversion.
     * Fallback: mengembalikan SVG jika Imagick tidak tersedia.
     */
    public function generatePng(string $token, int $size = 400): ?string
    {
        // Cek apakah extension Imagick tersedia untuk PNG conversion
        if (extension_loaded('imagick')) {
            return QrCode::format('png')
                ->size($size)
                ->errorCorrection('H')
                ->margin(1)
                ->color(0, 0, 0)
                ->generate($token);
        }

        return null;
    }
}
