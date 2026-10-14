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
            if ($attendance->signature_path) {
                Storage::disk('public')->delete($attendance->signature_path);
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
