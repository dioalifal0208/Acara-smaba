<?php

namespace App\Models;

use App\Support\PrivateFile;
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
        'alasan_penolakan',
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

    public static function tipeIzinLabel(?string $tipeIzin): string
    {
        return match ($tipeIzin) {
            'izin_penuh' => 'Izin penuh',
            'tidak_absen_datang' => 'Tidak absen datang',
            'tidak_absen_pulang' => 'Tidak absen pulang',
            default => 'Izin',
        };
    }

    public static function jenisIzinLabel(?string $jenisIzin): ?string
    {
        return match ($jenisIzin) {
            'izin_sakit' => 'Izin sakit',
            'force_majeure' => 'Force majeure',
            'tidak_masuk_kerja_dengan_keterangan' => 'Tidak masuk kerja dengan keterangan',
            'perjalanan_dinas_dalam_kota' => 'Perjalanan dinas dalam kota',
            'perjalanan_dinas_luar_kota' => 'Perjalanan dinas luar kota',
            'cuti' => 'Cuti',
            'diklat_dan_pelatihan' => 'Diklat dan pelatihan',
            default => null,
        };
    }

    /** Jumlah hari yang dicakup pengajuan (1 bila tanpa tanggal selesai). */
    public function days(): int
    {
        return $this->tanggal_selesai ? (int) $this->tanggal->diffInDays($this->tanggal_selesai) + 1 : 1;
    }

    /** Bulan (YYYY-MM) yang dicakup pengajuan, untuk filter bulan di halaman Perizinan. */
    public function months(): array
    {
        $months = [];
        $end = ($this->tanggal_selesai ?? $this->tanggal)->copy()->startOfMonth();

        for ($month = $this->tanggal->copy()->startOfMonth(); $month->lte($end); $month->addMonth()) {
            $months[] = $month->format('Y-m');
        }

        return $months;
    }

    /** Data pengajuan untuk halaman Perizinan dan riwayat izin di detail peserta (butuh relasi participant & workcode). */
    public function toAdminArray(): array
    {
        $tanggalMulai = $this->tanggal->format('d M Y');
        $tanggalSelesai = $this->tanggal_selesai?->format('d M Y');

        return [
            'id' => $this->id,
            'participant_id' => $this->participant_id,
            'participant_name' => $this->participant->nama ?? 'Unknown',
            'participant_nip' => $this->participant->nis_nip ?? '-',
            'workcode_name' => $this->workcode->nama_workcode ?? 'Unknown',
            'tanggal' => $tanggalSelesai ? "{$tanggalMulai} s.d. {$tanggalSelesai}" : $tanggalMulai,
            'months' => $this->months(),
            'days' => $this->days(),
            'kategori' => 'Izin',
            'tipe_izin' => $this->tipe_izin,
            'tipe_izin_label' => self::tipeIzinLabel($this->tipe_izin),
            'jenis_izin' => $this->jenis_izin,
            'jenis_izin_label' => self::jenisIzinLabel($this->jenis_izin),
            'keterangan' => $this->keterangan ?? $this->alasan,
            'bukti_url' => PrivateFile::url('leave-document', $this),
            'status_approval' => $this->status_approval,
            'alasan_penolakan' => $this->alasan_penolakan,
            'created_at' => $this->created_at->format('d M Y H:i'),
        ];
    }
}
