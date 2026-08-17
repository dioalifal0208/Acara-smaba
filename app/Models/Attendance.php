<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'participant_id',
        'waktu_hadir',
        'waktu_pulang',
        'status',
        'leave_request_id',
        'device_hash',
        'ip_address',
    ];

    protected $casts = [
        'waktu_hadir' => 'datetime',
        'waktu_pulang' => 'datetime',
    ];

    /**
     * Relasi ke Event.
     */
    public function event()
    {
        return $this->belongsTo(Event::class);
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
