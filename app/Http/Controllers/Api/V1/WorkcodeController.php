<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\WorkcodeResource;
use App\Models\Attendance;
use App\Models\Workcode;
use Illuminate\Http\Request;

class WorkcodeController extends Controller
{
    /**
     * Get the active workcode.
     */
    public function active(Request $request)
    {
        $user = $request->user();

        if (! $user->tokenCan('role:participant') || $user->role !== 'participant' || ! $user->participant_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses ditolak. Endpoint ini khusus untuk peserta.',
            ], 403);
        }

        $activeWorkcode = Workcode::getActive();

        if (! $activeWorkcode) {
            return response()->json([
                'status' => 'success',
                'data' => null,
            ]);
        }

        // 🌟 LOGIKA BARU: Cek presensi user untuk workcode ini
        $presensiHariIni = null;

        if ($user && $user->participant_id) {
            $attendanceQuery = Attendance::where('workcode_id', $activeWorkcode->id)
                ->where('participant_id', $user->participant_id);

            // Jika kategori harian atau 24_jam, filter hanya presensi di hari ini saja
            if (in_array($activeWorkcode->kategori, ['harian', '24_jam'])) {
                $attendanceQuery->whereDate('created_at', now()->toDateString());
            }

            $attendance = $attendanceQuery->first();

            if ($attendance) {
                $presensiHariIni = [
                    'waktu_hadir' => $attendance->waktu_hadir,
                    'waktu_pulang' => $attendance->waktu_pulang,
                ];
            }
        }

        // 🌟 PERUBAHAN JSON: Bungkus WorkcodeResource dan data presensi menjadi satu
        return response()->json([
            'status' => 'success',
            'data' => [
                'workcode_aktif' => new WorkcodeResource($activeWorkcode),
                'presensi_hari_ini' => $presensiHariIni,
            ],
        ]);
    }
}
