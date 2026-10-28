<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Attendance extends Model
{
    use HasFactory;

    /** Metode presensi stakeholder yang dicatat otomatis saat kegiatan dimulai. */
    public const METHOD_AUTO = 'otomatis';

    protected $fillable = [
        'workcode_id',
        'participant_id',
        'tanggal',
        'waktu_hadir',
        'waktu_pulang',
        'status',
        'signature_path',
        'face_capture_path',
        'face_capture_pulang_path',
        'attendance_method',
        'leave_request_id',
        'device_hash',
        'ip_address',
    ];

    protected $casts = [
        'waktu_hadir' => 'datetime',
        'waktu_pulang' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::deleting(function (Attendance $attendance) {
            Storage::disk('private')->delete(array_filter([
                $attendance->signature_path,
                $attendance->face_capture_path,
                $attendance->face_capture_pulang_path,
            ]));
        });

        // Foto yang tertimpa (mis. scan pulang ulang setelah jam pulang dikosongkan admin) ikut dihapus.
        static::updated(function (Attendance $attendance) {
            $replaced = collect(['signature_path', 'face_capture_path', 'face_capture_pulang_path'])
                ->filter(fn (string $column) => $attendance->wasChanged($column))
                ->map(fn (string $column) => $attendance->getOriginal($column))
                ->filter()
                ->all();

            if ($replaced !== []) {
                Storage::disk('private')->delete($replaced);
            }
        });
    }

    /**
     * Presensi yang benar-benar dilakukan peserta (atau dicatat admin/izin), tanpa catatan otomatis
     * stakeholder. Catatan otomatis tidak menghalangi scan: scan peserta menimpanya.
     */
    public function scopeRecorded(Builder $query): Builder
    {
        return $query->where(fn (Builder $query) => $query->whereNull('attendance_method')
            ->orWhere('attendance_method', '!=', self::METHOD_AUTO));
    }

    /**
     * Catat presensi scan peserta. Catatan otomatis stakeholder pada workcode & tanggal yang sama
     * (unique key) ditimpa dengan data scan ini; selain itu dibuat baris baru.
     */
    public static function createOrReplaceAutomatic(array $attributes): self
    {
        $automatic = static::where('workcode_id', $attributes['workcode_id'])
            ->where('participant_id', $attributes['participant_id'])
            ->whereDate('tanggal', $attributes['tanggal'])
            ->where('attendance_method', self::METHOD_AUTO)
            ->first();

        if (! $automatic) {
            return static::create($attributes);
        }

        $automatic->update($attributes + ['status' => 'hadir']);

        return $automatic;
    }

    /**
     * Relasi ke Workcode.
     */
    public function workcode()
    {
        return $this->belongsTo(Workcode::class);
    }

    /**
     * Relasi ke participant.
     */
    public function participant()
    {
        return $this->belongsTo(Participant::class);
    }

    /**
     * Relasi ke pengajuan izin/sakit.
     */
    public function leaveRequest()
    {
        return $this->belongsTo(LeaveRequest::class);
    }
}
