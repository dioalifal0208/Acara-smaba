<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ApiIdempotencyLog;
use App\Models\Attendance;
use App\Models\LeaveRequest;
use App\Models\LocationIntegrityViolation;
use App\Models\Participant;
use App\Models\Workcode;
use App\Observers\AttendanceObserver;
use App\Services\AttendanceValidationService;
use App\Support\AttendanceFaceCapture;
use App\Support\FaceAttemptLimiter;
use App\Support\FaceDescriptor;
use App\Support\FaceMatcher;
use App\Support\LocationIntegrity;
use Carbon\Carbon;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AttendanceController extends Controller
{
    public function submit(Request $request, AttendanceValidationService $validationService)
    {
        $user = $request->user();

        if (! $user->tokenCan('role:participant') || $user->role !== 'participant' || ! $user->participant_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses ditolak. Endpoint ini khusus untuk peserta.',
            ], 403);
        }

        $idempotencyKey = $request->header('Idempotency-Key');

        if (! $idempotencyKey || ! preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $idempotencyKey)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Header Idempotency-Key tidak valid atau tidak ditemukan.',
            ], 400);
        }

        // Aplikasi lama tanpa face recognition sama sekali.
        if (! $request->filled('face_descriptor')) {
            return response()->json([
                'status' => 'app_update_required',
                'message' => 'Versi aplikasi Anda sudah usang. Wajib update ke versi terbaru di Play Store untuk mendukung sistem presensi Face Recognition.',
            ], 426);
        }

        // Satu model wajah untuk web & Android: face-api.js 128-d. Vector berdimensi lain (mis. 512-d
        // dari model Android lama) tidak bisa dibandingkan dengan data wajah tersimpan.
        if (config('attendance.face.enforce_dimensions', true)
            && (($request->filled('face_model') && $request->input('face_model') !== FaceMatcher::MODEL_ID)
                || ! FaceDescriptor::isCompatibleVector($request->input('face_descriptor')))) {
            return response()->json([
                'status' => 'face_model_mismatch',
                'message' => 'Versi aplikasi/model wajah tidak sesuai. Perbarui aplikasi.',
            ], 426);
        }

        $validator = Validator::make($request->all(), [
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'accuracy' => 'nullable|numeric',
            'device_timestamp' => 'nullable|string|date',
            'installation_id' => 'required|uuid',
            'face_descriptor' => 'required|array',
            'face_descriptor.*' => 'required|numeric',
            'face_model' => 'nullable|string',
            'face_capture' => AttendanceFaceCapture::RULES,
            ...LocationIntegrity::rules(),
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first(),
            ], 422);
        }

        // Anti fake GPS: diperiksa sebelum idempotensi agar setiap percobaan tercatat dan dievaluasi ulang.
        if ($blocked = $this->rejectFakeLocation($request, $user, $validator->validated()['location_integrity'] ?? null)) {
            return $blocked;
        }

        // Hash memuat sidik descriptor: Idempotency-Key yang sama dengan tangkapan wajah berbeda = 409.
        // Android memakai UUID baru per percobaan tangkap wajah, dan mengulang key hanya untuk retry jaringan.
        $requestHash = hash('sha256', json_encode([
            'latitude' => $request->input('latitude'),
            'longitude' => $request->input('longitude'),
            'accuracy' => $request->input('accuracy'),
            'device_timestamp' => $request->input('device_timestamp'),
            'installation_id' => $request->input('installation_id'),
            'face_model' => $request->input('face_model'),
            'face_descriptor_sha256' => hash('sha256', json_encode(array_map('floatval', array_values($request->input('face_descriptor'))))),
            ...($request->filled('face_capture') ? ['face_capture_sha256' => hash('sha256', $request->input('face_capture'))] : []),
        ]));

        // Foto wajah hasil scan (opsional) baru disimpan setelah semua validasi lolos; dihapus lagi bila transaksi gagal.
        $faceCapturePath = null;
        $storeFaceCapture = function () use ($request, &$faceCapturePath): ?string {
            return $faceCapturePath = $request->filled('face_capture')
                ? AttendanceFaceCapture::store($request->string('face_capture')->toString())
                : null;
        };

        try {
            return DB::transaction(function () use ($request, $user, $idempotencyKey, $requestHash, $validationService, $storeFaceCapture) {

                $log = ApiIdempotencyLog::lockForUpdate()
                    ->where('participant_id', $user->participant_id)
                    ->where('idempotency_key', $idempotencyKey)
                    ->first();

                if ($log) {
                    if ($log->request_hash === $requestHash) {
                        return response()->json($log->response_payload, $log->response_code);
                    } else {
                        return response()->json([
                            'status' => 'error',
                            'message' => 'Konflik permintaan: Idempotency-Key sudah digunakan dengan payload yang berbeda.',
                        ], 409);
                    }
                }

                $activeWorkcode = Workcode::getActive($user->participant);

                if (! $activeWorkcode && Workcode::getActive()) {
                    return $this->storeIdempotencyAndReturn($user->participant_id, $idempotencyKey, $requestHash, 403, [
                        'status' => 'error',
                        'message' => 'Workcode aktif tidak tersedia untuk akun Anda.',
                    ]);
                }

                try {
                    $validationService->validateWorkcodeActive($activeWorkcode, true);
                } catch (ValidationException $e) {
                    return $this->storeIdempotencyAndReturn($user->participant_id, $idempotencyKey, $requestHash, $e->status, [
                        'status' => 'error',
                        'message' => $e->validator->errors()->first(),
                    ]);
                }

                $existingAttendance = Attendance::where('workcode_id', $activeWorkcode->id)
                    ->where('participant_id', $user->participant_id)
                    ->whereDate('tanggal', now()->toDateString())
                    ->first();

                $isPulang = ($existingAttendance && $activeWorkcode->kategori === 'harian');
                $deviceHash = hash('sha256', $request->input('installation_id'));
                $gpsData = $request->only(['latitude', 'longitude', 'accuracy']);

                if ($request->filled('device_timestamp')) {
                    $gpsData['device_timestamp'] = Carbon::parse($request->input('device_timestamp'))->timestamp * 1000;
                }

                try {
                    // The server attendance record determines whether this is check-in or check-out.
                    $validationService->validateTimeWindow($activeWorkcode, $isPulang);

                    // Presensi wajah hanya untuk peserta yang wajahnya sudah disetujui admin.
                    if ($blocker = $user->participant?->faceAttendanceBlocker()) {

                        throw new \Exception(json_encode($blocker), 403);
                    }

                    // Kunci sementara setelah gagal berulang, dibagi dengan presensi wajah web.
                    if (FaceAttemptLimiter::isLocked($user->participant)) {
                        throw new \Exception(json_encode(FaceAttemptLimiter::lockedPayload($user->participant)), 429);
                    }

                    if (! $isPulang) {
                        $validationService->validateDeviceLock($activeWorkcode, $deviceHash, $user->participant_id);
                    }
                    $validationService->validateGpsAndRadius($activeWorkcode, $gpsData);

                    $this->validateFaceMatch($request->input('face_descriptor'), $user->participant);

                } catch (\Exception $e) {
                    $errorData = json_decode($e->getMessage(), true);
                    if ($errorData && isset($errorData['status'])) {
                        $code = (int) $e->getCode();

                        return $this->storeIdempotencyAndReturn($user->participant_id, $idempotencyKey, $requestHash, $code >= 400 && $code <= 599 ? $code : 400, $errorData);
                    }
                    throw $e;
                }

                if ($existingAttendance) {
                    if ($activeWorkcode->kategori === 'harian') {
                        if ($existingAttendance->waktu_pulang !== null) {
                            return $this->storeIdempotencyAndReturn($user->participant_id, $idempotencyKey, $requestHash, 200, [
                                'status' => 'already',
                                'message' => 'Anda sudah melakukan presensi pulang untuk workcode "'.$activeWorkcode->nama_workcode.'".',
                            ]);
                        }

                        // Aplikasi pengirim sudah menerima hasilnya dari respons ini; tidak perlu push FCM.
                        AttendanceObserver::withoutStatePush(fn () => $existingAttendance->update([
                            'waktu_pulang' => now(),
                            'face_capture_pulang_path' => $storeFaceCapture(),
                        ]));

                        return $this->storeIdempotencyAndReturn($user->participant_id, $idempotencyKey, $requestHash, 200, [
                            'status' => 'success',
                            'message' => 'Presensi pulang berhasil dicatat.',
                            'data' => [
                                'attendance' => [
                                    'id' => $existingAttendance->id,
                                    'status' => $existingAttendance->status,
                                    'checked_in_at' => $existingAttendance->waktu_hadir?->toIso8601String(),
                                    'checked_out_at' => $existingAttendance->waktu_pulang->toIso8601String(),
                                    'workcode' => [
                                        'id' => $activeWorkcode->id,
                                        'nama_workcode' => $activeWorkcode->nama_workcode,
                                    ],
                                ],
                            ],
                        ]);
                    }

                    return $this->storeIdempotencyAndReturn($user->participant_id, $idempotencyKey, $requestHash, 200, [
                        'status' => 'already',
                        'message' => 'Anda sudah melakukan presensi untuk workcode "'.$activeWorkcode->nama_workcode.'".',
                    ]);
                }

                if ($validationService->checkAlreadyAttended($activeWorkcode, $user->participant)) {
                    return $this->storeIdempotencyAndReturn($user->participant_id, $idempotencyKey, $requestHash, 200, [
                        'status' => 'already',
                        'message' => 'Anda sudah melakukan presensi untuk workcode "'.$activeWorkcode->nama_workcode.'".',
                    ]);
                }

                $approvedPulangPermission = LeaveRequest::where('participant_id', $user->participant_id)
                    ->where('workcode_id', $activeWorkcode->id)
                    ->whereDate('tanggal', '<=', now()->toDateString())
                    ->where(function ($query) {
                        $query->whereDate('tanggal_selesai', '>=', now()->toDateString())
                            ->orWhere(function ($query) {
                                $query->whereNull('tanggal_selesai')
                                    ->whereDate('tanggal', now()->toDateString());
                            });
                    })
                    ->where('status_approval', 'approved')
                    ->where('tipe_izin', 'tidak_absen_pulang')
                    ->first();

                $attendance = AttendanceObserver::withoutStatePush(fn () => Attendance::create([
                    'workcode_id' => $activeWorkcode->id,
                    'participant_id' => $user->participant_id,
                    'tanggal' => now()->toDateString(),
                    'waktu_hadir' => now(),
                    'device_hash' => $deviceHash,
                    'ip_address' => $request->ip(),
                    'face_capture_path' => $storeFaceCapture(),
                    'status' => 'hadir',
                    'attendance_method' => 'wajah',
                    'leave_request_id' => $approvedPulangPermission?->id,
                ]));

                $lateMinutes = $activeWorkcode->lateMinutes($attendance->waktu_hadir);

                return $this->storeIdempotencyAndReturn($user->participant_id, $idempotencyKey, $requestHash, 201, [
                    'status' => 'success',
                    'message' => $lateMinutes > 0
                        ? 'Presensi datang berhasil dicatat, tetapi terlambat '.Workcode::formatLateDuration($lateMinutes).'.'
                        : 'Presensi datang berhasil dicatat.',
                    'data' => [
                        'attendance' => [
                            'id' => $attendance->id,
                            'status' => $attendance->status,
                            'checked_in_at' => $attendance->waktu_hadir->toIso8601String(),
                            'is_late' => $lateMinutes > 0,
                            'late_minutes' => $lateMinutes,
                            'workcode' => [
                                'id' => $activeWorkcode->id,
                                'nama_workcode' => $activeWorkcode->nama_workcode,
                            ],
                        ],
                    ],
                ]);
            });
        } catch (UniqueConstraintViolationException $exception) {
            AttendanceFaceCapture::delete($faceCapturePath);

            // The unique index resolves concurrent first requests; replay its committed response.
            $log = ApiIdempotencyLog::query()
                ->where('participant_id', $user->participant_id)
                ->where('idempotency_key', $idempotencyKey)
                ->first();

            if ($log) {
                if ($log->request_hash === $requestHash) {
                    return response()->json($log->response_payload, $log->response_code);
                }

                return response()->json([
                    'status' => 'error',
                    'message' => 'Konflik permintaan: Idempotency-Key sudah digunakan dengan payload yang berbeda.',
                ], 409);
            }

            throw $exception;
        } catch (\Throwable $exception) {
            AttendanceFaceCapture::delete($faceCapturePath);

            throw $exception;
        }
    }

    /**
     * Pencocokan 1:1 dengan aturan tunggal FaceMatcher (sama persis dengan presensi wajah web).
     * Descriptor dan jarak sengaja tidak dicatat ke log karena termasuk data biometrik.
     */
    private function validateFaceMatch(array $incomingDescriptor, Participant $participant): void
    {
        // Tidak ada sampel 128-d sudah ditolak faceAttendanceBlocker (face_reenroll_required); ini pengaman.
        if (FaceMatcher::compatibleSampleCount($participant->face_descriptor) === 0) {
            throw new \Exception(json_encode($participant->faceAttendanceBlocker() ?? [
                'status' => 'face_reenroll_required',
                'message' => 'Data wajah Anda tidak kompatibel. Silakan daftarkan ulang wajah.',
            ]), 403);
        }

        if (! FaceMatcher::matches($incomingDescriptor, $participant->face_descriptor)) {
            FaceAttemptLimiter::recordFailure($participant);

            throw new \Exception(json_encode([
                'status' => 'face_mismatch',
                'message' => 'Wajah tidak cocok dengan data wajah Anda. Hadapkan wajah lurus ke kamera dengan pencahayaan cukup lalu coba lagi.',
            ]), 400);
        }

        FaceAttemptLimiter::clearFailures($participant);
    }

    /**
     * POST /api/v1/attendance/precheck: pemeriksaan anti fake GPS sebelum kamera dibuka, agar peserta
     * tidak perlu memindai wajah dulu untuk tahu presensinya ditolak. Percobaan curang tetap tercatat
     * di sini; presensi final (submit) memeriksa ulang dengan aturan yang sama.
     */
    public function precheck(Request $request)
    {
        $user = $request->user();

        if (! $user->tokenCan('role:participant') || $user->role !== 'participant' || ! $user->participant_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses ditolak. Endpoint ini khusus untuk peserta.',
            ], 403);
        }

        $validated = $request->validate([
            'accuracy' => 'nullable|numeric',
            ...LocationIntegrity::rules(),
        ]);

        return $this->rejectFakeLocation($request, $user, $validated['location_integrity'] ?? null)
            ?? response()->json(['status' => 'ok']);
    }

    /**
     * Tolak presensi dengan indikasi lokasi palsu (mock location, aplikasi fake GPS, root/hooking)
     * dan catat percobaannya untuk admin. Mengembalikan respons penolakan, atau null bila lolos.
     */
    private function rejectFakeLocation(Request $request, $user, ?array $signals)
    {
        if ($signals === null && config('attendance.location_integrity.require_signals')) {
            return response()->json([
                'status' => 'app_update_required',
                'message' => 'Versi aplikasi Anda belum mendukung pemeriksaan keamanan lokasi. Perbarui aplikasi untuk melakukan presensi.',
            ], 426);
        }

        $reasons = LocationIntegrity::violations($signals, $request->input('accuracy'));
        $developerOptions = ($signals['developer_options'] ?? false) === true;
        $record = fn (bool $blocked, array $logged) => LocationIntegrityViolation::create([
            'user_id' => $user->id,
            'participant_id' => $user->participant_id,
            'workcode_id' => Workcode::getActive($user->participant)?->id,
            'reasons' => $logged,
            'signals' => $signals,
            'blocked' => $blocked,
            'device_model' => $signals['device_model'] ?? $user->device_model,
            'ip_address' => $request->ip(),
        ]);

        if ($reasons === []) {
            // Opsi Pengembang aktif tidak menolak presensi, tetapi dicatat untuk admin
            // (sekali per peserta per hari agar precheck + submit tidak membanjiri catatan).
            if ($developerOptions && ! LocationIntegrityViolation::where('user_id', $user->id)
                ->where('blocked', false)
                ->whereDate('created_at', today())
                ->exists()) {
                $record(false, [LocationIntegrity::DEVELOPER_OPTIONS]);
            }

            return null;
        }

        $record(true, $developerOptions ? [...$reasons, LocationIntegrity::DEVELOPER_OPTIONS] : $reasons);

        return response()->json([
            'status' => 'fake_gps_detected',
            'message' => LocationIntegrity::message($reasons, $signals),
            'reasons' => $reasons,
        ], 403);
    }

    private function storeIdempotencyAndReturn($participantId, $key, $hash, $code, $payload)
    {
        // Transient errors must be reevaluated on retry with the same capture/key.
        if ($this->shouldStoreIdempotencyResponse($code, $payload)) {
            ApiIdempotencyLog::create([
                'participant_id' => $participantId,
                'idempotency_key' => $key,
                'request_hash' => $hash,
                'response_code' => $code,
                'response_payload' => $payload,
            ]);
        }

        return response()->json($payload, $code);
    }

    private function shouldStoreIdempotencyResponse(int $code, array $payload): bool
    {
        if ($code >= 200 && $code < 300) {
            return true;
        }

        // These face state blockers only change through a server-side state transition.
        return $code === 403 && in_array($payload['status'] ?? null, [
            'face_not_registered',
            'face_pending',
            'face_rejected',
            'face_reenroll_required',
        ], true);
    }
}
