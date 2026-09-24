<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\LeaveRequestResource;
use App\Models\ApiIdempotencyLog;
use App\Models\LeaveRequest;
use App\Models\Workcode;
use App\Services\AttendanceValidationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class LeaveRequestController extends Controller
{
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
            'tipe' => 'required|in:izin,sakit',
            'alasan' => 'required|string|max:500',
            'bukti' => 'required|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $fileHash = hash_file('sha256', $request->file('bukti')->getRealPath());
        
        $requestHash = hash('sha256', json_encode([
            'tipe' => $request->input('tipe'),
            'alasan' => $request->input('alasan'),
            'bukti_hash' => $fileHash,
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
                $validationService->validateWorkcodeActive($activeWorkcode);
            } catch (ValidationException $e) {
                return $this->storeIdempotencyAndReturn($user->participant_id, $idempotencyKey, $requestHash, $e->status, [
                    'status' => 'error',
                    'message' => $e->validator->errors()->first(),
                ]);
            }

            $existing = LeaveRequest::where('participant_id', $user->participant_id)
                ->where('workcode_id', $activeWorkcode->id)
                ->whereDate('tanggal', now()->toDateString())
                ->first();

            if ($existing) {
                return $this->storeIdempotencyAndReturn($user->participant_id, $idempotencyKey, $requestHash, 400, [
                    'status' => 'error',
                    'message' => 'Anda sudah mengajukan izin/sakit untuk workcode ini pada tanggal tersebut.',
                ]);
            }

            $path = $request->file('bukti')->store('bukti_izin', 'public');

            $leaveRequest = LeaveRequest::create([
                'participant_id' => $user->participant_id,
                'workcode_id' => $activeWorkcode->id,
                'tanggal' => now()->toDateString(),
                'tipe' => $request->input('tipe'),
                'alasan' => $request->input('alasan'),
                'bukti_path' => $path,
                'status_approval' => 'pending',
            ]);

            $successPayload = [
                'status' => 'success',
                'data' => [
                    'leave_request' => new LeaveRequestResource($leaveRequest)
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
