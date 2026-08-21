<?php

namespace App\Models;

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
        return $this->photo_path ? asset('storage/' . $this->photo_path) : null;
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
     * Cek apakah peserta sudah hadir.
     */
    public function hasAttended(): bool
    {
        return $this->attendances()->exists();
    }
}
