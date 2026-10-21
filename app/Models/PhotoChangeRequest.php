<?php

namespace App\Models;

use App\Support\FaceMatcher;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PhotoChangeRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'participant_id',
        'photo_path',
        'face_descriptor',
        'status',
        'reviewed_by',
        'reviewed_at',
        'rejection_reason',
    ];

    protected $casts = [
        'face_descriptor' => 'array',
        'reviewed_at' => 'datetime',
    ];

    /**
     * Terapkan pengajuan yang disetujui ke peserta (belum disimpan). Dipakai bersama oleh API admin
     * dan halaman admin web. Descriptor kandidat hanya dipakai bila berisi sampel 128-d model
     * face-api.js; face_status menjadi approved hanya bila peserta akhirnya punya minimal satu sampel
     * kompatibel, selain itu descriptor & status sebelumnya dipertahankan.
     *
     * @return bool true bila descriptor wajah peserta berubah
     */
    public function applyApprovalTo(Participant $participant): bool
    {
        $participant->photo_path = $this->photo_path;

        $descriptorChanged = false;
        if ($this->face_descriptor !== null && FaceMatcher::compatibleSampleCount($this->face_descriptor) > 0) {
            $participant->face_descriptor = $this->face_descriptor;
            $descriptorChanged = true;
        }

        if (FaceMatcher::compatibleSampleCount($participant->face_descriptor) > 0) {
            $participant->face_status = 'approved';
        }

        return $descriptorChanged || $participant->isDirty('face_status');
    }

    public function participant()
    {
        return $this->belongsTo(Participant::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
