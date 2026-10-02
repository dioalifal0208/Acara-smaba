<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\PhotoChangeRequestResource;
use App\Models\ApiIdempotencyLog;
use App\Models\Participant;
use App\Models\PhotoChangeRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class PhotoController extends Controller
{
    public function show(Request $request)
    {
        $user = $this->participantUser($request);
        if (! $user) {
            return $this->participantOnlyResponse();
        }

        $participant = $user->participant;
        $pendingRequest = $participant->photoChangeRequests()
            ->where('status', 'pending')
            ->latest()
            ->first();

        return response()->json([
            'status' => 'success',
            'data' => [
                'photo_url' => $this->activePhotoUrl($participant),
                'face_status' => $participant->face_status,
                'photo_change_request' => $pendingRequest
                    ? (new PhotoChangeRequestResource($pendingRequest))->resolve($request)
                    : null,
            ],
        ]);
    }

    public function storeChangeRequest(Request $request)
    {
        $user = $this->participantUser($request);
        if (! $user) {
            return $this->participantOnlyResponse();
        }

        $idempotencyKey = $request->header('Idempotency-Key');
        if (! $this->validIdempotencyKey($idempotencyKey)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Header Idempotency-Key tidak valid atau tidak ditemukan.',
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'photo' => 'required|image|mimes:jpg,jpeg,png,webp|max:5120',
            'face_descriptor' => 'nullable|array|min:1|max:512',
            'face_descriptor.*' => 'numeric',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $requestHash = hash('sha256', json_encode([
            'photo_hash' => hash_file('sha256', $request->file('photo')->getRealPath()),
            'face_descriptor' => $request->input('face_descriptor'),
        ]));
        $storedPath = null;

        try {
            return DB::transaction(function () use ($request, $user, $idempotencyKey, $requestHash, &$storedPath) {
                $existingLog = ApiIdempotencyLog::lockForUpdate()
                    ->where('participant_id', $user->participant_id)
                    ->where('idempotency_key', $idempotencyKey)
                    ->first();

                if ($existingLog) {
                    if ($existingLog->request_hash === $requestHash) {
                        return response()->json($existingLog->response_payload, $existingLog->response_code);
                    }

                    return response()->json([
                        'status' => 'error',
                        'message' => 'Konflik permintaan: Idempotency-Key sudah digunakan dengan payload yang berbeda.',
                    ], 409);
                }

                Participant::lockForUpdate()->findOrFail($user->participant_id);

                if (PhotoChangeRequest::where('participant_id', $user->participant_id)
                    ->where('status', 'pending')
                    ->exists()) {
                    return $this->storeIdempotencyAndReturn($user->participant_id, $idempotencyKey, $requestHash, 409, [
                        'status' => 'error',
                        'message' => 'Anda masih memiliki pengajuan perubahan foto yang menunggu verifikasi admin.',
                    ]);
                }

                $storedPath = $request->file('photo')->store('photo-change-requests', 'public');
                $changeRequest = PhotoChangeRequest::create([
                    'participant_id' => $user->participant_id,
                    'photo_path' => $storedPath,
                    'face_descriptor' => $request->input('face_descriptor'),
                    'status' => 'pending',
                ]);

                $payload = [
                    'status' => 'success',
                    'message' => 'Foto berhasil diajukan dan menunggu verifikasi admin.',
                    'data' => [
                        'photo_change_request' => (new PhotoChangeRequestResource($changeRequest))->resolve($request),
                    ],
                ];

                return $this->storeIdempotencyAndReturn($user->participant_id, $idempotencyKey, $requestHash, 201, $payload);
            });
        } catch (\Throwable $exception) {
            if ($storedPath) {
                Storage::disk('public')->delete($storedPath);
            }

            throw $exception;
        }
    }

    public function indexForAdmin(Request $request)
    {
        if (! $this->adminUser($request)) {
            return $this->adminOnlyResponse();
        }

        $validator = Validator::make($request->query(), [
            'status' => 'nullable|in:pending,approved,rejected',
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $requests = PhotoChangeRequest::with('participant')
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->query('status')))
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json([
            'status' => 'success',
            'data' => [
                'photo_change_requests' => $requests->getCollection()
                    ->map(fn (PhotoChangeRequest $changeRequest) => (new PhotoChangeRequestResource($changeRequest))->resolve($request))
                    ->values(),
            ],
            'meta' => [
                'current_page' => $requests->currentPage(),
                'last_page' => $requests->lastPage(),
                'per_page' => $requests->perPage(),
                'total' => $requests->total(),
            ],
        ]);
    }

    public function approve(Request $request, PhotoChangeRequest $photoChangeRequest)
    {
        $admin = $this->adminUser($request);
        if (! $admin) {
            return $this->adminOnlyResponse();
        }

        $oldPhotoPath = null;
        $result = DB::transaction(function () use ($admin, $photoChangeRequest, &$oldPhotoPath) {
            $changeRequest = PhotoChangeRequest::lockForUpdate()->findOrFail($photoChangeRequest->id);
            if ($changeRequest->status !== 'pending') {
                return null;
            }

            $participant = Participant::lockForUpdate()->findOrFail($changeRequest->participant_id);
            $oldPhotoPath = $participant->photo_path;

            $participant->photo_path = $changeRequest->photo_path;
            if ($changeRequest->face_descriptor !== null) {
                $participant->face_descriptor = $changeRequest->face_descriptor;
            }
            $participant->face_status = 'approved';
            $participant->save();

            $changeRequest->update([
                'status' => 'approved',
                'reviewed_by' => $admin->id,
                'reviewed_at' => now(),
                'rejection_reason' => null,
            ]);

            return $changeRequest->fresh();
        });

        if (! $result) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pengajuan foto ini sudah diproses.',
            ], 409);
        }

        if ($oldPhotoPath && $oldPhotoPath !== $result->photo_path) {
            Storage::disk('public')->delete($oldPhotoPath);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Foto pengguna telah disetujui dan diaktifkan.',
            'data' => [
                'photo_change_request' => (new PhotoChangeRequestResource($result))->resolve($request),
            ],
        ]);
    }

    public function reject(Request $request, PhotoChangeRequest $photoChangeRequest)
    {
        $admin = $this->adminUser($request);
        if (! $admin) {
            return $this->adminOnlyResponse();
        }

        $validator = Validator::make($request->all(), [
            'rejection_reason' => 'nullable|string|max:500',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $candidatePath = null;
        $result = DB::transaction(function () use ($admin, $photoChangeRequest, $request, &$candidatePath) {
            $changeRequest = PhotoChangeRequest::lockForUpdate()->findOrFail($photoChangeRequest->id);
            if ($changeRequest->status !== 'pending') {
                return null;
            }

            $candidatePath = $changeRequest->photo_path;
            $changeRequest->update([
                'status' => 'rejected',
                'reviewed_by' => $admin->id,
                'reviewed_at' => now(),
                'rejection_reason' => $request->input('rejection_reason'),
            ]);

            return $changeRequest->fresh();
        });

        if (! $result) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pengajuan foto ini sudah diproses.',
            ], 409);
        }

        if ($candidatePath) {
            Storage::disk('public')->delete($candidatePath);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Pengajuan perubahan foto ditolak.',
            'data' => [
                'photo_change_request' => (new PhotoChangeRequestResource($result))->resolve($request),
            ],
        ]);
    }

    private function participantUser(Request $request): mixed
    {
        $user = $request->user();

        return $user && $user->tokenCan('role:participant') && $user->role === 'participant' && $user->participant_id
            ? $user
            : null;
    }

    private function adminUser(Request $request): mixed
    {
        $user = $request->user();

        return $user && $user->tokenCan('role:admin') && $user->isAdmin() ? $user : null;
    }

    private function participantOnlyResponse()
    {
        return response()->json([
            'status' => 'error',
            'message' => 'Akses ditolak. Endpoint ini khusus untuk peserta.',
        ], 403);
    }

    private function adminOnlyResponse()
    {
        return response()->json([
            'status' => 'error',
            'message' => 'Akses ditolak. Endpoint ini khusus untuk administrator.',
        ], 403);
    }

    private function validIdempotencyKey(?string $key): bool
    {
        return $key !== null && preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $key) === 1;
    }

    private function activePhotoUrl(Participant $participant): ?string
    {
        if ($participant->face_status !== 'approved' || ! $participant->photo_path) {
            return null;
        }

        return Storage::disk('public')->exists($participant->photo_path)
            ? url('/storage/'.$participant->photo_path)
            : null;
    }

    private function storeIdempotencyAndReturn(int $participantId, string $key, string $hash, int $code, array $payload)
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
