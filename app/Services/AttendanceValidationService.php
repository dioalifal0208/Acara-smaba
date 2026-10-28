<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\Participant;
use App\Models\Workcode;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

class AttendanceValidationService
{
    public function validateWorkcodeActive(?Workcode $workcode, bool $isMobileApi = false)
    {
        if (! $workcode || ! $workcode->isEffectivelyActive()) {
            throw ValidationException::withMessages([
                'workcode' => 'Belum ada Workcode yang aktif. Presensi mandiri saat ini ditutup.',
            ])->status(400);
        }

        if ($workcode->kategori === 'harian' && ! $isMobileApi) {
            throw ValidationException::withMessages([
                'workcode' => 'Presensi harian hanya dapat dilakukan melalui scan QR Code Pribadi oleh petugas/admin.',
            ])->status(403);
        }
    }

    /**
     * Jam buka-tutup presensi datang/pulang untuk hari ini: jadwal per hari (jadwal_per_hari,
     * kunci 1=Senin s.d. 7=Minggu) bila ada, selain itu jam umum workcode.
     *
     * @return array{0: ?string, 1: ?string}
     */
    public function todayWindow(Workcode $workcode, bool $isPulang): array
    {
        $prefix = $isPulang ? 'jam_pulang' : 'jam_datang';
        $schedule = $workcode->scheduleFor(now());

        return [$schedule["{$prefix}_mulai"], $schedule["{$prefix}_selesai"]];
    }

    /**
     * Jendela presensi datang/pulang hari ini sebagai waktu nyata (zona waktu aplikasi).
     * Null bila jam buka/tutup tidak diatur (presensi tidak dibatasi jam). Jam tutup yang lebih
     * awal dari jam buka dianggap melewati tengah malam. end = jam selesai resmi (batas terlambat);
     * closes_at = kapan presensi benar-benar ditutup: untuk datang harian end + toleransi terlambat.
     *
     * @return array{start: Carbon, end: Carbon, closes_at: Carbon, start_time: string, end_time: string}|null
     */
    public function windowBounds(Workcode $workcode, bool $isPulang, ?Carbon $now = null): ?array
    {
        [$start, $end] = $this->todayWindow($workcode, $isPulang);

        if (! $start || ! $end) {
            return null;
        }

        $now ??= now();
        $startCarbon = Carbon::createFromTimeString($start)->setDate($now->year, $now->month, $now->day);
        $endCarbon = Carbon::createFromTimeString($end)->setDate($now->year, $now->month, $now->day);

        if ($endCarbon->lt($startCarbon)) {
            $endCarbon->addDay();
        }

        $closesAt = ! $isPulang && $workcode->kategori === 'harian'
            ? Workcode::withLateTolerance($endCarbon)
            : $endCarbon->copy();

        return ['start' => $startCarbon, 'end' => $endCarbon, 'closes_at' => $closesAt, 'start_time' => $start, 'end_time' => $end];
    }

    public function validateTimeWindow(Workcode $workcode, bool $isPulang): void
    {
        if ($workcode->kategori === 'workcode') {
            return;
        }

        $now = now();
        $window = $this->windowBounds($workcode, $isPulang, $now);
        $label = $isPulang ? 'pulang' : 'datang';

        if (! $window) {
            return;
        }

        ['start_time' => $start, 'end_time' => $end] = $window;

        if (! $now->between($window['start'], $window['closes_at'])) {
            $tolerance = $window['closes_at']->gt($window['end'])
                ? ', toleransi terlambat sampai '.$window['closes_at']->format('H:i').' WIB'
                : '';

            throw new \Exception(json_encode([
                'status' => 'error',
                'message' => "Waktu absen {$label} sudah ditutup atau belum dibuka ({$start} – {$end} WIB{$tolerance}).",
            ]), 400);
        }
    }

    public function generateDeviceHash(?string $deviceId, ?string $userAgent): string
    {
        return hash('sha256', ($deviceId ?? '').'|'.($userAgent ?? ''));
    }

    /**
     * HP (hash perangkat) sudah dipakai presensi pada workcode ini hari ini oleh peserta lain.
     * Tanpa $participantId (self check-in web, peserta belum diketahui) semua presensi dihitung.
     */
    public function deviceUsedByOther(Workcode $workcode, string $deviceHash, ?int $participantId = null): bool
    {
        return Attendance::where('workcode_id', $workcode->id)
            ->where('device_hash', $deviceHash)
            ->when($participantId !== null, fn ($query) => $query->where('participant_id', '!=', $participantId))
            ->whereDate('tanggal', now()->toDateString())
            ->whereHas('participant')
            ->exists();
    }

    public function validateDeviceLock(Workcode $workcode, string $deviceHash, ?int $participantId = null)
    {
        if ($this->deviceUsedByOther($workcode, $deviceHash, $participantId)) {
            throw new \Exception(json_encode([
                'status' => 'device_locked',
                'message' => 'Perangkat ini sudah digunakan untuk presensi pada workcode ini.',
            ]), 403);
        }
    }

    public function validateGpsAndRadius(Workcode $workcode, array $gpsData)
    {
        if (isset($gpsData['accuracy'])) {
            $accuracy = (float) $gpsData['accuracy'];
            if ($accuracy <= 0) {
                throw new \Exception(json_encode([
                    'status' => 'error',
                    'message' => 'Peringatan Keamanan: Terdeteksi manipulasi lokasi (Mock Location). Matikan aplikasi Fake GPS pada perangkat Anda.',
                ]), 403);
            }
            if ($accuracy > 120) {
                throw new \Exception(json_encode([
                    'status' => 'error',
                    'message' => 'Akurasi sinyal GPS perangkat Anda terlalu rendah (±'.round($accuracy).'m). Pastikan fitur Lokasi Akurasi Tinggi diaktifkan dan Anda berada di area terbuka.',
                ]), 400);
            }
        }

        if (isset($gpsData['device_timestamp'])) {
            $deviceTimeSec = (int) ($gpsData['device_timestamp'] / 1000);
            $serverTimeSec = now()->timestamp;
            $timeDiff = abs($serverTimeSec - $deviceTimeSec);

            if ($timeDiff > 120) {
                throw new \Exception(json_encode([
                    'status' => 'error',
                    'message' => 'Waktu pada perangkat Anda tidak sinkron dengan server (selisih > 2 menit). Mohon atur jam perangkat ke otomatis/WIB.',
                ]), 400);
            }
        }

        if ($workcode->latitude && $workcode->longitude) {
            if (! isset($gpsData['latitude']) || ! isset($gpsData['longitude']) || $gpsData['latitude'] === null || $gpsData['longitude'] === null) {
                throw new \Exception(json_encode([
                    'status' => 'error',
                    'message' => 'Gagal mendapatkan lokasi GPS dari perangkat Anda. Pastikan izin lokasi diaktifkan.',
                ]), 400);
            }

            $distance = $this->calculateDistance(
                $workcode->latitude, $workcode->longitude,
                $gpsData['latitude'], $gpsData['longitude']
            );

            $radiusLimit = $workcode->radius_meters ?? 100;

            if ($distance > $radiusLimit) {
                throw new \Exception(json_encode([
                    'status' => 'error',
                    'message' => "Anda berada di luar radius presensi. Anda harus berada dalam radius {$radiusLimit} meter dari lokasi workcode.",
                ]), 403);
            }
        }
    }

    private function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371000;
        $latFrom = deg2rad($lat1);
        $lonFrom = deg2rad($lon1);
        $latTo = deg2rad($lat2);
        $lonTo = deg2rad($lon2);

        $latDelta = $latTo - $latFrom;
        $lonDelta = $lonTo - $lonFrom;

        $angle = 2 * asin(sqrt(pow(sin($latDelta / 2), 2) +
            cos($latFrom) * cos($latTo) * pow(sin($lonDelta / 2), 2)));

        return $angle * $earthRadius;
    }

    public function checkAlreadyAttended(Workcode $workcode, Participant $participant): bool
    {
        $attendanceQuery = Attendance::where('workcode_id', $workcode->id)
            ->where('participant_id', $participant->id)
            ->when(
                $workcode->kategori === 'harian',
                fn ($query) => $query->whereDate('tanggal', now()->toDateString())
            );

        return $attendanceQuery->exists();
    }

    /**
     * Status tombol presensi untuk aplikasi Android, diputuskan dari waktu server dan catatan presensi
     * dengan aturan yang sama seperti POST /api/v1/attendance. Hanya untuk tampilan: POST tetap
     * memvalidasi ulang semuanya (jadwal, GPS, perangkat, wajah, idempotensi).
     *
     * @param  ?Attendance  $attendance  catatan presensi peserta untuk workcode ini (harian: hari ini)
     * @param  bool  $hasOtherActiveWorkcode  ada workcode aktif, tetapi tidak tersedia untuk peserta
     */
    public function attendanceUi(?Workcode $workcode, ?Attendance $attendance, bool $hasOtherActiveWorkcode = false): array
    {
        $now = now();

        if (! $workcode || ! $workcode->isEffectivelyActive($now)) {
            return $this->uiState($now, 'none', $hasOtherActiveWorkcode ? 'not_assigned' : 'no_active_workcode',
                $hasOtherActiveWorkcode ? 'Workcode aktif tidak tersedia untuk akun Anda.' : 'Belum ada workcode yang aktif.');
        }

        $schedule = $this->effectiveSchedule($workcode, $now);

        // Workcode kegiatan: satu kali presensi, tanpa presensi pulang dan tanpa batas jam datang/pulang.
        if ($workcode->kategori !== 'harian') {
            return $attendance
                ? $this->uiState($now, 'none', 'completed', 'Anda sudah melakukan presensi untuk workcode "'.$workcode->nama_workcode.'".', $schedule)
                : $this->uiState($now, 'arrival', 'arrival_open', null, $schedule);
        }

        if ($attendance && $attendance->waktu_pulang !== null) {
            return $this->uiState($now, 'none', 'completed', 'Presensi datang dan pulang hari ini sudah tercatat.', $schedule);
        }

        $isPulang = $attendance !== null;
        $window = $this->windowBounds($workcode, $isPulang, $now);
        $action = $isPulang ? 'departure' : 'arrival';

        // Record tanpa jam datang (mis. lupa_absen dari attendance:calculate-alpha setelah toleransi habis):
        // peserta tetap bisa presensi pulang, tetapi pesannya tidak boleh menyebut presensi datang tercatat.
        $missedArrival = $isPulang && $attendance->waktu_hadir === null
            ? 'Anda tidak melakukan presensi datang hari ini'.($attendance->status === 'lupa_absen' ? ' (tercatat lupa absen)' : '').'.'
            : null;

        if (! $window || $now->between($window['start'], $window['end'])) {
            return $this->uiState($now, $action, "{$action}_open", $missedArrival, $schedule);
        }

        // Masa toleransi datang: tombol tetap dibuka (reason sama agar APK lama tetap jalan), ditandai terlambat.
        if ($now->gt($window['end']) && $now->lte($window['closes_at'])) {
            $lateMinutes = $workcode->lateMinutes($now);

            return $this->uiState($now, $action, "{$action}_open",
                'Anda terlambat '.Workcode::formatLateDuration($lateMinutes).'. Presensi datang ditutup pukul '.$window['closes_at']->format('H:i').' WIB.',
                $schedule, $lateMinutes);
        }

        $range = $window['start']->format('H:i').' – '.$window['end']->format('H:i');

        if ($now->lt($window['start'])) {
            return $this->uiState($now, 'none', "{$action}_not_open", $isPulang
                ? ($missedArrival ?? 'Presensi datang sudah tercatat.').' Presensi pulang baru dibuka pukul '.$window['start']->format('H:i').' WIB.'
                : 'Presensi datang baru dibuka pukul '.$window['start']->format('H:i').' WIB.', $schedule);
        }

        return $this->uiState($now, 'none', "{$action}_closed", $isPulang
            ? ($missedArrival ? "{$missedArrival} " : '')."Waktu presensi pulang sudah ditutup ({$range} WIB)."
            : "Waktu presensi datang sudah ditutup pukul {$window['closes_at']->format('H:i')} WIB (jadwal {$range} WIB + toleransi terlambat).", $schedule);
    }

    /**
     * Jadwal presensi yang berlaku hari ini, dari logika jadwal yang sama dengan validasi presensi.
     *
     * @return array{arrival: array, departure: array}
     */
    public function effectiveSchedule(Workcode $workcode, ?Carbon $now = null): array
    {
        $now ??= now();

        if ($workcode->kategori !== 'harian') {
            // Kegiatan dibuka sepanjang jam aktifnya; tidak ada presensi pulang.
            $arrival = $workcode->hasScheduledActiveWindow()
                ? [
                    'start' => $workcode->activeWindowStartsAt(),
                    'end' => $workcode->activeWindowEndsAt(),
                    'closes_at' => $workcode->activeWindowEndsAt(),
                ]
                : null;

            return ['arrival' => $this->scheduleEntry($arrival), 'departure' => $this->scheduleEntry(null)];
        }

        return [
            'arrival' => $this->scheduleEntry($this->windowBounds($workcode, false, $now)),
            'departure' => $this->scheduleEntry($this->windowBounds($workcode, true, $now)),
        ];
    }

    private function scheduleEntry(?array $window): array
    {
        return [
            'start' => $window ? $window['start']->toIso8601String() : null,
            'end' => $window ? $window['end']->toIso8601String() : null,
            'closes_at' => $window ? $window['closes_at']->toIso8601String() : null,
            'display' => $window ? $window['start']->format('H:i').'–'.$window['end']->format('H:i') : null,
        ];
    }

    /** Tombol presensi ditutup karena HP ini sudah dipakai presensi akun lain (lihat deviceUsedByOther). */
    public function deviceUsedUi(Workcode $workcode): array
    {
        return $this->uiState(now(), 'none', 'device_used',
            'Perangkat ini sudah digunakan untuk presensi pada workcode ini.', $this->effectiveSchedule($workcode));
    }

    private function uiState(Carbon $now, string $action, string $reason, ?string $message, ?array $schedule = null, int $lateMinutes = 0): array
    {
        return [
            'action' => $action,
            'action_label' => match ($action) {
                'arrival' => 'Absen Datang',
                'departure' => 'Absen Pulang',
                default => null,
            },
            'reason' => $reason,
            'message' => $message,
            'is_late' => $lateMinutes > 0,
            'late_minutes' => $lateMinutes,
            'server_time' => $now->toIso8601String(),
            'effective_schedule' => $schedule,
        ];
    }
}
