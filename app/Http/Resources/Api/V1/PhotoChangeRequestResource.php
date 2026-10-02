<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class PhotoChangeRequestResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = [
            'id' => $this->id,
            'status' => $this->status,
            'photo_url' => $this->photo_path && Storage::disk('public')->exists($this->photo_path)
                ? url('/storage/'.$this->photo_path)
                : null,
            'created_at' => $this->created_at?->toIso8601String(),
            'reviewed_at' => $this->reviewed_at?->toIso8601String(),
            'rejection_reason' => $this->rejection_reason,
        ];

        if ($this->relationLoaded('participant') && $this->participant) {
            $data['participant'] = [
                'id' => $this->participant->id,
                'nama' => $this->participant->nama,
                'nis_nip' => $this->participant->nis_nip,
            ];
        }

        return $data;
    }
}
