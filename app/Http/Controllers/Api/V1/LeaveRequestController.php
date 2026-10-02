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
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class LeaveRequestController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if (! in_array($user->role, ['admin', 'participant'], true)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses ditolak.',
            ], 403);
        }

        if ($user->role === 'participant' && (! $user->tokenCan('role:participant') || ! $user->participant_id)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses ditolak. Endpoint ini khusus untuk peserta yang terhubung.',
            ], 403);
        }

        if ($user->role === 'admin' && ! $user->tokenCan('role:admin')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses admin tidak tersedia untuk token ini.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'per_page' => 'nullable|integer|min:1|max:50',
            'status_approval' => ['nullable', Rule::in(['pending', 'approved', 'rejected'])],
            'participant_id' => 'nullable|integer|exists:participants,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $leaveRequests = LeaveRequest::query()
            ->with(['participant:id,nama,nis_nip', 'workcode:id,nama_workcode'])
            ->when($user->role === 'participant', fn ($query) => $query->where('participant_id', $user->participant_id))
            ->when($user->role === 'admin' && $request->filled('participant_id'), fn ($query) => $query->where('participant_id', $request->integer('participant_id')))
            ->when($request->filled('status_approval'), fn ($query) => $query->where('status_approval', $request->string('status_approval')->toString()))
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json([
            'status' => 'success',
            'data' => LeaveRequestResource::collection($leaveRequests->items()),
            'meta' => [
                'current_page' => $leaveRequests->currentPage(),
                'last_page' => $leaveRequests->lastPage(),
                'per_page' => $leaveRequests->perPage(),
                'total' => $leaveRequests->total(),
            ],
        ]);
    }

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

        $validator = Validator::make($request->all(), [
            'tipe_izin' => ['required', 'string', Rule::in(LeaveRequest::TIPE_IZIN)],
            'jenis_izin' => ['required', 'string', Rule::in(LeaveRequest::JENIS_IZIN)],
            'keterangan' => 'required|string|max:500',
            'tanggal' => 'required|date_format:Y-m-d',
            'izin_lebih_dari_satu_hari' => 'nullable|boolean',
            'tanggal_selesai' => [
                Rule::requiredIf($request->boolean('izin_lebih_dari_satu_hari')),
                'nullable',
                'date_format:Y-m-d',
                'after:tanggal',
            ],
            'dokumen' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $fileHash = hash_file('sha256', $request->file('dokumen')->getRealPath());

        $requestHash = hash('sha256', json_encode([
            'tipe_izin' => $request->input('tipe_izin'),
            'jenis_izin' => $request->input('jenis_izin'),
            'keterangan' => $request->input('keterangan'),
            'tanggal' => $request->input('tanggal'),
            'izin_lebih_dari_satu_hari' => $request->boolean('izin_lebih_dari_satu_hari'),
            'tanggal_selesai' => $request->input('tanggal_selesai'),
            'dokumen_hash' => $fileHash,
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

            $tanggalMulai = $request->input('tanggal');
            $tanggalSelesai = $request->boolean('izin_lebih_dari_satu_hari')
                ? $request->input('tanggal_selesai')
                : $tanggalMulai;

            $existing = LeaveRequest::where('participant_id', $user->participant_id)
                ->where('workcode_id', $activeWorkcode->id)
                ->whereDate('tanggal', '<=', $tanggalSelesai)
                ->where(function ($query) use ($tanggalMulai) {
                    $query->whereDate('tanggal_selesai', '>=', $tanggalMulai)
                        ->orWhere(function ($query) use ($tanggalMulai) {
                            $query->whereNull('tanggal_selesai')
                                ->whereDate('tanggal', '>=', $tanggalMulai);
                        });
                })
                ->first();

            if ($existing) {
                return $this->storeIdempotencyAndReturn($user->participant_id, $idempotencyKey, $requestHash, 400, [
                    'status' => 'error',
                    'message' => 'Anda sudah mengajukan izin untuk workcode ini pada tanggal tersebut.',
                ]);
            }

            $path = $request->file('dokumen')->store('dokumen_izin', 'public');

            $leaveRequest = LeaveRequest::create([
                'participant_id' => $user->participant_id,
                'workcode_id' => $activeWorkcode->id,
                'tanggal' => $tanggalMulai,
                'tanggal_selesai' => $request->boolean('izin_lebih_dari_satu_hari')
                    ? $tanggalSelesai
                    : null,
                'tipe' => 'izin',
                'tipe_izin' => $request->input('tipe_izin'),
                'jenis_izin' => $request->input('jenis_izin'),
                'keterangan' => $request->input('keterangan'),
                // Kept in sync for legacy report and admin views.
                'alasan' => $request->input('keterangan'),
                'bukti_path' => $path,
                'status_approval' => 'pending',
            ]);

            $successPayload = [
                'status' => 'success',
                'data' => [
                    'leave_request' => new LeaveRequestResource($leaveRequest),
                ],
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
