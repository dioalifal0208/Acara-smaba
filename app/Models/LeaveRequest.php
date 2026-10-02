<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeaveRequest extends Model
{
    use HasFactory;

    protected $attributes = [
        'status_approval' => 'pending',
    ];

    public const TIPE_IZIN = [
        'izin_penuh',
        'tidak_absen_datang',
        'tidak_absen_pulang',
    ];

    public const JENIS_IZIN = [
        'izin_sakit',
        'force_majeure',
        'tidak_masuk_kerja_dengan_keterangan',
        'perjalanan_dinas_dalam_kota',
        'perjalanan_dinas_luar_kota',
        'cuti',
        'diklat_dan_pelatihan',
    ];

    protected $fillable = [
        'participant_id',
        'workcode_id',
        'tanggal',
        'tanggal_selesai',
        'tipe',
        'tipe_izin',
        'jenis_izin',
        'keterangan',
        'alasan',
        'bukti_path',
        'status_approval',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'tanggal_selesai' => 'date',
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
