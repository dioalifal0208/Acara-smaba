<?php

namespace App\Http\Controllers;

use App\Models\Participant;
use App\Models\Attendance;
use App\Models\Event;
use App\Services\QrCodeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SelfCheckInController extends Controller
{
    /**
     * Dapatkan atau generate token event hari ini.
     */
    private function getEventToken()
    {
        return Cache::remember('active_event_token', now()->endOfDay(), function () {
            return Str::random(16);
        });
    }

    /**
     * Tampilkan halaman Master QR Code untuk Admin.
     */
    public function masterQr(QrCodeService $qrCodeService)
    {
        $activeEvent = Event::getActive();
        $token = $this->getEventToken();
        
        // Buat URL check-in menggunakan host saat ini
        $checkInUrl = url("/self-checkin/{$token}");
        
        // Generate QR code SVG untuk URL tersebut dengan Logo Sekolah di tengahnya
        $qrCodeSvg = $qrCodeService->generateWithLogo($checkInUrl, 400);

        return Inertia::render('Admin/MasterQr', [
            'activeEvent' => $activeEvent,
            'checkInUrl' => $checkInUrl,
            'qrCodeSvg' => $qrCodeSvg,
            'token' => $token,
        ]);
    }

    /**
     * Regenerasi token event.
     */
    public function regenerateToken()
    {
        Cache::forget('active_event_token');
        return redirect()->route('admin.master-qr')
            ->with('success', 'Token event berhasil diregenerasi! URL absen telah diperbarui.');
    }

    /**
     * Tampilkan halaman form Self Check-In.
     */
    public function showForm($token)
    {
        $activeToken = $this->getEventToken();
        $activeEvent = Event::getActive();

        if ($token !== $activeToken) {
            abort(403, 'Tautan presensi tidak valid atau telah kadaluarsa.');
        }

        return Inertia::render('SelfCheckIn/Form', [
            'activeEvent' => $activeEvent,
            'token' => $token,
        ]);
    }

    /**
     * Tampilkan halaman form Face Check-In.
     */
    public function showFaceForm($token)
    {
        $activeToken = $this->getEventToken();
        $activeEvent = Event::getActive();

        if ($token !== $activeToken) {
            abort(403, 'Tautan presensi tidak valid atau telah kadaluarsa.');
        }

        return Inertia::render('SelfCheckIn/FaceForm', [
            'activeEvent' => $activeEvent,
            'token' => $token,
        ]);
    }

    /**
     * Hitung jarak dua titik dengan Haversine formula (dalam meter).
     */
    private function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371000; // Radius bumi dalam meter
        
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
     * Proses input NIS/NIP untuk absen mandiri per Event.
     */
    public function submitForm(Request $request, $token)
    {
        $activeToken = $this->getEventToken();

        if ($token !== $activeToken) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tautan presensi telah kadaluarsa atau tidak valid.',
            ], 403);
        }

        $activeEvent = Event::getActive();

        if (!$activeEvent) {
            return response()->json([
                'status' => 'error',
                'message' => 'Belum ada Event yang aktif. Presensi mandiri saat ini ditutup.',
            ], 400);
        }

        if ($activeEvent->kategori === 'harian') {
            return response()->json([
                'status' => 'error',
                'message' => 'Presensi harian hanya dapat dilakukan melalui scan QR Code Pribadi oleh petugas/admin.',
            ], 403);
        }

        $request->validate([
            'nis_nip' => 'required|string|max:50',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'accuracy' => 'nullable|numeric',
            'altitude' => 'nullable|numeric',
            'device_timestamp' => 'nullable|numeric',
            'device_id' => 'nullable|string|max:255',
        ]);

        // === ONE DEVICE ONE ATTENDANCE ENFORCEMENT ===
        // Buat device hash dari kombinasi device_id yang dikirim + User-Agent
        $rawDeviceId = $request->input('device_id', '');
        $userAgent = $request->userAgent() ?? '';
        $ipAddress = $request->ip();
        $deviceHash = hash('sha256', $rawDeviceId . '|' . $userAgent);

        // Cek apakah device ini sudah pernah presensi di event aktif ini
        $deviceAttendance = Attendance::where('event_id', $activeEvent->id)
            ->where('device_hash', $deviceHash)
            ->with('participant')
            ->first();

        if ($deviceAttendance && $deviceAttendance->participant) {
            $lockedParticipant = $deviceAttendance->participant;
            return response()->json([
                'status' => 'device_locked',
                'message' => 'Perangkat ini sudah digunakan untuk presensi atas nama ' . $lockedParticipant->nama . ' (' . $lockedParticipant->nis_nip . '). 1 perangkat hanya diizinkan untuk 1 kali presensi per event.',
                'locked_participant' => [
                    'nama' => $lockedParticipant->nama,
                    'nis_nip' => $lockedParticipant->nis_nip,
                    'waktu_hadir' => $deviceAttendance->waktu_hadir->format('H:i:s'),
                ],
            ], 403);
        }

        // Validasi Anti-Fake GPS & Mock Location
        if ($request->has('accuracy')) {
            $accuracy = (float) $request->input('accuracy');
            
            // Mock Location Injector sering menghasilkan accuracy 0 persis
            if ($accuracy <= 0) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Peringatan Keamanan: Terdeteksi manipulasi lokasi (Mock Location). Matikan aplikasi Fake GPS pada perangkat Anda.',
                ], 403);
            }

            // Batas toleransi akurasi maksimal (120 meter) untuk mencegah spoofing berbasis jaringan/BTS jauh
            if ($accuracy > 120) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Akurasi sinyal GPS perangkat Anda terlalu rendah (±' . round($accuracy) . 'm). Pastikan fitur Lokasi Akurasi Tinggi diaktifkan dan Anda berada di area terbuka.',
                ], 400);
            }
        }

        // Cek anomali waktu sensor GPS (Anti-Replay / Clock Skew > 2 menit)
        if ($request->has('device_timestamp')) {
            $deviceTimeSec = (int) ($request->input('device_timestamp') / 1000);
            $serverTimeSec = now()->timestamp;
            $timeDiff = abs($serverTimeSec - $deviceTimeSec);

            if ($timeDiff > 120) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Waktu pada perangkat Anda tidak sinkron dengan server (selisih > 2 menit). Mohon atur jam perangkat ke otomatis/WIB.',
                ], 400);
            }
        }

        // Cek batasan radius (jika event memiliki setingan koordinat)
        if ($activeEvent->latitude && $activeEvent->longitude) {
            if (!$request->filled('latitude') || !$request->filled('longitude')) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Gagal mendapatkan lokasi GPS dari perangkat Anda. Pastikan izin lokasi diaktifkan.',
                ], 400);
            }

            $distance = $this->calculateDistance(
                $activeEvent->latitude, $activeEvent->longitude,
                $request->latitude, $request->longitude
            );

            $radiusLimit = $activeEvent->radius_meters ?? 100;
            
            if ($distance > $radiusLimit) {
                $distanceFmt = number_format($distance, 0);
                return response()->json([
                    'status' => 'error',
                    'message' => "Anda berada di luar radius presensi ({$distanceFmt} meter). Anda harus berada dalam radius {$radiusLimit} meter dari lokasi acara.",
                ], 403);
            }
        }

        $nisNip = trim($request->input('nis_nip'));

        // Cari peserta berdasarkan NIS/NIP
        $participant = Participant::where('nis_nip', $nisNip)->first();

        if (!$participant) {
            return response()->json([
                'status' => 'error',
                'message' => 'NIS/NIP tidak terdaftar. Hubungi panitia.',
            ], 404);
        }

        // Cek apakah sudah absen pada event aktif ini
        $alreadyAttended = Attendance::where('event_id', $activeEvent->id)
            ->where('participant_id', $participant->id)
            ->exists();

        if ($alreadyAttended) {
            return response()->json([
                'status' => 'already',
                'message' => 'Anda sudah melakukan presensi untuk event "' . $activeEvent->nama_event . '".',
                'participant' => $participant,
            ]);
        }

        // Catat kehadiran untuk event aktif (beserta device_hash & IP untuk lock)
        $attendance = Attendance::create([
            'event_id' => $activeEvent->id,
            'participant_id' => $participant->id,
            'waktu_hadir' => now(),
            'device_hash' => $deviceHash,
            'ip_address' => $ipAddress,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Presensi berhasil dicatat untuk event "' . $activeEvent->nama_event . '"!',
            'participant' => $participant,
            'timestamp' => $attendance->waktu_hadir->format('H:i:s'),
        ]);
    }
}
