<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttendanceHistoryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'workcode' => $this->relationLoaded('workcode') && $this->workcode ? [
                'id' => $this->workcode->id,
                'nama_workcode' => $this->workcode->nama_workcode,
                'kategori' => $this->workcode->kategori,
            ] : null,
            'status' => $this->status,
            'waktu_hadir' => $this->waktu_hadir ? $this->waktu_hadir->toIso8601String() : null,
            'waktu_pulang' => $this->waktu_pulang ? $this->waktu_pulang->toIso8601String() : null,
            'created_at' => $this->created_at ? $this->created_at->toIso8601String() : null,
            'leave_request' => $this->relationLoaded('leaveRequest') && $this->leaveRequest ? [
                'id' => $this->leaveRequest->id,
                'status_approval' => $this->leaveRequest->status_approval,
                'tipe' => $this->leaveRequest->tipe,
            ] : null,
        ];
    }
}
