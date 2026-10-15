<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Participant;
use App\Models\Workcode;
use App\Services\AttendanceValidationService;
use App\Support\FaceDescriptor;
use Carbon\Carbon;
use Illuminate\Cache\RateLimiter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

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
     * Ambang jarak Euclidean face-api.js (standar dlib ~0.6), dari config/attendance.php.
     * 0.45 sebelumnya terlalu ketat sehingga menolak wajah asli karena pencahayaan webcam.
     */
    private function matchThreshold(): float
    {
        return (float) config('attendance.face.threshold_web');
    }

    private function faceFailureLimiter(): RateLimiter
    {
        return app(RateLimiter::class);
    }

    /** Penghitung kegagalan wajah per peserta (jendela failure_window_minutes). */
    private function faceFailureKey(Participant $participant): string
    {
        return 'face-match-failures|'.$participant->id;
    }

    /** Kunci sementara presensi wajah per peserta (lockout_minutes). */
    private function faceLockKey(Participant $participant): string
    {
        return 'face-match-lock|'.$participant->id;
    }

    private function lockFaceAttempts(Participant $participant): void
    {
        $this->faceFailureLimiter()->hit($this->faceLockKey($participant), config('attendance.face.lockout_minutes') * 60);
        $this->faceFailureLimiter()->clear($this->faceFailureKey($participant));
    }

    /**
     * Jarak terdekat antara input descriptor dan descriptor tersimpan (single atau beberapa sampel wajah depan).
     */
    private function getMinDistance(array $inputDescriptor, $dbDescriptor): float
    {
        return FaceDescriptor::minDistance($inputDescriptor, $dbDescriptor) ?? INF;
    }

    /**
     * Tolak kiriman descriptor pendaftaran yang tidak valid.
     */
    private function validateEnrollmentDescriptor(Request $request, bool $requireMultiple): void
    {
        $error = FaceDescriptor::validateEnrollment($request->input('descriptor'), $requireMultiple);

        if ($error) {
            throw ValidationException::withMessages(['descriptor' => $error]);
        }
    }

    /**
     * Register Face Descriptor untuk seorang Participant (Admin Only)
     */
    public function register(Request $request, Participant $participant)
    {
        $request->validate([
            'descriptor' => 'required|array',
            'photo' => 'nullable|string',
        ]);
        $this->validateEnrollmentDescriptor($request, requireMultiple: false);

        $updateData = [
            'face_descriptor' => $request->input('descriptor'),
            'face_status' => 'approved', // Admin langsung approved
        ];

        if ($request->has('photo')) {
            $photoData = $request->input('photo');
            if (preg_match('/^data:image\/(\w+);base64,/', $photoData, $type)) {
                $photoData = substr($photoData, strpos($photoData, ',') + 1);
                $type = strtolower($type[1]);
                if (in_array($type, ['jpg', 'jpeg', 'png'])) {
                    $photoData = base64_decode($photoData);
                    $filename = 'faces/'.$participant->id.'_'.time().'.'.$type;
                    Storage::disk('private')->put($filename, $photoData);

                    // delete old photo if exists
                    if ($participant->photo_path) {
                        Storage::disk('private')->delete($participant->photo_path);
                    }

                    $updateData['photo_path'] = $filename;
                }
            }
        }

        // Simpan 128-dimensional array dan photo
        $participant->update($updateData);

        return response()->json([
            'status' => 'success',
            'message' => 'Data wajah berhasil didaftarkan untuk '.$participant->nama,
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
            'photo' => 'nullable|string',
        ]);
        // Peserta wajib melalui pemindaian terpandu (beberapa sampel wajah depan, bukan satu frame).
        $this->validateEnrollmentDescriptor($request, requireMultiple: true);

        $updateData = [
            'face_descriptor' => $request->input('descriptor'),
            'face_status' => 'pending',
        ];

        if ($request->has('photo')) {
            $photoData = $request->input('photo');
            if (preg_match('/^data:image\/(\w+);base64,/', $photoData, $type)) {
                $photoData = substr($photoData, strpos($photoData, ',') + 1);
                $type = strtolower($type[1]);
                if (in_array($type, ['jpg', 'jpeg', 'png'])) {
                    $photoData = base64_decode($photoData);
                    $filename = 'faces/'.$participant->id.'_self_'.time().'.'.$type;
                    Storage::disk('private')->put($filename, $photoData);

                    // delete old photo if exists
                    if ($participant->photo_path) {
                        Storage::disk('private')->delete($participant->photo_path);
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

        return redirect()->back()->with('success', 'Wajah peserta '.$participant->nama.' berhasil disetujui.');
    }

    /**
     * Reject Face Descriptor (Admin Only)
     */
    public function rejectFace(Participant $participant)
    {
        // Hapus foto jika ditolak
        if ($participant->photo_path) {
            Storage::disk('private')->delete($participant->photo_path);
        }

        $participant->update([
            'face_status' => 'rejected',
            'face_descriptor' => null,
            'photo_path' => null,
        ]);

        return redirect()->back()->with('success', 'Wajah peserta '.$participant->nama.' ditolak dan data dihapus.');
    }

    /**
     * Hapus Face Descriptor
     */
    public function deleteFace(Participant $participant)
    {
        if ($participant->photo_path) {
            Storage::disk('private')->delete($participant->photo_path);
        }

        $participant->update([
            'face_descriptor' => null,
            'photo_path' => null,
            'face_status' => 'none',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Data wajah berhasil dihapus untuk '.$participant->nama,
        ]);
    }

    /**
     * Match Face Descriptor & Process Attendance
     */
    public function match(Request $request)
    {
        $activeWorkcode = Workcode::getActive();

        if (! $activeWorkcode) {
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
            'workcode_id' => 'nullable|integer|exists:workcodes,id',
            'face_capture' => ['nullable', 'string', 'max:1500000', 'regex:/^data:image\\/jpeg;base64,/'],
        ]);

        $inputDescriptor = $request->input('descriptor');

        $isAdmin = auth()->check() && (auth()->user()->role === 'admin' || auth()->user()->role === 'superadmin');

        // Peserta yang login hanya boleh dicocokkan dengan wajahnya sendiri (1:1), dan hanya
        // setelah wajahnya disetujui admin. Jangan pernah mencari ke peserta lain, karena itu
        // bisa mencatat presensi atas nama orang lain yang mirip.
        // Selain admin, HANYA peserta dengan data peserta tertaut yang boleh memakai endpoint ini;
        // akun lain tidak pernah mendapat pencarian ke seluruh wajah.
        $selfParticipant = null;
        if (! $isAdmin) {
            $selfParticipant = auth()->user()?->participant_id
                ? Participant::find(auth()->user()->participant_id)
                : null;

            if (! $selfParticipant) {
                return response()->json([
                    'status' => 'face_not_registered',
                    'message' => 'Data peserta untuk akun ini tidak ditemukan. Hubungi admin.',
                ], 403);
            }

            if ($blocker = $selfParticipant->faceAttendanceBlocker()) {
                return response()->json($blocker, 403);
            }

            // Terkunci sementara setelah gagal berulang (mencegah coba-coba dengan foto/wajah lain).
            if ($this->faceFailureLimiter()->tooManyAttempts($this->faceLockKey($selfParticipant), 1)) {
                $minutes = max(1, (int) ceil($this->faceFailureLimiter()->availableIn($this->faceLockKey($selfParticipant)) / 60));

                return response()->json([
                    'status' => 'locked',
                    'message' => "Terlalu banyak percobaan wajah yang gagal. Coba lagi dalam {$minutes} menit atau hubungi admin.",
                ], 429);
            }
        }

        // === Validasi GPS (Mirip Self Check-in) ===
        // Bypassed jika yang melakukan scan adalah Admin
        if (! $isAdmin) {
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

                // Kita longgarkan batasan waktu menjadi 1 jam karena jam di HP peserta sering tidak sinkron
                if ($timeDiff > 3600) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Waktu perangkat tidak sinkron dengan server.',
                    ], 400);
                }
            }
        }

        // Cek batasan radius
        if ($activeWorkcode->latitude && $activeWorkcode->longitude) {
            if (! $request->filled('latitude') || (! $request->filled('longitude'))) {
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
        $bestMatch = null;

        if ($selfParticipant) {
            // Peserta login: hanya bandingkan dengan wajahnya sendiri.
            if ($this->getMinDistance($inputDescriptor, $selfParticipant->face_descriptor) < $this->matchThreshold()) {
                $bestMatch = $selfParticipant;
                $this->faceFailureLimiter()->clear($this->faceFailureKey($selfParticipant));
            }

            if (! $bestMatch) {
                $this->faceFailureLimiter()->hit(
                    $this->faceFailureKey($selfParticipant),
                    config('attendance.face.failure_window_minutes') * 60,
                );

                // Gagal ke-N mengaktifkan kunci sementara.
                if ($this->faceFailureLimiter()->tooManyAttempts($this->faceFailureKey($selfParticipant), config('attendance.face.max_failures'))) {
                    $this->lockFaceAttempts($selfParticipant);
                    Log::warning('Presensi wajah dikunci sementara setelah gagal berulang.', ['participant_id' => $selfParticipant->id]);
                }

                return response()->json([
                    'status' => 'not_recognized',
                    'message' => 'Wajah tidak cocok dengan data wajah Anda. Hadapkan wajah lurus ke kamera dengan pencahayaan cukup lalu coba lagi.',
                ], 404);
            }
        } else {
            // Scanner admin: cari di antara wajah yang sudah disetujui.
            $bestDistance = $this->matchThreshold();
            $participants = Participant::whereNotNull('face_descriptor')
                ->where('face_status', 'approved')
                ->get();

            foreach ($participants as $p) {
                $dist = $this->getMinDistance($inputDescriptor, $p->face_descriptor);

                if ($dist < $bestDistance) {
                    $bestDistance = $dist;
                    $bestMatch = $p;
                }
            }
        }

        if (! $bestMatch) {
            return response()->json([
                'status' => 'not_recognized',
                'message' => 'Wajah tidak dikenali. Data wajah belum/tidak terdaftar atau belum disetujui admin.',
            ], 404);
        }

        // Jangan prioritaskan salah satu workcode jika peserta memiliki lebih
        // dari satu pilihan aktif. Klien harus meminta pilihan peserta dahulu.
        $availableWorkcodes = Workcode::getActiveWorkcodes($bestMatch);
        if ($availableWorkcodes->isEmpty()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tidak ada workcode aktif yang tersedia untuk peserta ini.',
            ], 403);
        }

        if (! $request->filled('workcode_id') && $availableWorkcodes->count() > 1) {
            return response()->json([
                'status' => 'workcode_selection_required',
                'message' => 'Pilih workcode untuk presensi wajah ini.',
                'participant' => $bestMatch->only(['id', 'nama', 'nis_nip', 'status']),
                'workcodes' => $availableWorkcodes->map(fn (Workcode $workcode) => [
                    'id' => $workcode->id,
                    'nama_workcode' => $workcode->nama_workcode,
                    'kategori' => $workcode->kategori,
                ])->values(),
            ], 409);
        }

        $activeWorkcode = $request->filled('workcode_id')
            ? $availableWorkcodes->firstWhere('id', $request->integer('workcode_id'))
            : $availableWorkcodes->first();

        if (! $activeWorkcode) {
            return response()->json([
                'status' => 'error',
                'message' => 'Workcode yang dipilih tidak tersedia untuk peserta ini.',
            ], 422);
        }

        // === Cek presensi hari ini ===
        // Workcode harian: presensi pertama = datang, presensi kedua = pulang.
        // Workcode kegiatan: cukup satu kali.
        $existingAttendance = Attendance::where('workcode_id', $activeWorkcode->id)
            ->where('participant_id', $bestMatch->id)
            ->whereDate('tanggal', now()->toDateString())
            ->first();

        if ($existingAttendance) {
            $isDaily = $activeWorkcode->kategori === 'harian';

            if (! $isDaily || $existingAttendance->waktu_pulang !== null) {
                return response()->json([
                    'status' => 'already',
                    'message' => $isDaily
                        ? 'Anda sudah melakukan presensi datang dan pulang hari ini untuk workcode "'.$activeWorkcode->nama_workcode.'".'
                        : 'Anda sudah melakukan presensi untuk workcode "'.$activeWorkcode->nama_workcode.'".',
                    'participant' => $bestMatch->only(['id', 'nama', 'nis_nip', 'status']),
                ]);
            }

            if ($windowError = $this->checkOutWindowError($activeWorkcode)) {
                return response()->json([
                    'status' => 'error',
                    'message' => $windowError,
                ], 400);
            }

            $existingAttendance->update(['waktu_pulang' => now()]);

            return response()->json([
                'status' => 'success',
                'type' => 'pulang',
                'message' => 'Presensi pulang berhasil dicatat!',
                'participant' => $bestMatch->only(['id', 'nama', 'nis_nip', 'status']),
                'timestamp' => $existingAttendance->waktu_pulang->format('H:i:s'),
                'is_late' => false,
                'late_formatted' => null,
            ]);
        }

        // Persiapkan data device dan IP untuk record Attendance (selalu dibutuhkan)
        $rawDeviceId = $request->input('device_id', '');
        $userAgent = $request->userAgent() ?? '';
        $ipAddress = $request->ip();
        $deviceHash = hash('sha256', $rawDeviceId.'|'.$userAgent);

        // Lakukan penguncian 1 perangkat 1 presensi seperti Self Check-in
        // Bypassed jika yang melakukan scan adalah Admin (auth()->check() == true dan isAdmin() atau role tertentu)
        // Kita cukup cek !auth()->check() karena peserta tidak punya akses ke scanner panitia, tapi karena peserta punya auth, kita cek role-nya.
        // Sebenarnya $request->user() bisa kita cek rolenya. Untuk amannya, kita anggap auth()->check() && auth()->user()->role === 'admin' bypass ini.
        $isAdmin = auth()->check() && (auth()->user()->role === 'admin' || auth()->user()->role === 'superadmin');

        if (! $isAdmin) {
            $deviceAttendance = Attendance::where('workcode_id', $activeWorkcode->id)
                ->where('device_hash', $deviceHash)
                ->whereDate('created_at', now()->toDateString())
                ->with('participant')
                ->first();

            if ($deviceAttendance && $deviceAttendance->participant && $deviceAttendance->participant_id !== $bestMatch->id) {
                $lockedParticipant = $deviceAttendance->participant;

                return response()->json([
                    'status' => 'device_locked',
                    'message' => 'Perangkat ini sudah digunakan untuk presensi atas nama '.$lockedParticipant->nama.'. 1 perangkat hanya diizinkan untuk 1 presensi.',
                ], 403);
            }
        }

        $waktuHadir = now();
        $lateFormatted = null;
        $isLate = false;

        // Keterlambatan hanya berlaku untuk Presensi Harian.
        if ($activeWorkcode->kategori === 'harian') {
            $todaySchedule = $activeWorkcode->jadwal_per_hari[$waktuHadir->dayOfWeekIso] ?? null;
            $checkInDeadline = $todaySchedule['jam_datang_selesai'] ?? $activeWorkcode->jam_datang_selesai;

            if ($checkInDeadline) {
                $targetDatangSelesai = Carbon::createFromTimeString($checkInDeadline)
                    ->setDate($waktuHadir->year, $waktuHadir->month, $waktuHadir->day);

                if ($waktuHadir->greaterThan($targetDatangSelesai)) {
                    $isLate = true;
                    $diffInMinutes = (int) $targetDatangSelesai->diffInMinutes($waktuHadir);
                    if ($diffInMinutes >= 60) {
                        $hours = floor($diffInMinutes / 60);
                        $minutes = $diffInMinutes % 60;
                        $lateFormatted = $minutes > 0 ? "{$hours} jam {$minutes} menit" : "{$hours} jam";
                    } else {
                        $lateFormatted = "{$diffInMinutes} menit";
                    }
                }
            }
        }

        // === Catat Presensi ===
        $faceCapturePath = $request->filled('face_capture')
            ? $this->storeFaceCapture($request->string('face_capture')->toString())
            : null;

        try {
            $attendance = Attendance::create([
                'workcode_id' => $activeWorkcode->id,
                'participant_id' => $bestMatch->id,
                'tanggal' => now()->toDateString(),
                'waktu_hadir' => $waktuHadir,
                'device_hash' => $deviceHash,
                'ip_address' => $ipAddress,
                'face_capture_path' => $faceCapturePath,
                'attendance_method' => 'wajah',
            ]);
        } catch (\Throwable $exception) {
            if ($faceCapturePath) {
                Storage::disk('private')->delete($faceCapturePath);
            }

            throw $exception;
        }

        return response()->json([
            'status' => 'success',
            'type' => 'datang',
            'message' => 'Presensi berhasil dicatat!',
            'participant' => $bestMatch->only(['id', 'nama', 'nis_nip', 'status']),
            'timestamp' => $attendance->waktu_hadir->format('H:i:s'),
            'is_late' => $isLate,
            'late_formatted' => $lateFormatted,
        ]);
    }

    /**
     * Pesan error bila sekarang di luar jam presensi pulang workcode harian, atau null bila boleh.
     * Memakai jadwal hari ini (jadwal_per_hari) bila ada, selain itu jam pulang umum workcode.
     */
    private function checkOutWindowError(Workcode $workcode): ?string
    {
        $now = now();
        [$start, $end] = app(AttendanceValidationService::class)->todayWindow($workcode, isPulang: true);

        if (! $start || ! $end) {
            return null;
        }

        $startAt = Carbon::createFromTimeString($start)->setDate($now->year, $now->month, $now->day);
        $endAt = Carbon::createFromTimeString($end)->setDate($now->year, $now->month, $now->day);
        if ($endAt->lt($startAt)) {
            $endAt->addDay();
        }

        if ($now->lt($startAt)) {
            return "Presensi datang sudah tercatat. Presensi pulang baru dibuka pukul {$start} WIB.";
        }
        if ($now->gt($endAt)) {
            return "Waktu presensi pulang sudah ditutup ({$start} – {$end} WIB).";
        }

        return null;
    }

    private function storeFaceCapture(string $dataUrl): string
    {
        $capture = base64_decode(Str::after($dataUrl, ','), true);

        if ($capture === false || strlen($capture) < 50) {
            throw ValidationException::withMessages([
                'face_capture' => 'Foto presensi wajah tidak valid. Silakan coba lagi.',
            ]);
        }

        $path = 'attendance-face-captures/'.Str::uuid().'.jpg';

        if (! Storage::disk('private')->put($path, $capture)) {
            throw ValidationException::withMessages([
                'face_capture' => 'Foto presensi wajah gagal disimpan. Silakan coba lagi.',
            ]);
        }

        return $path;
    }
}
