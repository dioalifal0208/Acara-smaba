<?php

namespace App\Models;

use App\Support\FaceDescriptor;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Participant extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama',
        'nis_nip',
        'status',
        'qr_token',
        'face_descriptor',
        'face_status',
        'photo_path',
    ];

    protected $casts = [
        'face_descriptor' => 'array',
    ];

    protected $appends = [
        'photo_url',
    ];

    /**
     * Get photo URL for participant.
     */
    public function getPhotoUrlAttribute(): ?string
    {
        return $this->photo_path ? asset('storage/'.$this->photo_path) : null;
    }

    /**
     * Auto-generate QR token saat membuat peserta baru.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($participant) {
            if (empty($participant->qr_token)) {
                $participant->qr_token = Str::uuid()->toString();
            }
        });
    }

    /**
     * Relasi ke attendances.
     */
    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    /**
     * Riwayat pengajuan perubahan foto dari peserta.
     */
    public function photoChangeRequests()
    {
        return $this->hasMany(PhotoChangeRequest::class);
    }

    /**
     * Alasan peserta belum boleh presensi wajah, atau null bila wajahnya sudah disetujui admin.
     * Dipakai bersama oleh presensi wajah web dan API Android.
     *
     * @return array{status: string, message: string}|null
     */
    public function faceAttendanceBlocker(): ?array
    {
        if ($this->face_status === 'approved' && FaceDescriptor::vectors($this->face_descriptor) !== []) {
            return null;
        }

        return match ($this->face_status) {
            'pending' => [
                'status' => 'face_pending',
                'message' => 'Data wajah Anda sudah didaftarkan dan masih menunggu persetujuan admin. Presensi wajah aktif otomatis setelah disetujui.',
            ],
            'rejected' => [
                'status' => 'face_rejected',
                'message' => 'Pendaftaran wajah Anda ditolak admin. Silakan daftar ulang wajah terlebih dahulu.',
            ],
            default => [
                'status' => 'face_not_registered',
                'message' => 'Data wajah Anda belum terdaftar. Silakan daftarkan wajah terlebih dahulu dan tunggu persetujuan admin.',
            ],
        };
    }

    /**
     * Cek apakah peserta sudah hadir.
     */
    public function hasAttended(): bool
    {
        return $this->attendances()->exists();
    }
}
