<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class Workcode extends Model
{
    use HasFactory;

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
     * Workcode tanpa peserta terpilih bersifat terbuka untuk semua peserta,
     * sehingga data workcode lama tetap berfungsi seperti sebelumnya.
     */
    public function isAvailableFor(Participant $participant): bool
    {
        return ! $this->participants()->exists()
            || $this->participants()->whereKey($participant->getKey())->exists();
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
        $timezone = config('app.timezone', 'Asia/Jakarta');
        $startsAt = Carbon::parse($this->tanggal.' '.$this->jam_aktif_mulai, $timezone);
        $endsAt = Carbon::parse($this->tanggal.' '.$this->jam_aktif_selesai, $timezone);

        return $moment->greaterThanOrEqualTo($startsAt) && $moment->lessThan($endsAt);
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

            $workcodes = $workcodes->filter(fn (self $workcode) => $workcode->participants_count === 0 || $assignedIds->contains($workcode->id));
        }

        return $workcodes->values();
    }

}
