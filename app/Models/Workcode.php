<?php

namespace App\Models;

use App\Support\PrivateFile;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class Workcode extends Model
{
    use HasFactory;

    /** @var list<string> path file pribadi yang dihapus setelah workcode terhapus (bukan kolom). */
    public array $privateFilesToDelete = [];

    protected static function booted(): void
    {
        // Presensi & izin terhapus lewat cascade DB; bersihkan foto presensi, tanda tangan, dan dokumen izinnya.
        static::deleting(function (Workcode $workcode) {
            $workcode->privateFilesToDelete = PrivateFile::pathsOwnedByWorkcode($workcode->id);
        });
        static::deleted(function (Workcode $workcode) {
            PrivateFile::disk()->delete($workcode->privateFilesToDelete);
        });
    }

    protected $fillable = [
        'nama_workcode',
        'deskripsi',
        'kategori',
        'tanggal',
        'jam_aktif_mulai',
        'jam_aktif_selesai',
        'hari_aktif',
        'jam_datang_mulai',
        'jam_datang_selesai',
        'jam_pulang_mulai',
        'jam_pulang_selesai',
        'latitude',
        'longitude',
        'radius_meters',
        'is_active',
        'jadwal_per_hari',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'radius_meters' => 'integer',
        'hari_aktif' => 'array',
        'jadwal_per_hari' => 'array',
    ];

    /**
     * Relasi ke Attendance.
     */
    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    /** Peserta yang secara khusus dipilih admin untuk workcode ini. */
    public function participants()
    {
        return $this->belongsToMany(Participant::class)->withTimestamps();
    }

    /**
     * Peserta yang wajib presensi di workcode ini: peserta terpilih, atau semua peserta bila
     * workcode tidak membatasi. Dipakai rekap dashboard dan attendance:calculate-alpha.
     */
    public function eligibleParticipants(): Builder
    {
        $selectedIds = $this->participants()->pluck('participants.id');

        return Participant::query()->when($selectedIds->isNotEmpty(), fn (Builder $query) => $query->whereKey($selectedIds));
    }

    /**
     * Workcode tanpa peserta terpilih terbuka untuk semua peserta, kecuali kegiatan terbuka yang
     * ditutup karena ada kegiatan aktif lain yang sudah memilih peserta (lihat isClosedAmong).
     */
    public function isAvailableFor(Participant $participant): bool
    {
        if ($this->participants()->exists()) {
            return $this->participants()->whereKey($participant->getKey())->exists();
        }

        return $this->kategori === 'harian'
            || ! static::hasRestricted(static::getActiveWorkcodes()->reject(fn (self $workcode) => $workcode->is($this)));
    }

    /**
     * Kegiatan terbuka (tanpa peserta terpilih) ditutup untuk semua peserta selama ada kegiatan
     * aktif lain yang sudah memilih peserta. Presensi harian tidak ikut aturan ini agar presensi
     * harian sekolah tetap berjalan saat ada kegiatan. $activeWorkcodes wajib memuat participants_count.
     */
    public function isClosedAmong(Collection $activeWorkcodes): bool
    {
        return $this->kategori !== 'harian'
            && (int) $this->participants_count === 0
            && static::hasRestricted($activeWorkcodes);
    }

    /** Apakah salah satu kegiatan (non-harian, dengan participants_count) sudah memilih peserta. */
    public static function hasRestricted(Collection $workcodes): bool
    {
        return $workcodes->contains(fn (self $workcode) => $workcode->kategori !== 'harian' && (int) $workcode->participants_count > 0);
    }

    /**
     * Jadwal datang/pulang presensi harian untuk satu tanggal: jadwal khusus hari itu
     * (jadwal_per_hari), lalu jam bawaan workcode untuk kolom yang tidak diisi.
     *
     * @return array{jam_datang_mulai: ?string, jam_datang_selesai: ?string, jam_pulang_mulai: ?string, jam_pulang_selesai: ?string}
     */
    public function scheduleFor(CarbonInterface $date): array
    {
        $day = $this->jadwal_per_hari[$date->dayOfWeekIso] ?? [];

        return collect(['jam_datang_mulai', 'jam_datang_selesai', 'jam_pulang_mulai', 'jam_pulang_selesai'])
            ->mapWithKeys(fn (string $key) => [$key => filled($day[$key] ?? null) ? $day[$key] : $this->{$key}])
            ->all();
    }

    /**
     * Apakah presensi datang pada waktu ini terlambat. Hanya berlaku untuk presensi harian,
     * dengan batas jam datang selesai sesuai jadwal hari itu.
     */
    public function isLateAt(CarbonInterface $checkIn): bool
    {
        $deadline = $this->checkInDeadlineOn($checkIn);

        return $deadline !== null && $checkIn->greaterThan($deadline);
    }

    /** Lama keterlambatan dalam menit (0 bila tepat waktu atau bukan presensi harian). */
    public function lateMinutes(CarbonInterface $checkIn): int
    {
        return $this->isLateAt($checkIn) ? (int) $this->checkInDeadlineOn($checkIn)->diffInMinutes($checkIn) : 0;
    }

    /**
     * Batas tutup presensi datang harian: jam datang selesai + toleransi terlambat
     * (config attendance.late_tolerance_minutes), paling lambat akhir hari yang sama.
     */
    public static function withLateTolerance(CarbonInterface $deadline): CarbonInterface
    {
        $closesAt = $deadline->copy()->addMinutes(config('attendance.late_tolerance_minutes', 60));
        $endOfDay = $deadline->copy()->endOfDay();

        return $closesAt->greaterThan($endOfDay) ? $endOfDay : $closesAt;
    }

    /** Lama keterlambatan untuk ditampilkan, mis. "25 menit" atau "1 jam 5 menit". */
    public static function formatLateDuration(int $minutes): string
    {
        if ($minutes < 60) {
            return "{$minutes} menit";
        }

        $hours = intdiv($minutes, 60);
        $mins = $minutes % 60;

        return $mins > 0 ? "{$hours} jam {$mins} menit" : "{$hours} jam";
    }

    private function checkInDeadlineOn(CarbonInterface $checkIn): ?CarbonInterface
    {
        if ($this->kategori !== 'harian') {
            return null;
        }

        $deadline = $this->scheduleFor($checkIn)['jam_datang_selesai'];

        return $deadline ? $checkIn->copy()->setTimeFromTimeString($deadline) : null;
    }

    /**
     * Apakah kegiatan mempunyai jadwal aktif otomatis yang lengkap.
     */
    public function hasScheduledActiveWindow(): bool
    {
        return $this->kategori === 'workcode'
            && filled($this->tanggal)
            && filled($this->jam_aktif_mulai)
            && filled($this->jam_aktif_selesai);
    }

    /**
     * Periksa apakah waktu sekarang berada di dalam jadwal kegiatan.
     * Batas akhir bersifat eksklusif: pada tepat jam selesai, kegiatan ditutup.
     */
    public function isWithinActiveWindow(?Carbon $moment = null): bool
    {
        if (! $this->hasScheduledActiveWindow()) {
            return true;
        }

        $moment ??= now();

        return $moment->greaterThanOrEqualTo($this->activeWindowStartsAt())
            && $moment->lessThan($this->activeWindowEndsAt());
    }

    /** Awal jadwal aktif kegiatan (null bila tidak terjadwal). */
    public function activeWindowStartsAt(): ?Carbon
    {
        return $this->hasScheduledActiveWindow()
            ? Carbon::parse($this->tanggal.' '.$this->jam_aktif_mulai, config('app.timezone', 'Asia/Jakarta'))
            : null;
    }

    /** Akhir jadwal aktif kegiatan, eksklusif (null bila tidak terjadwal). */
    public function activeWindowEndsAt(): ?Carbon
    {
        return $this->hasScheduledActiveWindow()
            ? Carbon::parse($this->tanggal.' '.$this->jam_aktif_selesai, config('app.timezone', 'Asia/Jakarta'))
            : null;
    }

    /**
     * Status aktif yang memperhitungkan flag database dan jadwal kegiatan.
     */
    public function isEffectivelyActive(?Carbon $moment = null): bool
    {
        // Workcode kegiatan tidak bergantung pada scheduler/cron untuk menjadi aktif.
        // Statusnya selalu dihitung dari jadwal yang tersimpan dan waktu server saat ini.
        if ($this->hasScheduledActiveWindow()) {
            return $this->isWithinActiveWindow($moment);
        }

        return $this->is_active;
    }

    /**
     * Helper untuk mengambil Workcode yang benar-benar aktif saat ini.
     */
    public static function getActive(?Participant $participant = null)
    {
        return static::getActiveWorkcodes($participant)->first();
    }

    /** Semua workcode yang aktif saat ini, termasuk jadwal yang bertumpuk. */
    public static function getActiveWorkcodes(?Participant $participant = null)
    {
        $now = now();
        $workcodes = static::query()
            ->where(function ($query) use ($now): void {
                $query->where('is_active', true)
                    ->orWhere(function ($scheduled) use ($now): void {
                        $scheduled->where('kategori', 'workcode')
                            ->whereDate('tanggal', $now->toDateString())
                            ->whereNotNull('jam_aktif_mulai')
                            ->whereNotNull('jam_aktif_selesai');
                    });
            })
            ->withCount('participants')
            ->orderByDesc('jam_aktif_mulai')
            ->orderByDesc('id')
            ->get()
            ->filter(fn (self $workcode) => $workcode->isEffectivelyActive($now));

        if ($participant) {
            $assignedIds = $participant->workcodes()->pluck('workcodes.id');

            $workcodes = $workcodes->filter(fn (self $workcode) => $workcode->participants_count > 0
                ? $assignedIds->contains($workcode->id)
                : ! $workcode->isClosedAmong($workcodes));
        }

        return $workcodes->values();
    }
}
