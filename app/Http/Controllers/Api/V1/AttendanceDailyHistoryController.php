<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AttendanceDailyHistoryController extends Controller
{
    /**
     * Riwayat presensi peserta dikelompokkan per hari.
     *
     * Dirancang untuk expandable card di Android.
     * Setiap item = satu hari, berisi jadwal_per_hari dan daftar sesi presensi.
     *
     * Query params:
     *   per_page : jumlah hari per halaman (default 15, max 50)
     *   page     : halaman yang diminta
     *   bulan    : filter bulan 1-12 (opsional)
     *   tahun    : filter tahun YYYY (opsional)
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Hanya peserta yang boleh mengakses
        if (
            ! $user->tokenCan('role:participant') ||
            $user->role !== 'participant' ||
            ! $user->participant_id
        ) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses ditolak. Endpoint ini khusus untuk peserta.',
            ], 403);
        }

        // Validasi query params
        $validator = Validator::make($request->all(), [
            'per_page' => 'nullable|integer|min:1|max:50',
            'bulan' => 'nullable|integer|min:1|max:12',
            'tahun' => 'nullable|integer|min:2000|max:2100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $perPage = (int) $request->input('per_page', 15);
        $bulan = $request->input('bulan');
        $tahun = $request->input('tahun');

        // ── Paginasi per tanggal unik ─────────────────────────────────────────
        $dateQuery = Attendance::query()
            ->selectRaw('DATE(created_at) as tanggal_presensi')
            ->where('participant_id', $user->participant_id);

        if ($bulan) {
            $dateQuery->whereMonth('created_at', $bulan);
        }
        if ($tahun) {
            $dateQuery->whereYear('created_at', $tahun);
        }

        $allDates = $dateQuery
            ->groupBy('tanggal_presensi')
            ->orderByRaw('tanggal_presensi DESC')
            ->paginate($perPage);

        $dates = collect($allDates->items())->pluck('tanggal_presensi');

        // ── Ambil semua sesi pada tanggal di halaman ini ──────────────────────
        $attendances = Attendance::with(['workcode', 'leaveRequest'])
            ->where('participant_id', $user->participant_id)
            ->whereIn(DB::raw('DATE(created_at)'), $dates->toArray())
            ->orderBy('created_at', 'desc')
            ->get();

        // ── Kelompokkan per tanggal ───────────────────────────────────────────
        $grouped = $attendances
            ->groupBy(fn ($a) => $a->created_at->toDateString())
            ->map(function ($sessions, $tanggal) {
                $firstSession = $sessions->first();
                $workcode = $firstSession->workcode;

                // Cari jadwal spesifik hari ini dari jadwal_per_hari workcode
                $jadwalHariIni = null;
                if ($workcode && is_array($workcode->jadwal_per_hari)) {
                    $namaHari = Carbon::parse($tanggal)->locale('id')->isoFormat('dddd');
                    foreach ($workcode->jadwal_per_hari as $jadwal) {
                        if (
                            isset($jadwal['hari']) &&
                            strtolower($jadwal['hari']) === strtolower($namaHari)
                        ) {
                            $jadwalHariIni = $jadwal;
                            break;
                        }
                    }
                }

                $statusRingkasan = $sessions->map(fn ($s) => $s->status)->unique()->values();

                return [
                    // ── Header card ───────────────────────────────────────────
                    'tanggal' => $tanggal,
                    'label_hari' => Carbon::parse($tanggal)
                        ->locale('id')
                        ->isoFormat('dddd, D MMMM YYYY'),
                    'status_ringkasan' => $statusRingkasan,
                    'jumlah_sesi' => $sessions->count(),

                    // Info workcode (ditampilkan pada header card)
                    'workcode' => $workcode ? [
                        'id' => $workcode->id,
                        'nama_workcode' => $workcode->nama_workcode,
                        'deskripsi' => $workcode->deskripsi,
                        'kategori' => $workcode->kategori,
                        'tanggal' => $workcode->tanggal,
                        'hari_aktif' => $workcode->hari_aktif,
                        'jam_datang_mulai' => $workcode->jam_datang_mulai,
                        'jam_datang_selesai' => $workcode->jam_datang_selesai,
                        'jam_pulang_mulai' => $workcode->jam_pulang_mulai,
                        'jam_pulang_selesai' => $workcode->jam_pulang_selesai,
                        'jadwal_per_hari' => $workcode->jadwal_per_hari,
                    ] : null,

                    // Jadwal khusus hari ini dari jadwal_per_hari (utama expand card)
                    'jadwal_hari_ini' => $jadwalHariIni,

                    // ── Konten expand card ────────────────────────────────────
                    'sesi' => $sessions->values()->map(fn ($s) => [
                        'id' => $s->id,
                        'status' => $s->status,
                        'waktu_hadir' => $s->waktu_hadir
                            ? $s->waktu_hadir->toIso8601String()
                            : null,
                        'waktu_pulang' => $s->waktu_pulang
                            ? $s->waktu_pulang->toIso8601String()
                            : null,
                        'created_at' => $s->created_at->toIso8601String(),
                        'leave_request' => $s->leaveRequest ? [
                            'id' => $s->leaveRequest->id,
                            'tipe' => $s->leaveRequest->tipe,
                            'alasan' => $s->leaveRequest->alasan,
                            'status_approval' => $s->leaveRequest->status_approval,
                        ] : null,
                    ])->toArray(),
                ];
            })
            ->sortByDesc('tanggal')
            ->values();

        return response()->json([
            'status' => 'success',
            'data' => $grouped,
            'meta' => [
                'current_page' => $allDates->currentPage(),
                'last_page' => $allDates->lastPage(),
                'per_page' => $allDates->perPage(),
                'total_hari' => $allDates->total(),
                'path' => $allDates->path(),
            ],
            'filter' => [
                'bulan' => $bulan ? (int) $bulan : null,
                'tahun' => $tahun ? (int) $tahun : null,
            ],
        ]);
    }
}
