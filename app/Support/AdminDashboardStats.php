<?php

namespace App\Support;

use App\Models\Attendance;
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
    ];

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
            ->with(['participant:id,nama,nis_nip', 'workcode:id,nama_workcode'])
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
