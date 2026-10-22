<?php

namespace App\Models;

use App\Support\PrivateFile;
use Illuminate\Database\Eloquent\Model;

/**
 * Satu wajah yang pernah disetujui admin untuk peserta (halaman Data Peserta → Riwayat Wajah).
 * File fotonya disimpan selamanya: foto yang tercatat di sini tidak dihapus saat diganti,
 * hanya saat pesertanya dihapus.
 */
class FaceHistory extends Model
{
    public const SOURCES = [
        'registration' => 'Pendaftaran wajah',
        'photo_change' => 'Ganti foto',
        'admin' => 'Didaftarkan admin',
    ];

    protected $fillable = ['participant_id', 'photo_path', 'source', 'approved_by', 'approved_at'];

    protected $casts = [
        'approved_at' => 'datetime',
    ];

    /** Catat wajah aktif peserta yang baru saja disetujui. */
    public static function record(Participant $participant, string $source, ?int $approvedBy): self
    {
        return self::create([
            'participant_id' => $participant->id,
            'photo_path' => $participant->photo_path,
            'source' => $source,
            'approved_by' => $approvedBy,
            'approved_at' => now(),
        ]);
    }

    /** Foto ini bagian dari riwayat wajah, jadi tidak boleh dihapus saat diganti/ditolak. */
    public static function isReferenced(?string $path): bool
    {
        return $path !== null && $path !== '' && self::where('photo_path', $path)->exists();
    }

    public static function deleteFileUnlessReferenced(?string $path): void
    {
        if ($path && ! self::isReferenced($path)) {
            PrivateFile::disk()->delete($path);
        }
    }

    public function participant()
    {
        return $this->belongsTo(Participant::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /** Untuk modal Riwayat Wajah (admin). Foto lama yang sudah terhapus sebelum fitur ini ada: photo_url null. */
    public function toAdminArray(?string $activePhotoPath): array
    {
        $available = $this->photo_path && PrivateFile::disk()->exists($this->photo_path);

        return [
            'id' => $this->id,
            'source' => $this->source,
            'source_label' => self::SOURCES[$this->source] ?? $this->source,
            'approved_at' => $this->approved_at?->toIso8601String(),
            'approved_by' => $this->approver?->name,
            'photo_url' => $available ? PrivateFile::url('face-history', $this) : null,
            'is_active' => $this->photo_path !== null && $this->photo_path === $activePhotoPath,
        ];
    }
}
