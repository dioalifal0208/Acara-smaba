<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\AttendanceHistoryResource;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AttendanceHistoryController extends Controller
{
    /**
     * Get the authenticated participant's attendance history.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user->tokenCan('role:participant') || $user->role !== 'participant' || !$user->participant_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses ditolak. Endpoint ini khusus untuk peserta.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $perPage = $request->input('per_page', 15);

        $attendances = Attendance::with(['workcode', 'leaveRequest'])
            ->where('participant_id', $user->participant_id)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => AttendanceHistoryResource::collection($attendances->items()),
            'meta' => [
                'current_page' => $attendances->currentPage(),
                'last_page' => $attendances->lastPage(),
                'per_page' => $attendances->perPage(),
                'total' => $attendances->total(),
                'path' => $attendances->path(),
            ]
        ]);
    }
}
