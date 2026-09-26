<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ApiIdempotencyLog;
use App\Models\Attendance;
use App\Models\Workcode;
use App\Services\AttendanceValidationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    /**
     * Submit attendance for participant.
     */
    public function submit(Request $request, AttendanceValidationService $validationService)
    {
        $user = $request->user();

        if (!$user->tokenCan('role:participant') || $user->role !== 'participant' || !$user->participant_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses ditolak. Endpoint ini khusus untuk peserta.',
            ], 403);
        }

        $idempotencyKey = $request->header('Idempotency-Key');

        if (!$idempotencyKey || !preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $idempotencyKey)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Header Idempotency-Key tidak valid atau tidak ditemukan.',
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'accuracy' => 'nullable|numeric',
            'device_timestamp' => 'nullable|string|date',
            'installation_id' => 'required|uuid',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first(),
            ], 422);
        }

        // Generate deterministic request hash (exclude timestamps that might change if they retry with different time, wait, actually idempotency usually hashes exactly what they sent)
        $requestHash = hash('sha256', json_encode([
            'latitude' => $request->input('latitude'),
            'longitude' => $request->input('longitude'),
            'accuracy' => $request->input('accuracy'),
            'device_timestamp' => $request->input('device_timestamp'),
            'installation_id' => $request->input('installation_id'),
        ]));

        // Transaction for Idempotency
        return DB::transaction(function () use ($request, $user, $idempotencyKey, $requestHash, $validationService) {
            
            // Check if Idempotency Log already exists
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

            // --- Business Logic ---
            $activeWorkcode = Workcode::getActive();

            try {
                $validationService->validateWorkcodeActive($activeWorkcode, true);
            } catch (\Illuminate\Validation\ValidationException $e) {
                return $this->storeIdempotencyAndReturn($user->participant_id, $idempotencyKey, $requestHash, $e->status, [
                    'status' => 'error',
                    'message' => $e->validator->errors()->first(),
                ]);
            }

            $deviceHash = hash('sha256', $request->input('installation_id'));
            
            $gpsData = $request->only(['latitude', 'longitude', 'accuracy']);
            
            if ($request->filled('device_timestamp')) {
                // Convert ISO-8601 to milliseconds for AttendanceValidationService
                $gpsData['device_timestamp'] = Carbon::parse($request->input('device_timestamp'))->timestamp * 1000;
            }

            try {
                $validationService->validateDeviceLock($activeWorkcode, $deviceHash);
                $validationService->validateGpsAndRadius($activeWorkcode, $gpsData);
            } catch (\Exception $e) {
                $errorData = json_decode($e->getMessage(), true);
                if ($errorData && isset($errorData['status'])) {
                    return $this->storeIdempotencyAndReturn($user->participant_id, $idempotencyKey, $requestHash, $e->getCode(), $errorData);
                }
                throw $e;
            }

            if ($validationService->checkAlreadyAttended($activeWorkcode, $user->participant)) {
                return $this->storeIdempotencyAndReturn($user->participant_id, $idempotencyKey, $requestHash, 200, [
                    'status' => 'already',
                    'message' => 'Anda sudah melakukan presensi untuk workcode "' . $activeWorkcode->nama_workcode . '".',
                ]);
            }

            // Create Attendance
            $attendance = Attendance::create([
                'workcode_id' => $activeWorkcode->id,
                'participant_id' => $user->participant_id,
                'waktu_hadir' => now(),
                'device_hash' => $deviceHash,
                'ip_address' => $request->ip(),
                'status' => 'hadir',
            ]);

            $successPayload = [
                'status' => 'success',
                'data' => [
                    'attendance' => [
                        'id' => $attendance->id,
                        'status' => $attendance->status,
                        'checked_in_at' => $attendance->waktu_hadir->toIso8601String(),
                        'workcode' => [
                            'id' => $activeWorkcode->id,
                            'nama_workcode' => $activeWorkcode->nama_workcode,
                        ]
                    ]
                ]
            ];

            return $this->storeIdempotencyAndReturn($user->participant_id, $idempotencyKey, $requestHash, 201, $successPayload);
        });
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
