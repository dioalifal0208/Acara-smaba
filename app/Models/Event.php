<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama_event',
        'deskripsi',
        'latitude',
        'longitude',
        'radius_meters',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'radius_meters' => 'integer',
    ];

    /**
     * Relasi ke Attendance.
     */
    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    /**
     * Helper untuk mengambil Event yang sedang aktif.
     */
    public static function getActive()
    {
        return static::where('is_active', true)->first();
    }
}
