<?php

namespace App\Support;

use App\Models\User;

/**
 * Kunci perangkat: satu akun peserta hanya bisa login di satu HP Android.
 *
 * Aplikasi mengirim ANDROID_ID (tetap sama saat aplikasi diinstal ulang, berubah saat reset pabrik).
 * IMEI tidak dipakai karena tidak bisa dibaca aplikasi biasa sejak Android 10.
 * Server hanya menyimpan HMAC-nya, jadi ID asli tidak pernah tersimpan di database.
 */
class DeviceLock
{
    public static function hash(string $deviceId): string
    {
        return hash_hmac('sha256', strtolower(trim($deviceId)), (string) config('app.key'));
    }

    /** Kunci hanya berlaku untuk akun peserta; admin bebas login di perangkat mana pun. */
    public static function appliesTo(User $user): bool
    {
        return $user->role === 'participant';
    }

    public static function matches(User $user, string $deviceHash): bool
    {
        return $user->device_id_hash !== null && hash_equals($user->device_id_hash, $deviceHash);
    }

    /**
     * Satu HP hanya untuk satu akun peserta: pemiliknya akun yang paling dulu terikat ke HP itu.
     * Mengembalikan akun pemilik bila bukan $user, atau null bila HP bebas / memang milik $user.
     */
    public static function boundToOther(User $user, string $deviceHash): ?User
    {
        $owner = User::where('role', 'participant')
            ->where('device_id_hash', $deviceHash)
            ->orderBy('device_bound_at')
            ->orderBy('id')
            ->first();

        return $owner && $owner->id !== $user->id ? $owner : null;
    }

    /** Ikat akun ke perangkat. Semua token lama dicabut supaya perangkat sebelumnya langsung keluar. */
    public static function bind(User $user, string $deviceHash, ?string $deviceModel): void
    {
        $user->forceFill([
            'device_id_hash' => $deviceHash,
            'device_model' => $deviceModel,
            'device_bound_at' => now(),
            'fcm_token' => null,
        ])->save();

        $user->tokens()->delete();
    }

    /** Lepas kunci (HP hilang/rusak): login berikutnya otomatis mendaftarkan perangkat baru. */
    public static function release(User $user): void
    {
        $user->forceFill([
            'device_id_hash' => null,
            'device_model' => null,
            'device_bound_at' => null,
            'fcm_token' => null,
        ])->save();

        $user->tokens()->delete();
    }
}
