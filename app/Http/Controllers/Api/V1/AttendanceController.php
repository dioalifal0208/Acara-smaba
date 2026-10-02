<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ApiIdempotencyLog;
use App\Models\Attendance;
use App\Models\LeaveRequest;
use App\Models\Workcode;
use App\Services\AttendanceValidationService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AttendanceController extends Controller
{
    public function submit(Request $request, AttendanceValidationService $validationService)
    {
        Log::info('--- CEK REQUEST MASUK DARI ANDROID ---', [
            'ada_face_descriptor' => $request->has('face_descriptor'),
            'tipe_data' => gettype($request->input('face_descriptor')),
            'jumlah_data' => is_array($request->input('face_descriptor')) ? count($request->input('face_descriptor')) : 0,
        ]);

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

        // Hapus batasan size:128 agar menerima ukuran berapapun
        $validator = Validator::make($request->all(), [
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'accuracy' => 'nullable|numeric',
            'device_timestamp' => 'nullable|string|date',
            'installation_id' => 'required|uuid',
            'face_descriptor' => 'required|array',
            'face_descriptor.*' => 'required|numeric',
        ], [
            'face_descriptor.required' => 'Versi aplikasi Anda sudah usang. Wajib update ke versi terbaru di Play Store untuk mendukung sistem presensi Face Recognition.',
            'face_descriptor.array' => 'Format wajah tidak valid. Wajib update ke versi terbaru di Play Store.',
        ]);

        if ($validator->fails()) {
            $isUpgradeRequired = $validator->errors()->has('face_descriptor');

            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first(),
            ], $isUpgradeRequired ? 426 : 422);
        }

        $requestHash = hash('sha256', json_encode([
            'latitude' => $request->input('latitude'),
            'longitude' => $request->input('longitude'),
            'accuracy' => $request->input('accuracy'),
            'device_timestamp' => $request->input('device_timestamp'),
            'installation_id' => $request->input('installation_id'),
        ]));

        return DB::transaction(function () use ($request, $user, $idempotencyKey, $requestHash, $validationService) {

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

            $activeWorkcode = Workcode::getActive();

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
                ->whereDate('created_at', now()->toDateString())
                ->first();

            $isPulang = ($existingAttendance && $activeWorkcode->kategori === 'harian');
            $deviceHash = hash('sha256', $request->input('installation_id'));
            $gpsData = $request->only(['latitude', 'longitude', 'accuracy']);

            if ($request->filled('device_timestamp')) {
                $gpsData['device_timestamp'] = Carbon::parse($request->input('device_timestamp'))->timestamp * 1000;
            }

            try {
                if (! $isPulang) {
                    $validationService->validateDeviceLock($activeWorkcode, $deviceHash);
                }
                $validationService->validateGpsAndRadius($activeWorkcode, $gpsData);

                $this->validateFaceMatch(
                    $request->input('face_descriptor'),
                    $user->participant->face_descriptor ?? null
                );

            } catch (\Exception $e) {
                $errorData = json_decode($e->getMessage(), true);
                if ($errorData && isset($errorData['status'])) {
                    return $this->storeIdempotencyAndReturn($user->participant_id, $idempotencyKey, $requestHash, $e->getCode() ?: 400, $errorData);
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

                    $existingAttendance->update(['waktu_pulang' => now()]);

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

            $attendance = Attendance::create([
                'workcode_id' => $activeWorkcode->id,
                'participant_id' => $user->participant_id,
                'tanggal' => now()->toDateString(),
                'waktu_hadir' => now(),
                'device_hash' => $deviceHash,
                'ip_address' => $request->ip(),
                'status' => 'hadir',
                'leave_request_id' => $approvedPulangPermission?->id,
            ]);

            return $this->storeIdempotencyAndReturn($user->participant_id, $idempotencyKey, $requestHash, 201, [
                'status' => 'success',
                'message' => 'Presensi datang berhasil dicatat.',
                'data' => [
                    'attendance' => [
                        'id' => $attendance->id,
                        'status' => $attendance->status,
                        'checked_in_at' => $attendance->waktu_hadir->toIso8601String(),
                        'workcode' => [
                            'id' => $activeWorkcode->id,
                            'nama_workcode' => $activeWorkcode->nama_workcode,
                        ],
                    ],
                ],
            ]);
        });
    }

    private function validateFaceMatch($incomingDescriptor, $registeredDescriptorStr)
    {
        if (! $registeredDescriptorStr) {
            throw new \Exception(json_encode([
                'status' => 'error',
                'message' => 'Data wajah belum terdaftar (kosong).',
            ]), 400);
        }

        $registeredDescriptor = is_string($registeredDescriptorStr)
            ? json_decode($registeredDescriptorStr, true)
            : $registeredDescriptorStr;

        if (! is_array($registeredDescriptor)) {
            throw new \Exception(json_encode([
                'status' => 'error',
                'message' => 'Format data wajah di database rusak.',
            ]), 500);
        }

        $inSize = count($incomingDescriptor);
        $dbSize = count($registeredDescriptor);

        // Rekam data Android ke log agar bisa disalin manual ke DB (Cheat Code)
        Log::info('--- DATA WAJAH ANDROID ---', [
            'ukuran_android' => $inSize,
            'ukuran_web_db' => $dbSize,
            'array_android_lengkap' => json_encode($incomingDescriptor),
        ]);

        if ($inSize !== $dbSize) {
            throw new \Exception(json_encode([
                'status' => 'error',
                'message' => "Beda Model AI! Web menghasilkan $dbSize angka, Android menghasilkan $inSize angka.",
            ]), 400);
        }

        // Auto-normalize data dari Web agar cocok dengan L2 Normalization Android
        $dbNormSum = 0.0;
        foreach ($registeredDescriptor as $val) {
            $dbNormSum += ((float) $val * (float) $val);
        }
        $dbNorm = sqrt($dbNormSum);

        if ($dbNorm > 0 && abs($dbNorm - 1.0) > 0.01) {
            for ($i = 0; $i < $dbSize; $i++) {
                $registeredDescriptor[$i] = (float) $registeredDescriptor[$i] / $dbNorm;
            }
        }

        $sum = 0.0;
        for ($i = 0; $i < $inSize; $i++) {
            $diff = (float) $incomingDescriptor[$i] - (float) $registeredDescriptor[$i];
            $sum += $diff * $diff;
        }
        $distance = sqrt($sum);

        $threshold = 0.85;

        Log::info('[FACE-DEBUG] Jarak Kemiripan: '.round($distance, 4));

        if ($distance > $threshold) {
            throw new \Exception(json_encode([
                'status' => 'error',
                'message' => 'Wajah tidak cocok. Jarak: '.round($distance, 3),
            ]), 400);
        }
    }

    private function storeIdempotencyAndReturn($participantId, $key, $hash, $code, $payload)
    {
        ApiIdempotencyLog::create([
            'participant_id' => $participantId,
            'idempotency_key' => $key,
            'request_hash' => $hash,
            'response_code' => $code,
            'response_payload' => $payload,
        ]);

        return response()->json($payload, $code);
    }
}
