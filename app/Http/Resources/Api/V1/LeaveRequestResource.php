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
            'kategori' => 'izin',
            'tipe_izin' => $this->tipe_izin,
            'jenis_izin' => $this->jenis_izin,
            'tanggal' => $this->tanggal ? $this->tanggal->format('Y-m-d') : null,
            'izin_lebih_dari_satu_hari' => $this->tanggal_selesai !== null,
            'tanggal_selesai' => $this->tanggal_selesai ? $this->tanggal_selesai->format('Y-m-d') : null,
            'keterangan' => $this->keterangan ?? $this->alasan,
            'status_approval' => $this->status_approval,
            'has_dokumen' => ! empty($this->bukti_path),
            'participant' => $this->when($this->relationLoaded('participant') && $this->participant, [
                'id' => $this->participant->id,
                'nama' => $this->participant->nama,
                'nis_nip' => $this->participant->nis_nip,
            ]),
            'workcode' => $this->when($this->relationLoaded('workcode') && $this->workcode, [
                'id' => $this->workcode->id,
                'nama_workcode' => $this->workcode->nama_workcode,
            ]),
        ];
    }
}
