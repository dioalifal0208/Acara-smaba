<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeviceChangeRequest extends Model
{
    protected $fillable = [
        'user_id',
        'device_id_hash',
        'device_model',
        'previous_device_model',
        'reason',
        'status',
        'reviewed_by',
        'reviewed_at',
        'rejection_reason',
    ];

    protected $hidden = [
        'device_id_hash',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /** Ringkasan untuk aplikasi Android (tanpa hash perangkat). */
    public function toApiArray(): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'device_model' => $this->device_model,
            'reason' => $this->reason,
            'rejection_reason' => $this->rejection_reason,
            'created_at' => $this->created_at?->toIso8601String(),
            'reviewed_at' => $this->reviewed_at?->toIso8601String(),
        ];
    }
}
