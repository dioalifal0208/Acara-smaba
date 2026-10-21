<?php

namespace App\Support;

use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Foto wajah hasil scan saat presensi (datang & pulang), disimpan di disk privat sebagai bukti
 * untuk log laporan. Dikirim oleh aplikasi Android (POST /api/v1/attendance); website tidak
 * lagi menyediakan presensi wajah.
 */
final class AttendanceFaceCapture
{
    public const DIRECTORY = 'attendance-face-captures';

    /** Aturan validasi field `face_capture` (data URL JPEG base64, opsional). */
    public const RULES = ['nullable', 'string', 'max:1500000', 'regex:/^data:image\\/jpeg;base64,/'];

    public static function store(string $dataUrl): string
    {
        $capture = base64_decode(Str::after($dataUrl, ','), true);

        if ($capture === false || strlen($capture) < 50) {
            throw ValidationException::withMessages([
                'face_capture' => 'Foto presensi wajah tidak valid. Silakan coba lagi.',
            ]);
        }

        $path = self::DIRECTORY.'/'.Str::uuid().'.jpg';

        if (! PrivateFile::disk()->put($path, $capture)) {
            throw ValidationException::withMessages([
                'face_capture' => 'Foto presensi wajah gagal disimpan. Silakan coba lagi.',
            ]);
        }

        return $path;
    }

    public static function delete(?string $path): void
    {
        if ($path) {
            PrivateFile::disk()->delete($path);
        }
    }
}
