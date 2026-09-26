<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\Workcode;
use App\Models\Participant;
use Illuminate\Validation\ValidationException;

class AttendanceValidationService
{
    /**
     * Validasi ketersediaan dan tipe workcode.
     */
    public function validateWorkcodeActive(?Workcode $workcode, bool $isMobileApi = false)
    {
        if (!$workcode) {
            throw ValidationException::withMessages([
                'workcode' => 'Belum ada Workcode yang aktif. Presensi mandiri saat ini ditutup.',
            ])->status(400);
        }

        if ($workcode->kategori === 'harian' && !$isMobileApi) {
            throw ValidationException::withMessages([
                'workcode' => 'Presensi harian hanya dapat dilakukan melalui scan QR Code Pribadi oleh petugas/admin.',
            ])->status(403);
        }
    }

    /**
     * Turunkan device hash dari input.
     */
    public function generateDeviceHash(?string $deviceId, ?string $userAgent): string
    {
        return hash('sha256', ($deviceId ?? '') . '|' . ($userAgent ?? ''));
    }

    /**
     * Validasi agar satu perangkat hanya bisa digunakan untuk satu peserta.
     */
    public function validateDeviceLock(Workcode $workcode, string $deviceHash)
    {
        $deviceAttendance = Attendance::where('workcode_id', $workcode->id)
            ->where('device_hash', $deviceHash)
            ->whereDate('created_at', now()->toDateString())
            ->with('participant')
            ->first();

        if ($deviceAttendance && $deviceAttendance->participant) {
            // Lemparkan exception custom yang bisa ditangkap oleh controller
            throw new \Exception(json_encode([
                'status' => 'device_locked',
                'message' => 'Perangkat ini sudah digunakan untuk presensi pada workcode ini.',
            ]), 403);
        }
    }

    /**
     * Validasi sensor GPS, Mock Location, Clock Skew, dan Geofence Radius.
     */
    public function validateGpsAndRadius(Workcode $workcode, array $gpsData)
    {
        // 1. Mock Location & Accuracy
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
                    'message' => 'Akurasi sinyal GPS perangkat Anda terlalu rendah (±' . round($accuracy) . 'm). Pastikan fitur Lokasi Akurasi Tinggi diaktifkan dan Anda berada di area terbuka.',
                ]), 400);
            }
        }

        // 2. Clock Skew (Anti-Replay)
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

        // 3. Geofence Radius Check
        if ($workcode->latitude && $workcode->longitude) {
            if (!isset($gpsData['latitude']) || !isset($gpsData['longitude']) || $gpsData['latitude'] === null || $gpsData['longitude'] === null) {
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

    /**
     * Hitung jarak dua titik dengan Haversine formula (dalam meter).
     */
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

    /**
     * Cek duplikasi presensi.
     */
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
