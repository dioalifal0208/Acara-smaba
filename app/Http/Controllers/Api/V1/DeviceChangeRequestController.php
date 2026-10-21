<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\DeviceChangeRequest;
use App\Support\DeviceLock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Pengajuan pindah perangkat dari HP baru. Peserta belum bisa login di HP itu (akun terkunci ke HP lama),
 * jadi endpoint ini memverifikasi username/password sendiri, bukan memakai token.
 */
class DeviceChangeRequestController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'login' => ['required', 'string'],
            'password' => ['required', 'string'],
            'device_id' => ['required', ...AuthController::DEVICE_ID_RULES],
            'device_model' => ['nullable', 'string', 'max:100'],
            'reason' => ['required', 'string', 'min:5', 'max:500'],
        ]);

        $user = AuthController::userFromCredentials($request);

        if (! $user) {
            return response()->json([
                'status' => 'error',
                'message' => __('auth.failed'),
            ], 401);
        }

        if (! DeviceLock::appliesTo($user)) {
            return response()->json([
                'status' => 'error',
                'code' => 'device_lock_not_applicable',
                'message' => 'Akun ini tidak memakai kunci perangkat. Silakan login langsung.',
            ], 422);
        }

        $deviceHash = DeviceLock::hash($request->input('device_id'));

        if ($user->device_id_hash === null || DeviceLock::matches($user, $deviceHash)) {
            return response()->json([
                'status' => 'error',
                'code' => 'device_already_allowed',
                'message' => 'Perangkat ini sudah dapat dipakai. Silakan login langsung.',
            ], 409);
        }

        if (DeviceLock::boundToOther($user, $deviceHash)) {
            return AuthController::deviceInUseResponse();
        }

        // Tidak ada batas jumlah pengajuan, tetapi hanya satu yang menunggu per akun:
        // pengajuan baru menggantikan pengajuan yang belum diproses.
        [$changeRequest, $created] = DB::transaction(function () use ($request, $user, $deviceHash) {
            $attributes = [
                'device_id_hash' => $deviceHash,
                'device_model' => $request->input('device_model'),
                'previous_device_model' => $user->device_model,
                'reason' => $request->input('reason'),
            ];

            $pending = DeviceChangeRequest::lockForUpdate()
                ->where('user_id', $user->id)
                ->where('status', 'pending')
                ->first();

            if ($pending) {
                $pending->update($attributes);

                return [$pending, false];
            }

            return [$user->deviceChangeRequests()->create($attributes + ['status' => 'pending']), true];
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Pengajuan pindah perangkat terkirim. Silakan login kembali setelah disetujui admin.',
            'data' => [
                'device_change_request' => $changeRequest->toApiArray(),
            ],
        ], $created ? 201 : 200);
    }
}
