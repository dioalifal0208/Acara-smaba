<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\LeaveRequest;
use App\Models\Participant;
use App\Models\Setting;
use App\Models\Workcode;
use App\Services\AttendanceValidationService;
use App\Services\QrCodeService;
use App\Support\AdminDashboardStats;
use App\Support\PrivateFile;
use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

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

        return Inertia::render('Scanner/Index', [
            'activeWorkcode' => $activeWorkcode,
            'initialStats' => AdminDashboardStats::presence($activeWorkcode),
            'initialBoard' => AdminDashboardStats::board($activeWorkcode),
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
        // QR peserta dari kamera, atau NIP yang diketik admin bila QR tidak terbaca / HP peserta mati.
        $request->validate([
            'qr_token' => 'required_without:nis_nip|nullable|string',
            'nis_nip' => 'required_without:qr_token|nullable|string|max:50',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'accuracy' => 'nullable|numeric',
        ]);
        $manual = ! $request->filled('qr_token');

        $activeWorkcode = Workcode::getActive();

        if (! $activeWorkcode) {
            return response()->json([
                'status' => 'error',
                'message' => 'Belum ada Workcode yang aktif.',
            ], 400);
        }

        try {
            $validationService->validateWorkcodeActive($activeWorkcode);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->validator->errors()->first(),
            ], $e->status);
        }

        if ($manual) {
            $nip = trim((string) $request->input('nis_nip'));
            $matches = $nip === '' || $nip === '-' ? collect() : Participant::where('nis_nip', $nip)->limit(2)->get();

            if ($matches->count() !== 1) {
                return response()->json([
                    'status' => 'error',
                    'message' => $matches->isEmpty()
                        ? 'NIP '.$nip.' tidak terdaftar. Periksa lagi angkanya.'
                        : 'NIP '.$nip.' dipakai lebih dari satu peserta. Perbaiki di Data Peserta, lalu coba lagi.',
                ], 404);
            }
            $participant = $matches->first();
        } else {
            $participant = Participant::where('qr_token', $request->input('qr_token'))->first();
        }

        if (! $participant) {
            return response()->json([
                'status' => 'error',
                'message' => 'QR Code tidak dikenali. Peserta tidak ditemukan.',
            ], 404);
        }

        // Saat beberapa workcode aktif bersamaan, QR peserta menentukan
        // workcode yang memang tersedia untuk peserta tersebut.
        $participantWorkcode = Workcode::getActive($participant);
        if (! $participantWorkcode) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tidak ada workcode aktif yang tersedia untuk peserta ini.',
            ], 403);
        }
        $activeWorkcode = $participantWorkcode;

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
        $existingAttendance = Attendance::recorded()->where('workcode_id', $activeWorkcode->id)
            ->where('participant_id', $participant->id)
            ->when(
                $activeWorkcode->kategori === 'harian',
                fn ($q) => $q->whereDate('tanggal', now()->toDateString())
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

        // Batas jam datang mengikuti jadwal hari ini (jadwal_per_hari), sama seperti presensi wajah.
        if ($activeWorkcode->isLateAt($waktuHadir)) {
            $isLate = true;
            $lateMinutes = $activeWorkcode->lateMinutes($waktuHadir);
            $lateFormatted = Workcode::formatLateDuration($lateMinutes);
        }

        // Catat presensi datang (menimpa catatan otomatis stakeholder bila ada)
        $attendance = Attendance::createOrReplaceAutomatic([
            'workcode_id' => $activeWorkcode->id,
            'participant_id' => $participant->id,
            'tanggal' => now()->toDateString(),
            'waktu_hadir' => $waktuHadir,
            'status' => 'hadir',
            'attendance_method' => $manual ? 'manual' : 'qr_peserta',
            'device_hash' => hash('sha256', $request->ip().'|'.$request->userAgent()),
            'ip_address' => $request->ip(),
        ]);

        $status = $isLate ? 'warning' : 'success';
        $message = $isLate
            ? 'Presensi berhasil, tapi terlambat '.$lateFormatted.'.'
            : 'Presensi berhasil dicatat!';

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
            'stats' => AdminDashboardStats::presence($activeWorkcode),
            'board' => AdminDashboardStats::board($activeWorkcode),
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
        $workcodes = Workcode::withCount('attendances')->orderByDesc('created_at')->get();
        $activeWorkcodes = Workcode::getActiveWorkcodes();

        $selectedWorkcodeId = $request->input('workcode_id');
        $selectedWorkcode = $selectedWorkcodeId
            ? Workcode::find($selectedWorkcodeId)
            : $workcodes->first();

        $attendances = [];
        $stats = ['total' => 0, 'hadir' => 0, 'belum' => 0, 'izin' => 0, 'sakit' => 0, 'alpha' => 0];
        $participants = [];
        $period = null;

        if ($selectedWorkcode) {
            $allParticipants = $this->reportParticipants($selectedWorkcode);
            $participants = $allParticipants;
            $stats['total'] = $allParticipants->count();

            if ($selectedWorkcode->kategori === 'harian') {
                // Rekap harian per bulan: hitung alpha, izin, sakit, lupa_absen, total terlambat per peserta
                $month = $this->reportMonth($request);
                $period = $this->periodPayload($month);
                $attendances = $this->buildDailyRecap($selectedWorkcode, $allParticipants, $month);
                $stats['hadir'] = collect($attendances)->where('status', '!=', 'alpha')->count();
            } else {
                // Kegiatan sekali: list presensi per peserta
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
                        'tanggal' => $att?->tanggal ?? $att?->waktu_hadir?->toDateString(),
                        'jam_masuk' => $att?->waktu_hadir?->format('H:i'),
                        'waktu_hadir' => $att?->waktu_hadir?->format('H:i:s') ?? '-',
                        'waktu_pulang' => $att?->waktu_pulang?->format('H:i:s') ?? '-',
                        'signature_url' => PrivateFile::url('attendance-signature', $att),
                        'face_capture_url' => PrivateFile::url('attendance-face', $att),
                        'media_expired' => $att !== null && PrivateFile::isExpired('attendance-face', $att),
                        'attendance_method' => $this->attendanceMethodLabel($att),
                        'status' => $att ? ($att->status ?? 'hadir') : 'alpha',
                    ];
                })->values()->toArray();

                // Izin/sakit dipisah dari hadir agar papan laporan menampilkan keduanya dengan benar.
                $stats['izin'] = $attendanceRecords->whereIn('status', ['izin', 'sakit'])->count();
                $stats['hadir'] = $attendanceRecords->count() - $stats['izin'];
            }

            $stats['belum'] = max(0, $stats['total'] - $stats['hadir'] - $stats['izin']);
        }

        $namaKepsek = Setting::get('kepala_sekolah_nama', 'Muhtarom, S.Pd., M.Si.');
        $nipKepsek = Setting::get('kepala_sekolah_nip', '197205172006041015');

        return Inertia::render('Report/Index', [
            'workcodes' => $workcodes,
            'activeWorkcodes' => $activeWorkcodes,
            'selectedWorkcodeId' => $selectedWorkcode?->id,
            'selectedWorkcode' => $selectedWorkcode,
            'mediaRetentionDays' => config('attendance.media_retention_days', 30),
            'stats' => $stats,
            // Periode rekap workcode harian (satu bulan penuh); null untuk kegiatan.
            'period' => $period,
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
                $q->whereYear('tanggal', $year)
                    ->whereMonth('tanggal', $month);
            })
            ->orderBy('tanggal')
            ->orderBy('id')
            ->get()
            ->map(function ($att) use ($workcode) {
                $late = ($att->status ?? 'hadir') === 'hadir' && $att->waktu_hadir && $workcode->isLateAt($att->waktu_hadir);

                return [
                    'id' => $att->id,
                    'tanggal' => $att->tanggal ?? $att->waktu_hadir?->toDateString() ?? $att->created_at->format('Y-m-d'),
                    'jam_masuk' => $att->waktu_hadir?->format('H:i'),
                    'jam_pulang' => $att->waktu_pulang?->format('H:i') ?? '-',
                    'waktu_hadir' => $att->waktu_hadir?->format('H:i') ?? '-',
                    'waktu_pulang' => $att->waktu_pulang?->format('H:i') ?? '-',
                    'signature_url' => PrivateFile::url('attendance-signature', $att),
                    'face_capture_url' => PrivateFile::url('attendance-face', $att),
                    'face_capture_pulang_url' => PrivateFile::url('attendance-face-pulang', $att),
                    'media_expired' => PrivateFile::isExpired('attendance-face', $att),
                    'attendance_method' => $this->attendanceMethodLabel($att),
                    'status' => $att->status ?? 'hadir',
                    'is_late' => $late,
                    'late_minutes' => $late ? $workcode->lateMinutes($att->waktu_hadir) : 0,
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
            'attendance_method' => 'manual',
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
            'tanggal' => $tanggal->toDateString(),
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
    public function exportAttendance(Workcode $workcode, Request $request)
    {
        $allParticipants = $this->reportParticipants($workcode);
        $month = $workcode->kategori === 'harian' ? $this->reportMonth($request) : null;
        $filename = 'rekap_presensi_'.preg_replace('/[^A-Za-z0-9_-]+/', '_', $workcode->nama_workcode)
            .($month ? '_'.$month->format('Y-m') : '').'_'.now()->format('Ymd_His').'.xlsx';

        if ($workcode->kategori === 'harian') {
            $header = ['No', 'Nama', 'NIS/NIP', 'Status Pegawai', 'Alpha', 'Izin', 'Sakit', 'Lupa Absen', 'Total Terlambat (Menit)'];
            $rows = collect($this->buildDailyRecap($workcode, $allParticipants, $month))->values()->map(fn ($r, $i) => [
                $i + 1,
                $r['nama'],
                $r['nis_nip'],
                $r['status_pegawai'] ?? '',
                $r['total_alpha'] ?? 0,
                $r['total_izin'] ?? 0,
                $r['total_sakit'] ?? 0,
                $r['total_lupa_absen'] ?? 0,
                $r['total_menit_terlambat'] ?? 0,
            ]);
        } else {
            $header = ['No', 'Nama', 'NIS/NIP', 'Status Pegawai', 'Waktu Presensi', 'Status', 'Metode Presensi'];
            $attendanceRecords = Attendance::where('workcode_id', $workcode->id)->get()->keyBy('participant_id');
            $rows = $allParticipants->values()->map(function (Participant $p, int $i) use ($attendanceRecords) {
                $att = $attendanceRecords->get($p->id);

                return [
                    $i + 1,
                    $p->nama,
                    $p->nis_nip,
                    $p->status ?? '',
                    $att?->waktu_hadir?->format('H:i:s') ?? '-',
                    $att ? ($att->status ?? 'hadir') : 'alpha',
                    $this->attendanceMethodLabel($att) ?? '-',
                ];
            });
        }

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Rekap Presensi');
        $sheet->fromArray($header, null, 'A1');

        foreach ($rows as $index => $row) {
            foreach ($row as $column => $value) {
                $cell = Coordinate::stringFromColumnIndex($column + 1).($index + 2);
                // Tipe sel ditulis eksplisit (tidak lewat value binder global): angka sebagai angka,
                // teks sebagai string agar NIS/NIP 18 digit tidak menjadi notasi ilmiah di Excel.
                is_int($value)
                    ? $sheet->setCellValueExplicit($cell, $value, DataType::TYPE_NUMERIC)
                    : $sheet->setCellValueExplicit($cell, (string) $value, DataType::TYPE_STRING);
            }
        }

        $lastColumn = Coordinate::stringFromColumnIndex(count($header));
        $sheet->getStyle("A1:{$lastColumn}1")->getFont()->setBold(true);
        foreach (range(1, count($header)) as $column) {
            $sheet->getColumnDimension(Coordinate::stringFromColumnIndex($column))->setAutoSize(true);
        }

        return response()->streamDownload(fn () => (new Xlsx($spreadsheet))->save('php://output'), $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Cache-Control' => 'max-age=0',
        ]);
    }

    /**
     * Generate QR Signature image (SVG) untuk tanda tangan digital pada laporan.
     */
    public function qrSignature(Workcode $workcode, QrCodeService $qrCodeService)
    {
        // URL verifikasi tanda tangan digital
        // URL bertanda tangan permanen (QR tercetak di laporan): ID workcode berurutan tidak bisa
        // ditebak untuk membuka laporan lain.
        $verifyUrl = URL::signedRoute('signature.verify', ['workcode' => $workcode->id]);
        $svg = $qrCodeService->generateWithLogo($verifyUrl, 200);

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
            'stats' => AdminDashboardStats::presence($workcode),
            'board' => AdminDashboardStats::board($workcode),
        ]);
    }

    /**
     * Bulan rekap presensi harian dari ?bulan=YYYY-MM (mis. untuk mencetak bulan lalu); bawaan bulan berjalan.
     */
    private function reportMonth(Request $request): CarbonImmutable
    {
        $bulan = $request->input('bulan');

        if (is_string($bulan) && preg_match('/^\d{4}-(0[1-9]|1[0-2])$/', $bulan)) {
            return CarbonImmutable::createFromFormat('!Y-m', $bulan)->startOfMonth();
        }

        return CarbonImmutable::now()->startOfMonth();
    }

    /** Periode rekap untuk halaman laporan dan cetak: tanggal 1 s.d. akhir bulan (28–31). */
    private function periodPayload(CarbonImmutable $month): array
    {
        $start = $month->startOfMonth();
        $end = $month->endOfMonth();

        return [
            'month' => $start->format('Y-m'),
            'start' => $start->toDateString(),
            'end' => $end->toDateString(),
            'label' => $start->locale('id')->isoFormat('D MMMM YYYY').' s.d. '.$end->locale('id')->isoFormat('D MMMM YYYY'),
        ];
    }

    /**
     * Peserta yang masuk laporan workcode. Harian: peserta yang wajib presensi di workcode itu, tanpa
     * GTT/PTT (tidak masuk laporan presensi harian). Kegiatan: semua peserta (perilaku lama).
     */
    private function reportParticipants(Workcode $workcode)
    {
        if ($workcode->kategori === 'harian') {
            return $workcode->eligibleParticipants()->permanentStaff()->orderBy('nama')->get();
        }

        return Participant::orderBy('nama')->get();
    }

    /**
     * Rekap harian per peserta untuk satu bulan (berdasarkan kolom tanggal).
     *
     * Izin/sakit dihitung dari baris presensi saja: persetujuan izin sudah membuat satu baris `izin` per hari
     * (AdminLeaveController). Sakit = baris `sakit`, atau `izin` yang jenis izinnya sakit. Dulu pengajuan izin
     * ikut dihitung lagi sehingga satu hari izin terhitung dua kali (dan izin tidak absen pulang ikut terhitung).
     */
    private function buildDailyRecap(Workcode $workcode, $allParticipants, CarbonImmutable $month): array
    {
        $attendanceRecords = Attendance::where('workcode_id', $workcode->id)
            ->whereBetween('tanggal', [$month->startOfMonth()->toDateString(), $month->endOfMonth()->toDateString()])
            ->with('leaveRequest')
            ->get()
            ->groupBy('participant_id');

        return $allParticipants->map(function ($p) use ($attendanceRecords, $workcode) {
            $participantAttendances = $attendanceRecords->get($p->id, collect());

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
                        // Persetujuan izin menyimpan semua jenis (termasuk sakit) sebagai status izin.
                        str_contains((string) $att->leaveRequest?->jenis_izin, 'sakit') ? $totalSakit++ : $totalIzin++;
                        break;
                    case 'sakit':
                        $totalSakit++;
                        break;
                    case 'lupa_absen':
                        $totalLupaAbsen++;
                        break;
                    case 'libur':
                        break;
                    case 'hadir':
                    default:
                        if ($att->waktu_hadir) {
                            $totalMenitTerlambat += $workcode->lateMinutes($att->waktu_hadir);
                        }
                        break;
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

    private function attendanceMethodLabel(?Attendance $attendance): ?string
    {
        if (! $attendance) {
            return null;
        }

        return match ($attendance->attendance_method) {
            'tanda_tangan' => 'Tanda Tangan',
            'wajah' => 'Wajah',
            'qr_peserta' => 'QR Peserta',
            'manual' => 'Manual',
            Attendance::METHOD_AUTO => 'Otomatis',
            default => $attendance->signature_path ? 'Tanda Tangan' : 'Wajah',
        };
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
