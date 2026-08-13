<?php

namespace App\Services;

use SimpleSoftwareIO\QrCode\Facades\QrCode;

class QrCodeService
{
    /**
     * Generate QR code SVG dari token.
     */
    public function generate(string $token, int $size = 300): string
    {
        return QrCode::format('svg')
            ->size($size)
            ->errorCorrection('H')
            ->margin(1)
            ->color(55, 48, 163) // Indigo-700
            ->generate($token);
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
            <text x="{($size/2)}" y="{($size + 30)}" text-anchor="middle" font-family="Arial, sans-serif" font-size="{$fontSize}" font-weight="bold" fill="#1e1b4b">{$nama}</text>
            <text x="{($size/2)}" y="{($size + 55)}" text-anchor="middle" font-family="Arial, sans-serif" font-size="{$subFontSize}" fill="#6366f1">{$nisNip}</text>
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
                ->color(55, 48, 163)
                ->generate($token);
        }

        return null;
    }
}
