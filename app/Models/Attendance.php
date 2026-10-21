<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Attendance extends Model
{
    use HasFactory;

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
