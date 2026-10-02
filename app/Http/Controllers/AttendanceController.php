<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\LeaveRequest;
use App\Models\Participant;
use App\Models\Setting;
use App\Models\Workcode;
use App\Services\AttendanceValidationService;
use App\Services\QrCodeService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    // =========================================================================
    //  WEB — Scanner Page & QR Scan Processing
    // =========================================================================

    /**
     * Tampilkan halaman Scanner QR untuk Admin.
     */
    public function scanner()
    {
        $activeWorkcode = Workcode::getActive();
        $totalParticipants = Participant::count();
        $totalAttended = $activeWorkcode
            ? Attendance::where('workcode_id', $activeWorkcode->id)
                ->distinct('participant_id')
                ->count('participant_id')
            : 0;

        return Inertia::render('Scanner/Index', [
            'activeWorkcode' => $activeWorkcode,
            'initialStats' => [
                'total' => $totalParticipants,
                'hadir' => $totalAttended,
                'belum' => $totalParticipants - $totalAttended,
            ],
        ]);
    }

    /**
     * Proses scan QR Code dari Scanner Admin (POST /scan).
     * Mengembalikan JSON.
     */
    /**
     * Proses scan QR Code dari Scanner Admin (POST /scan).
     * Mengembalikan JSON.
     */
    public function scan(Request $request, AttendanceValidationService $validationService)
    {
        $request->validate([
            'qr_token' => 'required|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'accuracy' => 'nullable|numeric',
        ]);

        $activeWorkcode = Workcode::getActive();

        if (! $activeWorkcode) {
            return response()->json([
                'status' => 'error',
                'message' => 'Belum ada Workcode yang aktif.',
            ], 400);
        }

        try {
            $validationService->validateWorkcodeActive($activeWorkcode, true);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->validator->errors()->first(),
            ], $e->status);
        }

        // Cari peserta berdasarkan qr_token
        $participant = Participant::where('qr_token', $request->input('qr_token'))->first();

        if (! $participant) {
            return response()->json([
                'status' => 'error',
                'message' => 'QR Code tidak dikenali. Peserta tidak ditemukan.',
            ], 404);
        }

        // Cek GPS radius jika workcode memiliki koordinat
        if ($activeWorkcode->latitude && $activeWorkcode->longitude) {
            if ($request->filled('latitude') && $request->filled('longitude')) {
                try {
                    $validationService->validateGpsAndRadius($activeWorkcode, $request->only(['latitude', 'longitude', 'accuracy']));
                } catch (\Exception $e) {
                    $errorData = json_decode($e->getMessage(), true);

                    return response()->json($errorData, $e->getCode() ?: 400);
                }
            }
        }

        // Tentukan apakah workcode harian & sudah ada attendance hari ini
        $existingAttendance = Attendance::where('workcode_id', $activeWorkcode->id)
            ->where('participant_id', $participant->id)
            ->when(
                in_array($activeWorkcode->kategori, ['harian', '24_jam']),
                fn ($q) => $q->whereDate('created_at', now()->toDateString())
            )
            ->first();

        $isPulang = ($existingAttendance && $activeWorkcode->kategori === 'harian');

        try {
            $validationService->validateTimeWindow($activeWorkcode, $isPulang);
        } catch (\Exception $e) {
            $errorData = json_decode($e->getMessage(), true);

            return response()->json($errorData, $e->getCode() ?: 400);
        }

        // Cek duplikat untuk kategori non-harian
        if ($existingAttendance && $activeWorkcode->kategori !== 'harian') {
            return $this->scanJsonResponse('already', $participant, $activeWorkcode);
        }

        // Cek duplikat pulang
        if ($existingAttendance && $existingAttendance->waktu_pulang !== null) {
            return $this->scanJsonResponse('already', $participant, $activeWorkcode, 'Peserta sudah melakukan presensi pulang.');
        }

        // Proses pulang
        if ($isPulang) {
            $existingAttendance->update(['waktu_pulang' => now()]);

            return $this->scanJsonResponse('success', $participant, $activeWorkcode, 'Presensi pulang berhasil dicatat.');
        }

        // Hitung keterlambatan
        $waktuHadir = now();
        $isLate = false;
        $lateMinutes = 0;
        $lateFormatted = '';

        if ($activeWorkcode->kategori === 'harian' && $activeWorkcode->jam_datang_selesai) {
            $batasJamDatang = Carbon::createFromTimeString($activeWorkcode->jam_datang_selesai)
                ->setDate($waktuHadir->year, $waktuHadir->month, $waktuHadir->day);

            if ($waktuHadir->greaterThan($batasJamDatang)) {
                $isLate = true;
                $lateMinutes = (int) $batasJamDatang->diffInMinutes($waktuHadir);
                if ($lateMinutes >= 60) {
                    $hours = floor($lateMinutes / 60);
                    $mins = $lateMinutes % 60;
                    $lateFormatted = $mins > 0 ? "{$hours} jam {$mins} menit" : "{$hours} jam";
                } else {
                    $lateFormatted = "{$lateMinutes} menit";
                }
            }
        }

        // Catat presensi datang
        $attendance = Attendance::create([
            'workcode_id' => $activeWorkcode->id,
            'participant_id' => $participant->id,
            'tanggal' => now()->toDateString(),
            'waktu_hadir' => $waktuHadir,
            'status' => 'hadir',
            'device_hash' => hash('sha256', $request->ip().'|'.$request->userAgent()),
            'ip_address' => $request->ip(),
        ]);

        $status = $isLate ? 'warning' : 'success';
        $message = $isLate
            ? 'Presensi berhasil, tapi terlambat '.$lateFormatted.'.'
            : 'Presensi berhasil dicatat!';

        // Hitung stats terbaru
        $totalParticipants = Participant::count();
        $totalAttended = Attendance::where('workcode_id', $activeWorkcode->id)
            ->distinct('participant_id')
            ->count('participant_id');

        return response()->json([
            'status' => $status,
            'message' => $message,
            'participant' => [
                'id' => $participant->id,
                'nama' => $participant->nama,
                'nis_nip' => $participant->nis_nip,
            ],
            'timestamp' => $waktuHadir->format('H:i:s'),
            'is_late' => $isLate,
            'late_minutes' => $lateMinutes,
            'late_formatted' => $lateFormatted,
            'stats' => [
                'total' => $totalParticipants,
                'hadir' => $totalAttended,
                'belum' => $totalParticipants - $totalAttended,
            ],
        ]);
    }

    /**
     * Endpoint POST /api/scan — Alternatif scan QR tanpa CSRF (tetap
     * memerlukan auth admin karena berada di web middleware group).
     */
    public function apiScan(Request $request, AttendanceValidationService $validationService)
    {
        // Delegate ke method scan yang sama
        return $this->scan($request, $validationService);
    }

    // =========================================================================
    //  WEB — Laporan / Report
    // =========================================================================

    /**
     * Halaman Laporan Presensi (Inertia).
     */
    public function report(Request $request)
    {
        $workcodes = Workcode::orderByDesc('created_at')->get();

        $selectedWorkcodeId = $request->input('workcode_id');
        $selectedWorkcode = $selectedWorkcodeId
            ? Workcode::find($selectedWorkcodeId)
            : $workcodes->first();

        $attendances = [];
        $stats = ['total' => 0, 'hadir' => 0, 'belum' => 0, 'izin' => 0, 'sakit' => 0, 'alpha' => 0];
        $participants = [];

        if ($selectedWorkcode) {
            $allParticipants = Participant::orderBy('nama')->get();
            $participants = $allParticipants;
            $stats['total'] = $allParticipants->count();

            if ($selectedWorkcode->kategori === 'harian') {
                // Rekap harian: hitung alpha, izin, sakit, lupa_absen, total terlambat per peserta
                $attendances = $this->buildDailyRecap($selectedWorkcode, $allParticipants);
                $stats['hadir'] = collect($attendances)->where('status', '!=', 'alpha')->count();
            } else {
                // Sekali / 24 jam: list presensi per peserta
                $attendanceRecords = Attendance::where('workcode_id', $selectedWorkcode->id)
                    ->with('participant')
                    ->get()
                    ->keyBy('participant_id');

                $attendances = $allParticipants->map(function ($p) use ($attendanceRecords) {
                    $att = $attendanceRecords->get($p->id);

                    return [
                        'id' => $att?->id,
                        'participant_id' => $p->id,
                        'nama' => $p->nama,
                        'nis_nip' => $p->nis_nip,
                        'status_pegawai' => $p->status ?? '',
                        'waktu_hadir' => $att?->waktu_hadir?->format('H:i:s') ?? '-',
                        'waktu_pulang' => $att?->waktu_pulang?->format('H:i:s') ?? '-',
                        'status' => $att ? ($att->status ?? 'hadir') : 'alpha',
                    ];
                })->values()->toArray();

                $stats['hadir'] = $attendanceRecords->count();
            }

            $stats['belum'] = $stats['total'] - $stats['hadir'];
        }

        $namaKepsek = Setting::get('kepala_sekolah_nama', 'Muhtarom, S.Pd., M.Si.');
        $nipKepsek = Setting::get('kepala_sekolah_nip', '197205172006041015');

        return Inertia::render('Report/Index', [
            'workcodes' => $workcodes,
            'selectedWorkcodeId' => $selectedWorkcode?->id,
            'selectedWorkcode' => $selectedWorkcode,
            'stats' => $stats,
            'attendances' => $attendances,
            'participants' => $participants,
            'kepalaSekolahNama' => $namaKepsek,
            'kepalaSekolahNip' => $nipKepsek,
        ]);
    }

    /**
     * JSON Rekap presensi individu (GET /report/individual/{workcode}/{participant}).
     */
    public function getIndividualRecap(Workcode $workcode, Participant $participant, Request $request)
    {
        $year = $request->input('year', now()->year);
        $month = $request->input('month', now()->month);

        $attendances = Attendance::where('workcode_id', $workcode->id)
            ->where('participant_id', $participant->id)
            ->when($workcode->kategori === 'harian', function ($q) use ($year, $month) {
                $q->whereYear('created_at', $year)
                    ->whereMonth('created_at', $month);
            })
            ->orderBy('created_at')
            ->get()
            ->map(function ($att) {
                return [
                    'id' => $att->id,
                    'tanggal' => $att->created_at->format('Y-m-d'),
                    'jam_masuk' => $att->waktu_hadir?->format('H:i'),
                    'jam_pulang' => $att->waktu_pulang?->format('H:i') ?? '-',
                    'waktu_hadir' => $att->waktu_hadir?->format('H:i') ?? '-',
                    'waktu_pulang' => $att->waktu_pulang?->format('H:i') ?? '-',
                    'status' => $att->status ?? 'hadir',
                ];
            });

        // Untuk workcode harian, isi hari-hari yang tidak ada presensi sebagai alpha/libur
        if ($workcode->kategori === 'harian') {
            $attendances = $this->fillMissingDays($workcode, $participant, $attendances, $year, $month);
        }

        return response()->json([
            'participant' => [
                'id' => $participant->id,
                'nama' => $participant->nama,
                'nis_nip' => $participant->nis_nip,
                'status' => $participant->status ?? '',
            ],
            'workcode' => $workcode,
            'attendances' => $attendances->values(),
        ]);
    }

    // =========================================================================
    //  WEB — Manual Attendance Management (Admin)
    // =========================================================================

    /**
     * Simpan presensi manual baru (Admin).
     */
    public function manualStore(Request $request)
    {
        $request->validate([
            'participant_id' => 'required|exists:participants,id',
            'workcode_id' => 'required|exists:workcodes,id',
            'tanggal' => 'required|date',
            'jam_masuk' => 'nullable|string',
            'jam_pulang' => 'nullable|string',
            'status' => 'required|in:hadir,izin,sakit,alpha,lupa_absen,libur',
        ]);

        $tanggal = Carbon::parse($request->input('tanggal'));
        $waktuHadir = $request->filled('jam_masuk')
            ? Carbon::parse($request->input('tanggal').' '.$request->input('jam_masuk'))
            : $tanggal->copy()->startOfDay();

        $workcode = Workcode::findOrFail($request->input('workcode_id'));
        $waktuPulang = ($workcode->kategori === 'harian' && $request->filled('jam_pulang'))
            ? Carbon::parse($request->input('tanggal').' '.$request->input('jam_pulang'))
            : null;

        Attendance::create([
            'workcode_id' => $request->input('workcode_id'),
            'participant_id' => $request->input('participant_id'),
            'tanggal' => $tanggal->toDateString(),
            'waktu_hadir' => $waktuHadir,
            'waktu_pulang' => $waktuPulang,
            'status' => $request->input('status'),
            'ip_address' => $request->ip(),
        ]);

        return redirect()->back()->with('success', 'Data presensi berhasil ditambahkan.');
    }

    /**
     * Update presensi manual (Admin).
     */
    public function manualUpdate(Request $request, Attendance $attendance)
    {
        $request->validate([
            'tanggal' => 'required|date',
            'jam_masuk' => 'nullable|string',
            'jam_pulang' => 'nullable|string',
            'status' => 'required|in:hadir,izin,sakit,alpha,lupa_absen,libur',
        ]);

        $tanggal = Carbon::parse($request->input('tanggal'));

        $waktuHadir = $request->filled('jam_masuk')
            ? Carbon::parse($request->input('tanggal').' '.$request->input('jam_masuk'))
            : $tanggal->copy()->startOfDay();

        $workcode = $attendance->workcode;
        $waktuPulang = ($workcode->kategori === 'harian' && $request->filled('jam_pulang'))
            ? Carbon::parse($request->input('tanggal').' '.$request->input('jam_pulang'))
            : null;

        $attendance->update([
            'waktu_hadir' => $waktuHadir,
            'waktu_pulang' => $waktuPulang,
            'status' => $request->input('status'),
        ]);

        return redirect()->back()->with('success', 'Data presensi berhasil diperbarui.');
    }

    /**
     * Hapus presensi (Admin).
     */
    public function manualDestroy(Attendance $attendance)
    {
        $attendance->delete();

        return redirect()->back()->with('success', 'Data presensi berhasil dihapus.');
    }

    // =========================================================================
    //  WEB — Export & QR Signature
    // =========================================================================

    /**
     * Export data presensi ke CSV.
     */
    public function exportAttendance(Workcode $workcode)
    {
        $allParticipants = Participant::orderBy('nama')->get();
        $filename = 'rekap_presensi_'.str_replace(' ', '_', $workcode->nama_workcode).'_'.now()->format('Ymd_His').'.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ];

        $callback = function () use ($workcode, $allParticipants) {
            $file = fopen('php://output', 'w');
            // UTF-8 BOM for Excel compatibility
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            if ($workcode->kategori === 'harian') {
                fputcsv($file, ['No', 'Nama', 'NIS/NIP', 'Status Pegawai', 'Alpha', 'Izin', 'Sakit', 'Lupa Absen', 'Total Terlambat (Menit)']);

                $recaps = $this->buildDailyRecap($workcode, $allParticipants);
                $no = 1;
                foreach ($recaps as $r) {
                    fputcsv($file, [
                        $no++,
                        $r['nama'],
                        $r['nis_nip'],
                        $r['status_pegawai'] ?? '',
                        $r['total_alpha'] ?? 0,
                        $r['total_izin'] ?? 0,
                        $r['total_sakit'] ?? 0,
                        $r['total_lupa_absen'] ?? 0,
                        $r['total_menit_terlambat'] ?? 0,
                    ]);
                }
            } else {
                fputcsv($file, ['No', 'Nama', 'NIS/NIP', 'Status Pegawai', 'Waktu Presensi', 'Status']);

                $attendanceRecords = Attendance::where('workcode_id', $workcode->id)
                    ->with('participant')
                    ->get()
                    ->keyBy('participant_id');

                $no = 1;
                foreach ($allParticipants as $p) {
                    $att = $attendanceRecords->get($p->id);
                    fputcsv($file, [
                        $no++,
                        $p->nama,
                        $p->nis_nip,
                        $p->status ?? '',
                        $att?->waktu_hadir?->format('H:i:s') ?? '-',
                        $att ? ($att->status ?? 'hadir') : 'alpha',
                    ]);
                }
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Generate QR Signature image (SVG) untuk tanda tangan digital pada laporan.
     */
    public function qrSignature(Workcode $workcode, QrCodeService $qrCodeService)
    {
        // URL verifikasi tanda tangan digital
        $verifyUrl = route('signature.verify', $workcode->id);
        $svg = $qrCodeService->generate($verifyUrl, 200);

        return response($svg, 200, [
            'Content-Type' => 'image/svg+xml',
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }

    /**
     * Helper: format respons JSON untuk scan.
     */
    private function scanJsonResponse(string $status, Participant $participant, Workcode $workcode, ?string $message = null)
    {
        $totalParticipants = Participant::count();
        $totalAttended = Attendance::where('workcode_id', $workcode->id)
            ->distinct('participant_id')
            ->count('participant_id');

        $defaultMessages = [
            'already' => 'Peserta sudah melakukan presensi.',
            'success' => 'Presensi berhasil dicatat!',
            'error' => 'Gagal memproses presensi.',
        ];

        return response()->json([
            'status' => $status,
            'message' => $message ?? ($defaultMessages[$status] ?? ''),
            'participant' => [
                'id' => $participant->id,
                'nama' => $participant->nama,
                'nis_nip' => $participant->nis_nip,
            ],
            'timestamp' => now()->format('H:i:s'),
            'stats' => [
                'total' => $totalParticipants,
                'hadir' => $totalAttended,
                'belum' => $totalParticipants - $totalAttended,
            ],
        ]);
    }

    /**
     * Build daily recap data per participant.
     */
    private function buildDailyRecap(Workcode $workcode, $allParticipants): array
    {
        $attendanceRecords = Attendance::where('workcode_id', $workcode->id)
            ->get()
            ->groupBy('participant_id');

        // Ambil leave requests yang disetujui untuk workcode ini
        $leaveRecords = LeaveRequest::where('workcode_id', $workcode->id)
            ->where('status_approval', 'approved')
            ->get()
            ->groupBy('participant_id');

        $batasJamDatang = $workcode->jam_datang_selesai
            ? Carbon::createFromTimeString($workcode->jam_datang_selesai)
            : Carbon::createFromTimeString('07:00:00');

        return $allParticipants->map(function ($p) use ($attendanceRecords, $leaveRecords, $batasJamDatang) {
            $participantAttendances = $attendanceRecords->get($p->id, collect());
            $participantLeaves = $leaveRecords->get($p->id, collect());

            $totalAlpha = 0;
            $totalIzin = 0;
            $totalSakit = 0;
            $totalLupaAbsen = 0;
            $totalMenitTerlambat = 0;

            foreach ($participantAttendances as $att) {
                $status = $att->status ?? 'hadir';

                switch ($status) {
                    case 'alpha':
                        $totalAlpha++;
                        break;
                    case 'izin':
                        $totalIzin++;
                        break;
                    case 'sakit':
                        $totalSakit++;
                        break;
                    case 'lupa_absen':
                        $totalLupaAbsen++;
                        break;
                    case 'hadir':
                    default:
                        if ($att->waktu_hadir) {
                            $jamHadir = Carbon::parse($att->waktu_hadir);
                            $batas = $batasJamDatang->copy()->setDate($jamHadir->year, $jamHadir->month, $jamHadir->day);
                            if ($jamHadir->greaterThan($batas)) {
                                $totalMenitTerlambat += (int) $batas->diffInMinutes($jamHadir);
                            }
                        }
                        break;
                }
            }

            // Tambahkan izin/sakit dari leave requests yang tidak ada attendance record-nya
            foreach ($participantLeaves as $leave) {
                $jenis = $leave->jenis_izin ?? $leave->tipe_izin ?? '';
                if (str_contains($jenis, 'sakit')) {
                    $totalSakit++;
                } else {
                    $totalIzin++;
                }
            }

            $hasAnyAttendance = $participantAttendances->isNotEmpty();

            return [
                'id' => $participantAttendances->first()?->id,
                'participant_id' => $p->id,
                'nama' => $p->nama,
                'nis_nip' => $p->nis_nip,
                'status_pegawai' => $p->status ?? '',
                'status' => $hasAnyAttendance ? 'hadir' : 'alpha',
                'total_alpha' => $totalAlpha,
                'total_izin' => $totalIzin,
                'total_sakit' => $totalSakit,
                'total_lupa_absen' => $totalLupaAbsen,
                'total_menit_terlambat' => $totalMenitTerlambat,
            ];
        })->values()->toArray();
    }

    /**
     * Fill missing days for harian workcode (alpha/libur).
     */
    private function fillMissingDays(Workcode $workcode, Participant $participant, $existingAttendances, int $year, int $month)
    {
        $startDate = Carbon::create($year, $month, 1)->startOfDay();
        $endDate = $startDate->copy()->endOfMonth();
        $today = now()->startOfDay();

        // Jangan isi hari-hari di masa depan
        if ($endDate->greaterThan($today)) {
            $endDate = $today;
        }

        $attendedDates = $existingAttendances->pluck('tanggal')->toArray();

        // Ambil leave requests untuk bulan ini
        $leaveRequests = LeaveRequest::where('participant_id', $participant->id)
            ->where('workcode_id', $workcode->id)
            ->where('status_approval', 'approved')
            ->where(function ($q) use ($startDate, $endDate) {
                $q->whereBetween('tanggal', [$startDate, $endDate]);
            })
            ->get();

        $leaveDates = [];
        foreach ($leaveRequests as $leave) {
            $leaveStart = Carbon::parse($leave->tanggal);
            $leaveEnd = $leave->tanggal_selesai ? Carbon::parse($leave->tanggal_selesai) : $leaveStart;
            $current = $leaveStart->copy();
            while ($current->lte($leaveEnd)) {
                $jenis = ($leave->jenis_izin && str_contains($leave->jenis_izin, 'sakit')) ? 'sakit' : 'izin';
                $leaveDates[$current->format('Y-m-d')] = $jenis;
                $current->addDay();
            }
        }

        $result = collect($existingAttendances->toArray());

        $current = $startDate->copy();
        while ($current->lte($endDate)) {
            $dateStr = $current->format('Y-m-d');
            $dayOfWeek = $current->dayOfWeek; // 0 = Sunday, 6 = Saturday

            if (! in_array($dateStr, $attendedDates)) {
                // Sabtu/Minggu = libur
                if ($dayOfWeek === 0 || $dayOfWeek === 6) {
                    $result->push([
                        'id' => null,
                        'tanggal' => $dateStr,
                        'jam_masuk' => '-',
                        'jam_pulang' => '-',
                        'waktu_hadir' => '-',
                        'waktu_pulang' => '-',
                        'status' => 'libur',
                    ]);
                } elseif (isset($leaveDates[$dateStr])) {
                    $result->push([
                        'id' => null,
                        'tanggal' => $dateStr,
                        'jam_masuk' => '-',
                        'jam_pulang' => '-',
                        'waktu_hadir' => '-',
                        'waktu_pulang' => '-',
                        'status' => $leaveDates[$dateStr],
                    ]);
                } else {
                    $result->push([
                        'id' => null,
                        'tanggal' => $dateStr,
                        'jam_masuk' => '-',
                        'jam_pulang' => '-',
                        'waktu_hadir' => '-',
                        'waktu_pulang' => '-',
                        'status' => 'alpha',
                    ]);
                }
            }

            $current->addDay();
        }

        return $result->sortBy('tanggal');
    }
}
