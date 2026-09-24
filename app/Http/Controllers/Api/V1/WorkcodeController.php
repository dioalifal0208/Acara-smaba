<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\WorkcodeResource;
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

        if (!$user->tokenCan('role:participant') || $user->role !== 'participant' || !$user->participant_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses ditolak. Endpoint ini khusus untuk peserta.',
            ], 403);
        }

        $activeWorkcode = Workcode::getActive();

        if (!$activeWorkcode) {
            return response()->json([
                'status' => 'success',
                'data' => null,
            ]);
        }

        return response()->json([
            'status' => 'success',
            'data' => new WorkcodeResource($activeWorkcode),
        ]);
    }
}
