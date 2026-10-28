<?php

namespace App\Support;

use App\Models\Attendance;
use App\Models\Participant;
use App\Models\Workcode;
use Carbon\CarbonImmutable;

/**
 * Data kartu "Hari ini" di beranda peserta: presensi yang sudah tercatat hari ini, jadwal
 * presensi harian peserta untuk hari ini, dan workcode tujuan pengajuan izin.
 */
class ParticipantToday
{
    /**
     * Presensi harian aktif yang berlaku untuk peserta (peserta terpilih, atau terbuka untuk semua).
     */
    public static function dailyWorkcode(Participant $participant): ?Workcode
    {
        return Workcode::query()
            ->where('kategori', 'harian')
            ->where('is_active', true)
            ->orderByDesc('id')
            ->get()
            ->first(fn (Workcode $workcode) => $workcode->isAvailableFor($participant));
    }

    /**
     * Jadwal harian untuk hari ini: null bila tidak ada presensi harian atau hari ini libur.
     *
     * @return array{nama: string, datang_mulai: ?string, datang_selesai: ?string, ditutup: ?string, pulang_mulai: ?string, pulang_selesai: ?string}|null
     */
    public static function schedule(?Workcode $daily): ?array
    {
        $today = CarbonImmutable::today();

        if (! $daily || ! in_array($today->dayOfWeekIso, array_map('intval', $daily->hari_aktif ?? []), true)) {
            return null;
        }

        $times = $daily->scheduleFor($today);
        $short = fn (?string $time) => $time ? substr($time, 0, 5) : null;
        $closes = $times['jam_datang_selesai']
            ? Workcode::withLateTolerance($today->setTimeFromTimeString($times['jam_datang_selesai']))->format('H:i')
            : null;

        return [
            'nama' => $daily->nama_workcode,
            'datang_mulai' => $short($times['jam_datang_mulai']),
            'datang_selesai' => $short($times['jam_datang_selesai']),
            'ditutup' => $closes,
            'pulang_mulai' => $short($times['jam_pulang_mulai']),
            'pulang_selesai' => $short($times['jam_pulang_selesai']),
        ];
    }

    /**
     * Presensi peserta yang tercatat hari ini (semua workcode), terbaru dulu.
     *
     * @return array<int, array{id: int, workcode: ?string, harian: bool, status: string, datang: ?string, pulang: ?string, terlambat: int}>
     */
    public static function attendances(Participant $participant): array
    {
        return Attendance::query()
            ->where('participant_id', $participant->id)
            ->whereDate('tanggal', today())
            ->recorded()
            ->with('workcode')
            ->latest('waktu_hadir')
            ->get()
            ->map(fn (Attendance $attendance) => [
                'id' => $attendance->id,
                'workcode' => $attendance->workcode?->nama_workcode,
                'harian' => $attendance->workcode?->kategori === 'harian',
                'status' => $attendance->status,
                'datang' => $attendance->status === 'hadir' ? $attendance->waktu_hadir?->format('H:i') : null,
                'pulang' => $attendance->waktu_pulang?->format('H:i'),
                'terlambat' => $attendance->status === 'hadir' && $attendance->waktu_hadir && $attendance->workcode
                    ? $attendance->workcode->lateMinutes($attendance->waktu_hadir)
                    : 0,
            ])
            ->all();
    }
}
