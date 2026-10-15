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
        $schedule = $workcode->jadwal_per_hari[now()->dayOfWeekIso] ?? null;

        return [
            $schedule["{$prefix}_mulai"] ?? $workcode->{"{$prefix}_mulai"},
            $schedule["{$prefix}_selesai"] ?? $workcode->{"{$prefix}_selesai"},
        ];
    }

    public function validateTimeWindow(Workcode $workcode, bool $isPulang): void
    {
        if ($workcode->kategori === 'workcode') {
            return;
        }

        [$start, $end] = $this->todayWindow($workcode, $isPulang);
        $label = $isPulang ? 'pulang' : 'datang';

        if (! $start || ! $end) {
            return;
        }

        $now = now();
        $startCarbon = Carbon::createFromTimeString($start)->setDate($now->year, $now->month, $now->day);
        $endCarbon = Carbon::createFromTimeString($end)->setDate($now->year, $now->month, $now->day);

        if ($endCarbon->lt($startCarbon)) {
            $endCarbon->addDay();
        }

        if (! $now->between($startCarbon, $endCarbon)) {
            throw new \Exception(json_encode([
                'status' => 'error',
                'message' => "Waktu absen {$label} sudah ditutup atau belum dibuka ({$start} – {$end} WIB).",
            ]), 400);
        }
    }

    public function generateDeviceHash(?string $deviceId, ?string $userAgent): string
    {
        return hash('sha256', ($deviceId ?? '').'|'.($userAgent ?? ''));
    }

    public function validateDeviceLock(Workcode $workcode, string $deviceHash)
    {
        $deviceAttendance = Attendance::where('workcode_id', $workcode->id)
            ->where('device_hash', $deviceHash)
            ->whereDate('created_at', now()->toDateString())
            ->with('participant')
            ->first();

        if ($deviceAttendance && $deviceAttendance->participant) {
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
                fn ($query) => $query->whereDate('created_at', now()->toDateString())
            );

        return $attendanceQuery->exists();
    }
}
