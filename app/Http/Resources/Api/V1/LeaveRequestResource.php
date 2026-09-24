<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeaveRequestResource extends JsonResource
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
            'tipe' => $this->tipe,
            'tanggal' => $this->tanggal ? $this->tanggal->format('Y-m-d') : null,
            'alasan' => $this->alasan,
            'status_approval' => $this->status_approval,
            'has_proof' => !empty($this->bukti_path),
        ];
    }
}
