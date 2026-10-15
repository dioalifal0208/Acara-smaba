<?php

namespace App\Models;

use App\Support\FaceDescriptor;
use App\Support\PrivateFile;
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

    /**
     * Data biometrik/pribadi tidak pernah ikut terserialisasi otomatis (mis. ke Inertia props
     * atau endpoint publik). `photo_url` sengaja TIDAK di-append: tambahkan eksplisit
     * (`->append('photo_url')`) hanya untuk admin atau pemilik data.
     */
    /** @var list<string> path file pribadi yang dihapus setelah peserta terhapus (bukan kolom). */
    public array $privateFilesToDelete = [];

    protected $hidden = [
        'face_descriptor',
        'photo_path',
    ];

    /**
     * URL foto wajah bertanda tangan sementara (lihat App\Support\PrivateFile).
     */
    public function getPhotoUrlAttribute(): ?string
    {
        return PrivateFile::url('participant-photo', $this);
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

        // Hapus seluruh file pribadi peserta. Path dikumpulkan sebelum delete (baris turunan
        // terhapus lewat cascade DB), file baru dihapus setelah baris benar-benar terhapus.
        static::deleting(function (Participant $participant) {
            $participant->privateFilesToDelete = PrivateFile::pathsOwnedByParticipant($participant->id);
        });
        static::deleted(function (Participant $participant) {
            PrivateFile::disk()->delete($participant->privateFilesToDelete);
        });
    }

    /**
     * Relasi ke attendances.
     */
    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    public function workcodes()
    {
        return $this->belongsToMany(Workcode::class)->withTimestamps();
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
