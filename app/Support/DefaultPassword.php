<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

/**
 * Password awal akun peserta = NIS/NIP (ParticipantController::syncParticipantUser), dan NIP mudah
 * diketahui rekan kerja. Di website tidak ada kunci perangkat maupun face match, jadi selama password
 * awal masih dipakai peserta wajib menggantinya dulu (EnsurePasswordChanged).
 */
class DefaultPassword
{
    private const SESSION_KEY = 'default_password_check';

    public static function inUse(Request $request): bool
    {
        $user = $request->user();

        if (! $user instanceof User || $user->role !== 'participant' || ! $request->hasSession()) {
            return false;
        }

        $nisNip = $user->participant?->nis_nip;
        if (! $nisNip) {
            return false;
        }

        // Hash::check (bcrypt) mahal untuk tiap request: hasilnya disimpan di session dan dihitung ulang
        // hanya bila hash password berubah (peserta mengganti, atau admin mereset ke NIS/NIP).
        $fingerprint = hash('sha256', (string) $user->password);
        $cached = $request->session()->get(self::SESSION_KEY);
        if (is_array($cached) && ($cached['fingerprint'] ?? null) === $fingerprint) {
            return (bool) $cached['in_use'];
        }

        $inUse = Hash::check($nisNip, $user->password);
        $request->session()->put(self::SESSION_KEY, ['fingerprint' => $fingerprint, 'in_use' => $inUse]);

        return $inUse;
    }
}
