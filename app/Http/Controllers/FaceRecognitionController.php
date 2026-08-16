<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Event;
use App\Models\Participant;
use Illuminate\Http\Request;

class FaceRecognitionController extends Controller
{
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
     * Hitung Euclidean distance antara dua vector (array float).
     */
    private function euclideanDistance(array $v1, array $v2)
    {
        if (count($v1) !== count($v2)) {
            return INF;
        }

        $sum = 0.0;
        for ($i = 0; $i < count($v1); $i++) {
            $sum += pow($v1[$i] - $v2[$i], 2);
        }
        return sqrt($sum);
    }

    /**
     * Register Face Descriptor untuk seorang Participant (Admin Only)
     */
    public function register(Request $request, Participant $participant)
    {
        $request->validate([
            'descriptor' => 'required|array',
            'descriptor.*' => 'numeric',
        ]);

        // Simpan 128-dimensional array
        $participant->update([
            'face_descriptor' => $request->input('descriptor')
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Data wajah berhasil didaftarkan untuk ' . $participant->nama,
        ]);
    }

    /**
     * Hapus Face Descriptor
     */
    public function deleteFace(Participant $participant)
    {
        $participant->update([
            'face_descriptor' => null
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Data wajah berhasil dihapus untuk ' . $participant->nama,
        ]);
    }

    /**
     * Match Face Descriptor & Process Attendance
     */
    public function match(Request $request)
    {
        $activeEvent = Event::getActive();

        if (!$activeEvent) {
            return response()->json([
                'status' => 'error',
                'message' => 'Belum ada Event yang aktif. Presensi saat ini ditutup.',
            ], 400);
        }

        $request->validate([
            'descriptor' => 'required|array',
            'descriptor.*' => 'numeric',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'accuracy' => 'nullable|numeric',
            'device_timestamp' => 'nullable|numeric',
            'device_id' => 'nullable|string',
        ]);

        $inputDescriptor = $request->input('descriptor');

        $isAdmin = auth()->check() && (auth()->user()->role === 'admin' || auth()->user()->role === 'superadmin');

        // === Validasi GPS (Mirip Self Check-in) ===
        // Bypassed jika yang melakukan scan adalah Admin
        if (!$isAdmin) {
            if ($request->has('accuracy')) {
                $accuracy = (float) $request->input('accuracy');
                
                // Mock Location Injector sering menghasilkan accuracy 0 persis
                if ($accuracy <= 0) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Peringatan Keamanan: Terdeteksi manipulasi lokasi (Mock Location).',
                    ], 403);
                }

                // Batas toleransi akurasi maksimal (120 meter)
                if ($accuracy > 120) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Akurasi sinyal GPS terlalu rendah (±' . round($accuracy) . 'm).',
                    ], 400);
                }
            }

            // Cek anomali waktu sensor GPS
            if ($request->has('device_timestamp')) {
                $deviceTimeSec = (int) ($request->input('device_timestamp') / 1000);
                $serverTimeSec = now()->timestamp;
                $timeDiff = abs($serverTimeSec - $deviceTimeSec);

                if ($timeDiff > 120) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Waktu perangkat tidak sinkron dengan server.',
                    ], 400);
                }
            }
        }

        // Cek batasan radius
        if ($activeEvent->latitude && $activeEvent->longitude) {
            if (!$request->filled('latitude') || (!$request->filled('longitude'))) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Gagal mendapatkan lokasi GPS dari perangkat.',
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
                    'message' => "Anda berada di luar radius presensi ({$distanceFmt} meter). Anda harus berada dalam radius {$radiusLimit} meter.",
                ], 403);
            }
        }

        // === Pencocokan Wajah ===
        // Karena data max ~150, brute force Euclidean distance sangat aman dan cepat
        $participants = Participant::whereNotNull('face_descriptor')->get();
        
        $bestMatch = null;
        $bestDistance = 0.45; // Threshold yang direkomendasikan face-api.js adalah ~0.6, kita perketat ke 0.45 agar lebih akurat dan strict.

        foreach ($participants as $p) {
            // descriptor DB is cast to array
            $dbDescriptor = $p->face_descriptor;
            if (is_array($dbDescriptor) && count($dbDescriptor) === 128) {
                $dist = $this->euclideanDistance($inputDescriptor, $dbDescriptor);
                if ($dist < $bestDistance) {
                    $bestDistance = $dist;
                    $bestMatch = $p;
                }
            }
        }

        if (!$bestMatch) {
            return response()->json([
                'status' => 'not_recognized',
                'message' => 'Wajah tidak dikenali dalam sistem. Pastikan pencahayaan cukup dan Anda sudah terdaftar.',
            ], 404);
        }

        // === Cek apakah sudah absen ===
        $alreadyAttended = Attendance::where('event_id', $activeEvent->id)
            ->where('participant_id', $bestMatch->id)
            ->exists();

        if ($alreadyAttended) {
            return response()->json([
                'status' => 'already',
                'message' => 'Anda sudah melakukan presensi untuk event "' . $activeEvent->nama_event . '".',
                'participant' => $bestMatch,
            ]);
        }

        // Persiapkan data device dan IP untuk record Attendance (selalu dibutuhkan)
        $rawDeviceId = $request->input('device_id', '');
        $userAgent = $request->userAgent() ?? '';
        $ipAddress = $request->ip();
        $deviceHash = hash('sha256', $rawDeviceId . '|' . $userAgent);

        // Lakukan penguncian 1 perangkat 1 presensi seperti Self Check-in
        // Bypassed jika yang melakukan scan adalah Admin (auth()->check() == true dan isAdmin() atau role tertentu)
        // Kita cukup cek !auth()->check() karena peserta tidak punya akses ke scanner panitia, tapi karena peserta punya auth, kita cek role-nya.
        // Sebenarnya $request->user() bisa kita cek rolenya. Untuk amannya, kita anggap auth()->check() && auth()->user()->role === 'admin' bypass ini.
        $isAdmin = auth()->check() && (auth()->user()->role === 'admin' || auth()->user()->role === 'superadmin');

        if (!$isAdmin) {
            $deviceAttendance = Attendance::where('event_id', $activeEvent->id)
                ->where('device_hash', $deviceHash)
                ->with('participant')
                ->first();

            if ($deviceAttendance && $deviceAttendance->participant && $deviceAttendance->participant_id !== $bestMatch->id) {
                $lockedParticipant = $deviceAttendance->participant;
                return response()->json([
                    'status' => 'device_locked',
                    'message' => 'Perangkat ini sudah digunakan untuk presensi atas nama ' . $lockedParticipant->nama . '. 1 perangkat hanya diizinkan untuk 1 presensi.',
                ], 403);
            }
        }

        // Cek keterlambatan menggunakan fungsi helper dari model Event atau dikalkulasi di sini
        // Tapi AttendanceController@scan punya logika hitung telat. Kita copy sedikit logika ke sini agar lengkap.
        $waktuHadir = now();
        $lateFormatted = null;
        $isLate = false;

        // Ambil info shift
        $scanTimeStr = $waktuHadir->format('H:i');
        
        // Logika sederhana: jika absen melebihi jam 07:00, dihitung terlambat
        // (Sama dengan AttendanceController)
        $targetDatangSelesai = \Carbon\Carbon::createFromFormat('H:i', '07:00')->setDate($waktuHadir->year, $waktuHadir->month, $waktuHadir->day);
        
        if ($waktuHadir->greaterThan($targetDatangSelesai)) {
            $isLate = true;
            $diffInMinutes = $targetDatangSelesai->diffInMinutes($waktuHadir);
            if ($diffInMinutes >= 60) {
                $hours = floor($diffInMinutes / 60);
                $minutes = $diffInMinutes % 60;
                $lateFormatted = $minutes > 0 ? "{$hours} jam {$minutes} menit" : "{$hours} jam";
            } else {
                $lateFormatted = "{$diffInMinutes} menit";
            }
        }

        // === Catat Presensi ===
        $attendance = Attendance::create([
            'event_id' => $activeEvent->id,
            'participant_id' => $bestMatch->id,
            'waktu_hadir' => $waktuHadir,
            'device_hash' => $deviceHash,
            'ip_address' => $ipAddress,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Presensi berhasil dicatat!',
            'participant' => $bestMatch,
            'timestamp' => $attendance->waktu_hadir->format('H:i:s'),
            'distance' => round($bestDistance, 3),
            'is_late' => $isLate,
            'late_formatted' => $lateFormatted,
        ]);
    }
}
