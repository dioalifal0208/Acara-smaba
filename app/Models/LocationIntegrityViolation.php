<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Percobaan presensi yang ditolak karena indikasi lokasi palsu (lihat App\Support\LocationIntegrity). */
class LocationIntegrityViolation extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'user_id',
        'participant_id',
        'workcode_id',
        'reasons',
        'signals',
        'blocked',
        'device_model',
        'ip_address',
    ];

    protected function casts(): array
    {
        return [
            'reasons' => 'array',
            'signals' => 'array',
            'blocked' => 'boolean',
            'created_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function participant()
    {
        return $this->belongsTo(Participant::class);
    }

    public function workcode()
    {
        return $this->belongsTo(Workcode::class);
    }
}
