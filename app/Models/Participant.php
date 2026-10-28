<?php

namespace App\Models;

use App\Support\FaceAttemptLimiter;
use App\Support\FaceDescriptor;
use App\Support\FaceMatcher;
use App\Support\PrivateFile;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Participant extends Model
{
    use HasFactory;

    /** Status pegawai tidak tetap: tanpa NIP (diganti ID khusus) dan tidak masuk laporan presensi harian. */
    public const NON_PERMANENT_STATUSES = ['GTT', 'PTT'];

    /** Tahun "TMT" pada ID khusus GTT/PTT (posisi tahun TMT CPNS pada NIP). */
    public const STAFF_ID_TMT_YEAR = '2026';

    /** Kode jenis kelamin pada NIP: 1 = laki-laki, 2 = perempuan. */
    public const GENDER_CODES = ['L' => '1', 'P' => '2'];

    public static function isNonPermanent(?string $status): bool
    {
        return in_array($status, self::NON_PERMANENT_STATUSES, true);
    }

    /**
     * 15 digit pertama ID khusus GTT/PTT, mengikuti format NIP PNS: tanggal lahir (YYYYMMDD) +
     * tahun TMT (selalu 2026) + bulan didaftarkan (MM) + kode jenis kelamin (1/2). Null bila tanggal
     * lahir atau jenis kelamin belum diisi.
     */
    public function staffIdPrefix(): ?string
    {
        $gender = self::GENDER_CODES[$this->jenis_kelamin] ?? null;

        if (! $this->tanggal_lahir || ! $gender) {
            return null;
        }

        return $this->tanggal_lahir->format('Ymd')
            .self::STAFF_ID_TMT_YEAR
            .($this->created_at ?? now())->format('m')
            .$gender;
    }

    /**
     * ID khusus GTT/PTT 18 digit: awalan di atas + nomor urut 3 digit (001, 002, ...) yang belum dipakai
     * peserta lain dengan awalan sama (termasuk NIP asli). Dipakai sebagai username & password awal.
     */
    public function generateStaffId(): ?string
    {
        $prefix = $this->staffIdPrefix();

        if ($prefix === null) {
            return null;
        }

        $lastNumber = static::query()
            ->where('nis_nip', 'like', $prefix.'___')
            ->when($this->exists, fn (Builder $query) => $query->whereKeyNot($this->getKey()))
            ->pluck('nis_nip')
            ->filter(fn ($nip) => preg_match('/^\d{18}$/', $nip))
            ->map(fn ($nip) => (int) substr($nip, -3))
            ->max() ?? 0;

        return $prefix.str_pad((string) ($lastNumber + 1), 3, '0', STR_PAD_LEFT);
    }

    protected $fillable = [
        'nama',
        'nis_nip',
        'status',
        'tanggal_lahir',
        'jenis_kelamin',
        'qr_token',
        'face_descriptor',
        'face_status',
        'photo_path',
    ];

    protected $casts = [
        'face_descriptor' => 'array',
        'tanggal_lahir' => 'date',
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
        // Isi QR pribadi: siapa pun yang memegangnya bisa dipresensikan lewat scanner.
        'qr_token',
        // Data pribadi untuk ID GTT/PTT; dikirim eksplisit hanya di halaman admin.
        'tanggal_lahir',
    ];

    /**
     * NIS/NIP tersamar (4 digit terakhir) untuk membedakan peserta bernama sama di halaman
     * publik tanpa membocorkan nomor lengkap.
     */
    public function maskedNisNip(): ?string
    {
        if (! $this->nis_nip) {
            return null;
        }

        return str_repeat('•', max(0, mb_strlen($this->nis_nip) - 4)).mb_substr($this->nis_nip, -4);
    }

    /**
     * Data peserta minimal untuk respons publik (self check-in).
     *
     * @return array{id: int, nama: string, nis_nip: ?string, status: ?string}
     */
    public function toPublicArray(): array
    {
        return [
            'id' => $this->id,
            'nama' => $this->nama,
            'nis_nip' => $this->maskedNisNip(),
            'status' => $this->status,
        ];
    }

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

        // GTT/PTT tidak memakai NIP: nis_nip selalu ID khusus dari tanggal lahir & jenis kelamin.
        // ID lama dipertahankan selama awalannya masih cocok (nomor urut tidak berubah tiap disimpan);
        // diganti bila tanggal lahir/jenis kelamin dikoreksi atau peserta baru menjadi GTT/PTT.
        // Tanpa kedua data itu, belum ada ID (dan belum ada akun login).
        static::saving(function (Participant $participant) {
            if (! self::isNonPermanent($participant->status)) {
                return;
            }

            $prefix = $participant->staffIdPrefix();
            $current = $participant->exists && self::isNonPermanent($participant->getOriginal('status'))
                ? $participant->getOriginal('nis_nip')
                : null;

            $participant->nis_nip = $prefix === null
                ? null
                : (is_string($current) && preg_match('/^'.$prefix.'\d{3}$/', $current) ? $current : $participant->generateStaffId());
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

    /** Wajah yang pernah disetujui admin, terbaru dulu. */
    /** Hanya pegawai tetap (bukan GTT/PTT). Status kosong tetap ikut. */
    public function scopePermanentStaff(Builder $query): Builder
    {
        return $query->where(fn (Builder $query) => $query->whereNull('status')
            ->orWhereNotIn('status', self::NON_PERMANENT_STATUSES));
    }

    public function faceHistories()
    {
        return $this->hasMany(FaceHistory::class)->orderByDesc('approved_at')->orderByDesc('id');
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
     * Alasan peserta belum boleh presensi wajah, atau null bila wajahnya sudah disetujui admin
     * dan punya minimal satu sampel 128-d yang kompatibel dengan model wajah kanonik.
     * Dipakai bersama oleh presensi wajah web dan API Android.
     *
     * @return array{status: string, message: string}|null
     */
    public function faceAttendanceBlocker(): ?array
    {
        if ($this->face_status === 'approved') {
            if (FaceMatcher::compatibleSampleCount($this->face_descriptor) > 0) {
                return null;
            }

            // Disetujui tetapi tidak ada sampel 128-d (mis. 512-d dari aplikasi Android lama, atau kosong).
            return [
                'status' => 'face_reenroll_required',
                'message' => FaceDescriptor::vectors($this->face_descriptor) !== []
                    ? 'Data wajah Anda berasal dari versi aplikasi lama dan tidak kompatibel. Silakan daftarkan ulang wajah.'
                    : 'Data wajah Anda tidak ditemukan. Silakan daftarkan ulang wajah.',
            ];
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
     * Status wajah untuk klien (kontrak `face` di GET /api/v1/me/state dan /me). Tidak berisi descriptor.
     *
     * @return array{status: string, ready: bool, blocker: ?array, model: string, sample_count: int, can_enroll: bool, locked: bool, retry_after_seconds: ?int}
     */
    public function faceState(): array
    {
        $status = $this->face_status ?: 'none';
        $blocker = $this->faceAttendanceBlocker();
        $retryAfter = FaceAttemptLimiter::retryAfterSeconds($this);

        return [
            'status' => $status,
            'ready' => $blocker === null,
            'blocker' => $blocker,
            'model' => FaceMatcher::MODEL_ID,
            'sample_count' => FaceMatcher::compatibleSampleCount($this->face_descriptor),
            'can_enroll' => in_array($status, ['none', 'rejected', 'pending'], true)
                || ($blocker['status'] ?? null) === 'face_reenroll_required',
            'locked' => $retryAfter !== null,
            'retry_after_seconds' => $retryAfter,
        ];
    }

    /**
     * Cek apakah peserta sudah hadir.
     */
    public function hasAttended(): bool
    {
        return $this->attendances()->exists();
    }
}
