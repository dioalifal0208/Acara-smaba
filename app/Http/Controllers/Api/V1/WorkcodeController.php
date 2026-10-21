<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\WorkcodeResource;
use App\Services\AttendanceStateService;
use Illuminate\Http\Request;

class WorkcodeController extends Controller
{
    /**
     * Get the active workcode.
     */
    public function active(Request $request, AttendanceStateService $stateService)
    {
        $user = $request->user();

        if (! $user->tokenCan('role:participant') || $user->role !== 'participant' || ! $user->participant_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses ditolak. Endpoint ini khusus untuk peserta.',
            ], 403);
        }

        // Logika status presensi dipakai bersama dengan GET /api/v1/me/state.
        $state = $stateService->current($user->participant);
        $activeWorkcode = $state['workcode'];

        if (! $activeWorkcode) {
            return response()->json([
                'status' => 'success',
                // `data` tetap null agar klien lama tidak berubah; status tombol untuk klien baru ada di level atas.
                'data' => null,
                'attendance_ui' => $state['attendance_ui'],
            ]);
        }

        $attendance = $state['attendance'];

        // 🌟 PERUBAHAN JSON: Bungkus WorkcodeResource dan data presensi menjadi satu
        return response()->json([
            'status' => 'success',
            'data' => [
                'workcode_aktif' => new WorkcodeResource($activeWorkcode),
                'presensi_hari_ini' => $attendance ? [
                    'waktu_hadir' => $attendance->waktu_hadir,
                    'waktu_pulang' => $attendance->waktu_pulang,
                ] : null,
                'attendance_ui' => $state['attendance_ui'],
            ],
        ]);
    }
}
