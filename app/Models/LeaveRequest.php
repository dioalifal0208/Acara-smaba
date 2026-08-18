<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeaveRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'participant_id',
        'workcode_id',
        'tanggal',
        'tipe',
        'alasan',
        'bukti_path',
        'status_approval',
    ];

    protected $casts = [
        'tanggal' => 'date',
    ];

    public function participant()
    {
        return $this->belongsTo(Participant::class);
    }

    public function workcode()
    {
        return $this->belongsTo(Workcode::class);
    }

    public function attendance()
    {
        return $this->hasOne(Attendance::class);
    }
}
