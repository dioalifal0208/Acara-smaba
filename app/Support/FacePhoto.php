<?php

namespace App\Support;

use App\Models\Participant;
use Illuminate\Support\Facades\Storage;

/**
 * Simpan foto wajah pendaftaran (data URL base64) ke disk privat. Dipakai bersama oleh
 * pendaftaran wajah web (admin & peserta) dan aplikasi Android (POST /api/v1/me/face-enrollment).
 */
final class FacePhoto
{
    /**
     * @param  string  $variant  penanda nama file, mis. '' (admin) atau '_self'
     * @return string|null path baru, atau null bila data URL bukan JPG/PNG yang valid
     */
    public static function storeDataUrl(Participant $participant, ?string $dataUrl, string $variant = ''): ?string
    {
        if (! $dataUrl || ! preg_match('/^data:image\/(\w+);base64,/', $dataUrl, $type)) {
            return null;
        }

        $type = strtolower($type[1]);
        if (! in_array($type, ['jpg', 'jpeg', 'png'], true)) {
            return null;
        }

        $binary = base64_decode(substr($dataUrl, strpos($dataUrl, ',') + 1));
        if ($binary === '') {
            return null;
        }

        $filename = 'faces/'.$participant->id.$variant.'_'.time().'.'.$type;
        Storage::disk('private')->put($filename, $binary);

        return $filename;
    }

    /** Hapus foto lama setelah foto baru tersimpan. */
    public static function deleteReplaced(?string $oldPath, ?string $newPath): void
    {
        if ($oldPath && $newPath && $oldPath !== $newPath) {
            Storage::disk('private')->delete($oldPath);
        }
    }
}
