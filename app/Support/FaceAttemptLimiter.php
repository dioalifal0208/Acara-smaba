<?php

namespace App\Support;

use App\Models\Participant;
use Illuminate\Cache\RateLimiter;
use Illuminate\Support\Facades\Log;

/**
 * Kunci sementara presensi wajah per peserta setelah gagal berulang (anti coba-coba wajah/foto).
 * Dipakai oleh presensi wajah Android (POST /api/v1/attendance); setiap kegagalan dihitung per peserta,
 * bukan per perangkat.
 *
 * Konfigurasi: attendance.face.max_failures dalam failure_window_minutes -> kunci lockout_minutes.
 */
final class FaceAttemptLimiter
{
    private static function limiter(): RateLimiter
    {
        return app(RateLimiter::class);
    }

    /** Penghitung kegagalan wajah per peserta (jendela failure_window_minutes). */
    public static function failureKey(Participant $participant): string
    {
        return 'face-match-failures|'.$participant->id;
    }

    /** Kunci sementara presensi wajah per peserta (lockout_minutes). */
    public static function lockKey(Participant $participant): string
    {
        return 'face-match-lock|'.$participant->id;
    }

    public static function isLocked(Participant $participant): bool
    {
        return self::limiter()->tooManyAttempts(self::lockKey($participant), 1);
    }

    /** Sisa detik kunci, atau null bila tidak terkunci. */
    public static function retryAfterSeconds(Participant $participant): ?int
    {
        return self::isLocked($participant)
            ? max(1, (int) self::limiter()->availableIn(self::lockKey($participant)))
            : null;
    }

    /**
     * Catat satu kegagalan pencocokan. Mengembalikan true bila kegagalan ini mengaktifkan kunci.
     */
    public static function recordFailure(Participant $participant): bool
    {
        self::limiter()->hit(self::failureKey($participant), (int) config('attendance.face.failure_window_minutes') * 60);

        if (! self::limiter()->tooManyAttempts(self::failureKey($participant), (int) config('attendance.face.max_failures'))) {
            return false;
        }

        self::limiter()->hit(self::lockKey($participant), (int) config('attendance.face.lockout_minutes') * 60);
        self::limiter()->clear(self::failureKey($participant));
        Log::warning('Presensi wajah dikunci sementara setelah gagal berulang.', ['participant_id' => $participant->id]);

        return true;
    }

    /** Pencocokan berhasil: reset penghitung kegagalan. */
    public static function clearFailures(Participant $participant): void
    {
        self::limiter()->clear(self::failureKey($participant));
    }

    /**
     * Respons 429 yang sama untuk web dan Android.
     *
     * @return array{status: string, message: string, retry_after_seconds: int}
     */
    public static function lockedPayload(Participant $participant): array
    {
        $seconds = self::retryAfterSeconds($participant) ?? 1;
        $minutes = max(1, (int) ceil($seconds / 60));

        return [
            'status' => 'face_locked',
            'message' => "Terlalu banyak percobaan wajah yang gagal. Coba lagi dalam {$minutes} menit atau hubungi admin.",
            'retry_after_seconds' => $seconds,
        ];
    }
}
