<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WorkcodeResource extends JsonResource
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
            'nama_workcode' => $this->nama_workcode,
            'kategori' => $this->kategori,
            'tanggal' => $this->tanggal,
            'hari_aktif' => $this->hari_aktif,
            'jam_datang_mulai' => $this->jam_datang_mulai,
            'jam_datang_selesai' => $this->jam_datang_selesai,
            'jam_pulang_mulai' => $this->jam_pulang_mulai,
            'jam_pulang_selesai' => $this->jam_pulang_selesai,
            'latitude' => $this->latitude ? (float) $this->latitude : null,
            'longitude' => $this->longitude ? (float) $this->longitude : null,
            'radius_meters' => $this->radius_meters,
            'jadwal_per_hari' => $this->jadwal_per_hari,
        ];
    }
}
