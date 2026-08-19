<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Workcode;
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
     * Hitung jarak terdekat antara input descriptor dan stored descriptor(s)
     * Mendukung single vector (128D) maupun multi-vector array
     */
    private function getMinDistance(array $inputDescriptor, $dbDescriptor)
    {
        if (!is_array($dbDescriptor) || empty($dbDescriptor)) {
            return INF;
        }

        // Single 128-dimensional vector
        if (count($dbDescriptor) === 128 && !is_array($dbDescriptor[0])) {
            return $this->euclideanDistance($inputDescriptor, $dbDescriptor);
        }

        // Multiple 128-dimensional vectors
        $minDist = INF;
        foreach ($dbDescriptor as $vec) {
            if (is_array($vec) && count($vec) === 128) {
                $d = $this->euclideanDistance($inputDescriptor, $vec);
                if ($d < $minDist) {
                    $minDist = $d;
                }
            }
        }
        return $minDist;
    }

    /**
     * Register Face Descriptor untuk seorang Participant (Admin Only)
     */
    public function register(Request $request, Participant $participant)
    {
        $request->validate([
            'descriptor' => 'required|array',
            'photo' => 'nullable|string'
        ]);

        $updateData = [
            'face_descriptor' => $request->input('descriptor'),
            'face_status' => 'approved' // Admin langsung approved
        ];

        if ($request->has('photo')) {
            $photoData = $request->input('photo');
            if (preg_match('/^data:image\/(\w+);base64,/', $photoData, $type)) {
                $photoData = substr($photoData, strpos($photoData, ',') + 1);
                $type = strtolower($type[1]);
                if (in_array($type, ['jpg', 'jpeg', 'png'])) {
                    $photoData = base64_decode($photoData);
                    $filename = 'faces/' . $participant->id . '_' . time() . '.' . $type;
                    \Illuminate\Support\Facades\Storage::disk('public')->put($filename, $photoData);
                    
                    // delete old photo if exists
                    if ($participant->photo_path) {
                        \Illuminate\Support\Facades\Storage::disk('public')->delete($participant->photo_path);
                    }
                    
                    $updateData['photo_path'] = $filename;
                }
            }
        }

        // Simpan 128-dimensional array dan photo
        $participant->update($updateData);

        return response()->json([
            'status' => 'success',
            'message' => 'Data wajah berhasil didaftarkan untuk ' . $participant->nama,
        ]);
    }

    /**
     * Register Face Descriptor oleh Peserta Sendiri (Status: Pending)
     */
    public function registerSelf(Request $request, Participant $participant)
    {
        // Pastikan peserta hanya bisa mendaftarkan wajahnya sendiri
        if (auth()->user()->participant_id != $participant->id) {
            abort(403, 'Anda tidak diizinkan mengubah data peserta lain.');
        }

        $request->validate([
            'descriptor' => 'required|array',
            'photo' => 'nullable|string'
        ]);

        $updateData = [
            'face_descriptor' => $request->input('descriptor'),
            'face_status' => 'pending'
        ];

        if ($request->has('photo')) {
            $photoData = $request->input('photo');
            if (preg_match('/^data:image\/(\w+);base64,/', $photoData, $type)) {
                $photoData = substr($photoData, strpos($photoData, ',') + 1);
                $type = strtolower($type[1]);
                if (in_array($type, ['jpg', 'jpeg', 'png'])) {
                    $photoData = base64_decode($photoData);
                    $filename = 'faces/' . $participant->id . '_self_' . time() . '.' . $type;
                    \Illuminate\Support\Facades\Storage::disk('public')->put($filename, $photoData);
                    
                    // delete old photo if exists
                    if ($participant->photo_path) {
                        \Illuminate\Support\Facades\Storage::disk('public')->delete($participant->photo_path);
                    }
                    
                    $updateData['photo_path'] = $filename;
                }
            }
        }

        $participant->update($updateData);

        return response()->json([
            'status' => 'success',
            'message' => 'Data wajah berhasil disimpan. Menunggu persetujuan Admin.',
        ]);
    }

    /**
     * Approve Face Descriptor (Admin Only)
     */
    public function approveFace(Participant $participant)
    {
        $participant->update(['face_status' => 'approved']);
        return redirect()->back()->with('success', 'Wajah peserta ' . $participant->nama . ' berhasil disetujui.');
    }

    /**
     * Reject Face Descriptor (Admin Only)
     */
    public function rejectFace(Participant $participant)
    {
        // Hapus foto jika ditolak
        if ($participant->photo_path) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($participant->photo_path);
        }

        $participant->update([
            'face_status' => 'rejected',
            'face_descriptor' => null,
            'photo_path' => null
        ]);
        
        return redirect()->back()->with('success', 'Wajah peserta ' . $participant->nama . ' ditolak dan data dihapus.');
    }

    /**
     * Hapus Face Descriptor
     */
    public function deleteFace(Participant $participant)
    {
        if ($participant->photo_path) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($participant->photo_path);
        }

        $participant->update([
            'face_descriptor' => null,
            'photo_path' => null,
            'face_status' => 'none'
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
        $activeWorkcode = Workcode::getActive();

        if (!$activeWorkcode) {
            return response()->json([
                'status' => 'error',
                'message' => 'Belum ada Workcode yang aktif. Presensi saat ini ditutup.',
            ], 400);
        }

        $request->validate([
            'descriptor' => 'required|array',
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
        if ($activeWorkcode->latitude && $activeWorkcode->longitude) {
            if (!$request->filled('latitude') || (!$request->filled('longitude'))) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Gagal mendapatkan lokasi GPS dari perangkat.',
                ], 400);
            }

            $distance = $this->calculateDistance(
                $activeWorkcode->latitude, $activeWorkcode->longitude,
                $request->latitude, $request->longitude
            );

            $radiusLimit = $activeWorkcode->radius_meters ?? 100;
            
            if ($distance > $radiusLimit) {
                $distanceFmt = number_format($distance, 0);
                return response()->json([
                    'status' => 'error',
                    'message' => "Anda berada di luar radius presensi ({$distanceFmt} meter). Anda harus berada dalam radius {$radiusLimit} meter.",
                ], 403);
            }
        }

        // === Pencocokan Wajah ===
        // HANYA COCOKKAN WAJAH YANG STATUSNYA APPROVED
        $participants = Participant::whereNotNull('face_descriptor')
            ->where('face_status', 'approved')
            ->get();
        
        $bestMatch = null;
        // Standar dlib / face-api.js euclidean distance threshold: ~0.58
        // 0.45 sebelumnya terlalu ketat sehingga menolak wajah asli karena pencahayaan webcam.
        $bestDistance = 0.58; 

        // Jika user yang login adalah peserta terdaftar, cek wajah dirinya terlebih dahulu
        $loggedInParticipantId = auth()->check() ? auth()->user()->participant_id : null;
        if ($loggedInParticipantId) {
            $myParticipant = $participants->firstWhere('id', $loggedInParticipantId);
            if ($myParticipant && $myParticipant->face_descriptor) {
                $myDist = $this->getMinDistance($inputDescriptor, $myParticipant->face_descriptor);
                \Log::info("Distance computed for logged in user ({$myParticipant->nama}): " . $myDist);
                if ($myDist < $bestDistance) {
                    $bestDistance = $myDist;
                    $bestMatch = $myParticipant;
                }
            }
        }

        // Jika belum match atau bukan self-presensi, cari dari seluruh database
        if (!$bestMatch) {
            foreach ($participants as $p) {
                $dbDescriptor = $p->face_descriptor;
                $dist = $this->getMinDistance($inputDescriptor, $dbDescriptor);
                
                \Log::info("Distance computed between input and " . $p->nama . ": " . $dist);
                
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
        $alreadyAttended = Attendance::where('workcode_id', $activeWorkcode->id)
            ->where('participant_id', $bestMatch->id)
            ->exists();

        if ($alreadyAttended) {
            return response()->json([
                'status' => 'already',
                'message' => 'Anda sudah melakukan presensi untuk workcode "' . $activeWorkcode->nama_workcode . '".',
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
            $deviceAttendance = Attendance::where('workcode_id', $activeWorkcode->id)
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

        // Cek keterlambatan menggunakan fungsi helper dari model Workcode atau dikalkulasi di sini
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
            'workcode_id' => $activeWorkcode->id,
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
