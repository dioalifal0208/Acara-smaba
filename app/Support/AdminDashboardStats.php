<?php

namespace App\Support;

use App\Models\Attendance;
use App\Models\Participant;
use App\Models\Workcode;
use Carbon\CarbonImmutable;

/**
 * Data grafik & tabel ringkas untuk dashboard admin.
 *
 * Pengelompokan per hari/jam dilakukan di PHP agar sama di MySQL (produksi) dan SQLite (tes).
 */
class AdminDashboardStats
{
    private const METHOD_LABELS = [
        'wajah' => 'Wajah',
        'qr_peserta' => 'QR Peserta',
        'tanda_tangan' => 'Tanda Tangan',
        'manual' => 'Manual',
        'otomatis' => 'Otomatis',
    ];

    /**
     * Ringkasan kehadiran untuk satu workcode: peserta yang berhak (peserta terpilih, atau semua
     * peserta bila workcode tidak membatasi) dan yang berstatus hadir. Harian: hanya hari ini;
     * kegiatan: sekali presensi per kegiatan (sama dengan AttendanceValidationService::checkAlreadyAttended).
     * Baris alpha/lupa_absen/izin dari scheduler atau persetujuan izin tidak dihitung hadir.
     *
     * @return array{total: int, hadir: int, belum: int}
     */
    public static function presence(?Workcode $workcode): array
    {
        if (! $workcode) {
            $total = Participant::count();

            return ['total' => $total, 'hadir' => 0, 'belum' => $total];
        }

        $eligible = $workcode->eligibleParticipants();

        $total = (clone $eligible)->count();
        $hadir = Attendance::query()
            ->where('workcode_id', $workcode->id)
            ->where('status', 'hadir')
            ->when($workcode->kategori === 'harian', fn ($query) => $query->whereDate('tanggal', today()))
            ->whereIn('participant_id', $eligible->select('participants.id'))
            ->distinct()
            ->count('participant_id');

        return ['total' => $total, 'hadir' => $hadir, 'belum' => max(0, $total - $hadir)];
    }

    /**
     * Rincian Papan Hadir dashboard untuk satu workcode, dengan cakupan peserta & hari yang sama
     * dengan presence(): hadir tepat waktu, terlambat (presensi harian lewat batas jam datang),
     * izin/sakit, dan belum (sisanya, termasuk alpha & lupa absen). Jumlah keempatnya = total.
     *
     * @return array{total: int, tepat_waktu: int, terlambat: int, izin: int, belum: int}
     */
    public static function board(?Workcode $workcode): array
    {
        if (! $workcode) {
            $total = Participant::count();

            return ['total' => $total, 'tepat_waktu' => 0, 'terlambat' => 0, 'izin' => 0, 'belum' => $total];
        }

        $eligible = $workcode->eligibleParticipants();
        $total = (clone $eligible)->count();

        $rows = Attendance::query()
            ->where('workcode_id', $workcode->id)
            ->whereIn('status', ['hadir', 'izin', 'sakit'])
            ->when($workcode->kategori === 'harian', fn ($query) => $query->whereDate('tanggal', today()))
            ->whereIn('participant_id', $eligible->select('participants.id'))
            ->orderBy('waktu_hadir')
            ->get(['participant_id', 'status', 'waktu_hadir'])
            ->groupBy('participant_id');

        // Peserta dengan baris hadir dihitung hadir walau juga punya baris izin; presensi pertama menentukan terlambat.
        $present = $rows->map(fn ($attendances) => $attendances->firstWhere('status', 'hadir'))->filter();
        $terlambat = $present->filter(fn (Attendance $attendance) => $attendance->waktu_hadir && $workcode->isLateAt($attendance->waktu_hadir))->count();
        $izin = $rows->count() - $present->count();

        return [
            'total' => $total,
            'tepat_waktu' => $present->count() - $terlambat,
            'terlambat' => $terlambat,
            'izin' => $izin,
            'belum' => max(0, $total - $present->count() - $izin),
        ];
    }

    /** Jumlah presensi hadir 7 hari terakhir (termasuk hari ini). */
    public static function weekly(): array
    {
        $start = CarbonImmutable::today()->subDays(6);
        $counts = Attendance::query()
            ->where('status', 'hadir')
            ->where('waktu_hadir', '>=', $start)
            ->pluck('waktu_hadir')
            ->countBy(fn ($time) => $time->toDateString());

        return collect(range(0, 6))->map(function (int $offset) use ($start, $counts) {
            $day = $start->addDays($offset);

            return [
                'label' => $day->locale('id')->isoFormat('dd'),
                'date' => $day->toDateString(),
                'value' => $counts->get($day->toDateString(), 0),
            ];
        })->all();
    }

    /**
     * Presensi harian yang terlambat per hari, 7 hari terakhir.
     *
     * Batas datang: Workcode::isLateAt (jadwal hari itu, lalu jam datang bawaan workcode).
     */
    public static function lateness(): array
    {
        $start = CarbonImmutable::today()->subDays(6);
        $byDay = Attendance::query()
            ->where('status', 'hadir')
            ->where('waktu_hadir', '>=', $start)
            ->whereHas('workcode', fn ($query) => $query->where('kategori', 'harian'))
            ->with('workcode:id,kategori,jam_datang_mulai,jam_datang_selesai,jam_pulang_mulai,jam_pulang_selesai,jadwal_per_hari')
            ->get(['id', 'workcode_id', 'waktu_hadir'])
            ->groupBy(fn (Attendance $attendance) => $attendance->waktu_hadir->toDateString());

        return collect(range(0, 6))->map(function (int $offset) use ($start, $byDay) {
            $day = $start->addDays($offset);
            $attendances = $byDay->get($day->toDateString(), collect());

            return [
                'date' => $day->toDateString(),
                'late' => $attendances->filter(fn (Attendance $attendance) => $attendance->workcode->isLateAt($attendance->waktu_hadir))->count(),
                'total' => $attendances->count(),
            ];
        })->all();
    }

    /** Sebaran metode presensi hari ini. */
    public static function methods(): array
    {
        $counts = self::today()->pluck('attendance_method')->countBy(fn ($method) => $method ?: 'wajah');

        return collect(self::METHOD_LABELS)->map(fn (string $label, string $key) => [
            'key' => $key,
            'label' => $label,
            'value' => $counts->get($key, 0),
        ])->values()->all();
    }

    /** Presensi terbaru hari ini untuk tabel dashboard. */
    public static function recent(int $limit = 6): array
    {
        return self::today()
            ->with(['participant:id,nama,nis_nip', 'workcode'])
            ->latest('waktu_hadir')
            ->take($limit)
            ->get()
            ->map(fn (Attendance $attendance) => [
                'id' => $attendance->id,
                'nama' => $attendance->participant?->nama ?? '-',
                'nis_nip' => $attendance->participant?->nis_nip,
                'workcode' => $attendance->workcode?->nama_workcode,
                'waktu' => $attendance->waktu_hadir?->format('H:i'),
                'pulang' => $attendance->waktu_pulang?->format('H:i'),
                'metode' => self::METHOD_LABELS[$attendance->attendance_method ?: 'wajah'] ?? 'Lainnya',
                'terlambat' => (bool) $attendance->workcode?->isLateAt($attendance->waktu_hadir),
            ])
            ->all();
    }

    private static function today()
    {
        return Attendance::query()
            ->where('status', 'hadir')
            ->whereBetween('waktu_hadir', [CarbonImmutable::today(), CarbonImmutable::today()->endOfDay()]);
    }
}
