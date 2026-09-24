<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApiIdempotencyLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'participant_id',
        'idempotency_key',
        'request_hash',
        'response_code',
        'response_payload',
    ];

    protected $casts = [
        'response_payload' => 'array',
    ];

    public function participant()
    {
        return $this->belongsTo(Participant::class);
    }
}
