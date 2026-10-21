<?php

namespace App\Observers;

use App\Models\Attendance;
use App\Models\Participant;
use App\Services\FcmService;

/**
 * Presensi yang tercatat/berubah di luar aplikasi Android (scanner web, self check-in, input
 * manual admin, persetujuan izin) memicu push FCM `state_changed` (reason attendance) ke HP peserta,
 * agar tampilan aplikasi langsung diperbarui.
 *
 * Tidak berjalan dari console (mis. cron attendance:calculate-alpha) agar tidak mengirim push massal,
 * dan dimatikan sementara oleh API Android karena aplikasinya sudah menerima hasil dari respons.
 */
class AttendanceObserver
{
    private static bool $muted = false;

    /**
     * Jalankan callback tanpa push FCM presensi.
     *
     * @template T
     *
     * @param  callable(): T  $callback
     * @return T
     */
    public static function withoutStatePush(callable $callback): mixed
    {
        $previous = self::$muted;
        self::$muted = true;

        try {
            return $callback();
        } finally {
            self::$muted = $previous;
        }
    }

    public function created(Attendance $attendance): void
    {
        $this->push($attendance);
    }

    public function updated(Attendance $attendance): void
    {
        $this->push($attendance);
    }

    public function deleted(Attendance $attendance): void
    {
        $this->push($attendance);
    }

    private function push(Attendance $attendance): void
    {
        if (self::$muted || (app()->runningInConsole() && ! app()->runningUnitTests())) {
            return;
        }

        $participant = $attendance->relationLoaded('participant')
            ? $attendance->participant
            : Participant::find($attendance->participant_id);

        if ($participant) {
            app(FcmService::class)->sendStateChanged($participant, 'attendance');
        }
    }
}
