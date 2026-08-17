<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Event;
use App\Models\Participant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    /**
     * Hitung jarak dua titik dengan Haversine formula (dalam meter).
     */
    private function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371000;
        
        $latFrom = deg2rad($lat1);
        $lonFrom = deg2rad($lon1);
        $latTo = deg2rad($lat2);
        $lonTo = deg2rad($lon2);
        
        $latDelta = $latTo - $latFrom;
        $lonDelta = $lonTo - $lonFrom;
        
        $angle = 2 * asin(sqrt(pow(sin($latDelta / 2), 2) +
            cos($latFrom) * cos($latTo) * pow(sin($lonDelta / 2), 2)));
            
        return $angle * $earthRadius;
    }
    /**
     * Tampilkan halaman scanner QR.
     */
    public function scanner()
    {
        $activeEvent = Event::getActive();
        $totalParticipants = Participant::count();

        if ($activeEvent) {
            $totalAttended = Attendance::where('event_id', $activeEvent->id)
                ->distinct('participant_id')
                ->count('participant_id');
        } else {
            $totalAttended = 0;
        }

        return Inertia::render('Scanner/Index', [
            'activeEvent' => $activeEvent,
            'initialStats' => [
                'total' => $totalParticipants,
                'hadir' => $totalAttended,
                'belum' => $totalParticipants - $totalAttended,
            ],
        ]);
    }

    /**
     * Proses scan QR code — validasi & catat kehadiran per Event.
     */
    public function scan(Request $request)
    {
        $activeEvent = Event::getActive();

        if (!$activeEvent) {
            return response()->json([
                'status' => 'error',
                'message' => 'Belum ada Event yang aktif! Admin wajib memilih/mengaktifkan Event terlebih dahulu di menu Kelola Event.',
                'participant' => null,
                'timestamp' => now()->format('H:i:s'),
            ], 400);
        }

        $request->validate([
            'qr_token' => 'required|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'accuracy' => 'nullable|numeric',
        ]);

        if ($activeEvent->latitude && $activeEvent->longitude) {
            if (!$request->filled('latitude') || !$request->filled('longitude')) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Gagal mendapatkan lokasi GPS dari Scanner Admin. Pastikan izin lokasi diaktifkan pada browser Admin.',
                ], 400);
            }

            $distance = $this->calculateDistance(
                $activeEvent->latitude, $activeEvent->longitude,
                $request->latitude, $request->longitude
            );

            $radiusLimit = $activeEvent->radius_meters ?? 100;
            
            if ($distance > $radiusLimit) {
                $distanceFmt = number_format($distance, 0);
                return response()->json([
                    'status' => 'error',
                    'message' => "Scanner Admin berada di luar radius presensi ({$distanceFmt} meter). Admin harus berada dalam radius {$radiusLimit} meter dari lokasi acara.",
                ], 403);
            }
        }

        $token = trim($request->input('qr_token'));

        // Cari peserta berdasarkan QR token
        $participant = Participant::where('qr_token', $token)->first();

        if (!$participant) {
            return response()->json([
                'status' => 'error',
                'message' => 'QR Code tidak valid. Peserta tidak ditemukan.',
                'participant' => null,
                'timestamp' => now()->format('H:i:s'),
            ], 404);
        }

        if ($activeEvent->kategori === 'harian') {
            // Cek hari aktif
            $hariAktif = $activeEvent->hari_aktif ?? [];
            $currentDay = now()->dayOfWeekIso; // 1 (Mon) - 7 (Sun)
            if (!empty($hariAktif) && !in_array($currentDay, $hariAktif)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Hari ini bukan hari kerja untuk presensi harian.',
                    'participant' => null,
                ], 403);
            }

            $currentTime = now()->format('H:i:s');
            $jamDatangMulai = $activeEvent->jam_datang_mulai ?? '06:00:00';
            $jamDatangSelesai = $activeEvent->jam_datang_selesai ?? '07:00:00';
            $jamPulangMulai = $activeEvent->jam_pulang_mulai ?? '15:30:00';
            $jamPulangSelesai = $activeEvent->jam_pulang_selesai ?? '22:00:00';

            // Cek apakah sekarang sebelum jam datang mulai
            if ($currentTime < $jamDatangMulai) {
                return response()->json([
                    'status' => 'error',
                    'message' => "Presensi datang belum dibuka. Jadwal absen datang dimulai pukul " . substr($jamDatangMulai, 0, 5) . " WIB.",
                    'participant' => null,
                ], 403);
            }

            // Cek apakah sekarang sudah melewati batas jam pulang selesai
            if ($currentTime > $jamPulangSelesai) {
                return response()->json([
                    'status' => 'error',
                    'message' => "Sesi presensi harian hari ini telah ditutup (pukul " . substr($jamPulangSelesai, 0, 5) . " WIB).",
                    'participant' => null,
                ], 403);
            }

            // Cek data presensi hari ini
            $attendance = Attendance::where('event_id', $activeEvent->id)
                ->where('participant_id', $participant->id)
                ->whereDate('created_at', now()->toDateString())
                ->first();

            // Sesi Pulang: Jika waktu saat ini berada di rentang [jam_pulang_mulai, jam_pulang_selesai]
            if ($currentTime >= $jamPulangMulai && $currentTime <= $jamPulangSelesai) {
                if ($attendance && $attendance->waktu_pulang) {
                    return response()->json([
                        'status' => 'already',
                        'message' => $participant->nama . ' sudah absen pulang hari ini (pukul ' . $attendance->waktu_pulang->format('H:i:s') . ').',
                        'participant' => [
                            'id' => $participant->id,
                            'nama' => $participant->nama,
                            'nis_nip' => $participant->nis_nip,
                            'waktu_hadir' => $attendance->waktu_pulang->format('H:i:s'),
                        ],
                        'timestamp' => now()->format('H:i:s'),
                    ], 200);
                }

                if ($attendance) {
                    $attendance->update(['waktu_pulang' => now()]);
                } else {
                    $attendance = Attendance::create([
                        'event_id' => $activeEvent->id,
                        'participant_id' => $participant->id,
                        'waktu_pulang' => now(),
                    ]);
                }

                $totalParticipants = Participant::count();
                $totalAttended = Attendance::where('event_id', $activeEvent->id)
                    ->distinct('participant_id')
                    ->count('participant_id');

                return response()->json([
                    'status' => 'success',
                    'message' => 'Absen pulang ' . $participant->nama . ' berhasil dicatat!',
                    'participant' => [
                        'id' => $participant->id,
                        'nama' => $participant->nama,
                        'nis_nip' => $participant->nis_nip,
                        'waktu_hadir' => $attendance->waktu_pulang->format('d M Y H:i:s'),
                    ],
                    'stats' => [
                        'total' => $totalParticipants,
                        'hadir' => $totalAttended,
                        'belum' => $totalParticipants - $totalAttended,
                    ],
                    'timestamp' => now()->format('H:i:s'),
                ], 200);
            }

            // Sesi Datang: Jika waktu saat ini berada di rentang [jam_datang_mulai, jam_pulang_mulai)
            // Meliputi jam datang tepat waktu (06:00-07:00) dan jam kerja (07:00-15:30) sebagai Terlambat
            if ($currentTime >= $jamDatangMulai && $currentTime < $jamPulangMulai) {
                if ($attendance && $attendance->waktu_hadir) {
                    return response()->json([
                        'status' => 'already',
                        'message' => $participant->nama . ' sudah absen datang hari ini (pukul ' . $attendance->waktu_hadir->format('H:i:s') . ').',
                        'participant' => [
                            'id' => $participant->id,
                            'nama' => $participant->nama,
                            'nis_nip' => $participant->nis_nip,
                            'waktu_hadir' => $attendance->waktu_hadir->format('H:i:s'),
                        ],
                        'timestamp' => now()->format('H:i:s'),
                    ], 200);
                }

                $isLate = false;
                $lateMinutes = 0;
                $lateFormatted = '';

                // Cek keterlambatan jika scan setelah jam_datang_selesai (misal lewat dari 07:00)
                if ($currentTime > $jamDatangSelesai) {
                    $isLate = true;
                    $targetDatangSelesai = \Carbon\Carbon::parse(now()->format('Y-m-d') . ' ' . $jamDatangSelesai);
                    $lateMinutes = (int) max(1, round($targetDatangSelesai->diffInMinutes(now())));

                    $hours = floor($lateMinutes / 60);
                    $mins = $lateMinutes % 60;
                    if ($hours > 0) {
                        $lateFormatted = $hours . ' jam' . ($mins > 0 ? ' ' . $mins . ' menit' : '');
                    } else {
                        $lateFormatted = $mins . ' menit';
                    }
                }

                if ($attendance) {
                    $attendance->update(['waktu_hadir' => now()]);
                } else {
                    $attendance = Attendance::create([
                        'event_id' => $activeEvent->id,
                        'participant_id' => $participant->id,
                        'waktu_hadir' => now(),
                    ]);
                }

                $totalParticipants = Participant::count();
                $totalAttended = Attendance::where('event_id', $activeEvent->id)
                    ->distinct('participant_id')
                    ->count('participant_id');

                $statusResponse = $isLate ? 'warning' : 'success';
                $messageResponse = $isLate
                    ? "Presensi datang {$participant->nama} berhasil dicatat! (Terlambat {$lateFormatted})"
                    : "Presensi datang {$participant->nama} berhasil dicatat tepat waktu!";

                return response()->json([
                    'status' => $statusResponse,
                    'is_late' => $isLate,
                    'late_minutes' => $lateMinutes,
                    'late_formatted' => $lateFormatted,
                    'message' => $messageResponse,
                    'participant' => [
                        'id' => $participant->id,
                        'nama' => $participant->nama,
                        'nis_nip' => $participant->nis_nip,
                        'waktu_hadir' => $attendance->waktu_hadir->format('d M Y H:i:s'),
                    ],
                    'stats' => [
                        'total' => $totalParticipants,
                        'hadir' => $totalAttended,
                        'belum' => $totalParticipants - $totalAttended,
                    ],
                    'timestamp' => now()->format('H:i:s'),
                ], 200);
            }
        } else {
            // Logika event acara biasa (sekali scan)
            $existingAttendance = Attendance::where('event_id', $activeEvent->id)
                ->where('participant_id', $participant->id)
                ->first();

            if ($existingAttendance) {
                return response()->json([
                    'status' => 'already',
                    'message' => $participant->nama . ' sudah absen pada event "' . $activeEvent->nama_event . '".',
                    'participant' => [
                        'id' => $participant->id,
                        'nama' => $participant->nama,
                        'nis_nip' => $participant->nis_nip,
                        'waktu_hadir' => $existingAttendance->waktu_hadir ? $existingAttendance->waktu_hadir->format('d M Y H:i:s') : '-',
                    ],
                    'timestamp' => now()->format('H:i:s'),
                ], 200);
            }

            // Catat kehadiran
            $attendance = Attendance::create([
                'event_id' => $activeEvent->id,
                'participant_id' => $participant->id,
                'waktu_hadir' => now(),
            ]);

            // Hitung stats terbaru untuk event ini
            $totalParticipants = Participant::count();
            $totalAttended = Attendance::where('event_id', $activeEvent->id)
                ->distinct('participant_id')
                ->count('participant_id');

            return response()->json([
                'status' => 'success',
                'message' => 'Presensi ' . $participant->nama . ' berhasil dicatat untuk event "' . $activeEvent->nama_event . '"!',
                'participant' => [
                    'id' => $participant->id,
                    'nama' => $participant->nama,
                    'nis_nip' => $participant->nis_nip,
                    'waktu_hadir' => $attendance->waktu_hadir->format('d M Y H:i:s'),
                ],
                'stats' => [
                    'total' => $totalParticipants,
                    'hadir' => $totalAttended,
                    'belum' => $totalParticipants - $totalAttended,
                ],
                'timestamp' => now()->format('H:i:s'),
            ], 200);
        }
    }

    /**
     * API endpoint untuk scan — accessible via /api/scan.
     */
    public function apiScan(Request $request)
    {
        return $this->scan($request);
    }

    /**
     * Tampilkan laporan kehadiran terkelompokkan per event.
     */
    public function report(Request $request)
    {
        $events = Event::withCount('attendances')
            ->orderBy('is_active', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        $activeEvent = Event::getActive();
        $selectedEventId = $request->input('event_id') ?? ($activeEvent ? $activeEvent->id : ($events->first()->id ?? null));

        $selectedEvent = $events->firstWhere('id', (int) $selectedEventId);

        $totalParticipants = Participant::count();

        if ($selectedEventId) {
            $attendancesRaw = Attendance::with('participant')
                ->where('event_id', $selectedEventId)
                ->orderBy('waktu_hadir', 'desc')
                ->get();
                
            $totalHadir = $attendancesRaw->where('status', 'hadir')->count();
            $totalAlpha = $attendancesRaw->where('status', 'alpha')->count();
            $totalIzin = $attendancesRaw->where('status', 'izin')->count();
            $totalSakit = $attendancesRaw->where('status', 'sakit')->count();
            $totalLupaAbsen = $attendancesRaw->where('status', 'lupa_absen')->count();
            $totalAttended = $attendancesRaw->count();

            if ($selectedEvent && $selectedEvent->kategori === 'harian') {
                $allParticipants = Participant::all();
                $grouped = $attendancesRaw->groupBy('participant_id');
                
                $attendances = $allParticipants->map(function ($participant) use ($grouped) {
                    $participantAttendances = $grouped->get($participant->id) ?? collect();
                    return [
                        'participant_id' => $participant->id,
                        'nama' => $participant->nama,
                        'nis_nip' => $participant->nis_nip ?? '-',
                        'status_pegawai' => $participant->status ?? '-',
                        'total_hadir' => $participantAttendances->where('status', 'hadir')->count(),
                        'total_alpha' => $participantAttendances->where('status', 'alpha')->count(),
                        'total_izin' => $participantAttendances->where('status', 'izin')->count(),
                        'total_sakit' => $participantAttendances->where('status', 'sakit')->count(),
                        'total_lupa_absen' => $participantAttendances->where('status', 'lupa_absen')->count(),
                    ];
                });
            } else {
                $attendances = $attendancesRaw->map(function ($attendance) {
                    return [
                        'id' => $attendance->id,
                        'participant_id' => $attendance->participant_id,
                        'nama' => $attendance->participant->nama ?? 'Tidak Dikenal',
                        'nis_nip' => $attendance->participant->nis_nip ?? '-',
                        'status_pegawai' => $attendance->participant->status ?? '-',
                        'status' => $attendance->status,
                        'waktu_hadir' => $attendance->waktu_hadir ? $attendance->waktu_hadir->format('d M Y H:i:s') : '-',
                    ];
                });
            }
        } else {
            $totalHadir = 0;
            $totalAlpha = 0;
            $totalIzin = 0;
            $totalSakit = 0;
            $totalLupaAbsen = 0;
            $totalAttended = 0;
            $attendances = collect();
        }

        $totalNotAttended = $totalParticipants - $totalAttended;

        return Inertia::render('Report/Index', [
            'events' => $events,
            'selectedEventId' => $selectedEventId ? (int) $selectedEventId : null,
            'selectedEvent' => $selectedEvent,
            'stats' => [
                'total' => $totalParticipants,
                'hadir' => $totalHadir,
                'alpha' => $totalAlpha,
                'izin' => $totalIzin,
                'sakit' => $totalSakit,
                'lupa_absen' => $totalLupaAbsen,
                'belum' => $totalNotAttended,
            ],
            'attendances' => $attendances,
        ]);
    }

    /**
     * Dapatkan detail presensi harian untuk 1 partisipan (untuk Cetak Rekap Individu).
     */
    public function getIndividualRecap($eventId, $participantId)
    {
        $event = Event::findOrFail($eventId);
        $participant = Participant::findOrFail($participantId);

        $attendances = Attendance::where('event_id', $eventId)
            ->where('participant_id', $participantId)
            ->orderBy('waktu_hadir', 'asc')
            ->get()
            ->map(function ($att) {
                return [
                    'waktu_hadir' => $att->waktu_hadir ? $att->waktu_hadir->format('d M Y H:i:s') : '-',
                    'waktu_pulang' => $att->waktu_pulang ? $att->waktu_pulang->format('d M Y H:i:s') : '-',
                    'status' => $att->status,
                ];
            });

        return response()->json([
            'event' => $event,
            'participant' => $participant,
            'attendances' => $attendances
        ]);
    }

    /**
     * Export bukti daftar hadir event ke Excel (.xlsx / fallback .csv).
     */
    public function exportAttendance(Event $event)
    {
        $attendances = Attendance::with('participant')
            ->where('event_id', $event->id)
            ->orderBy('waktu_hadir', 'asc')
            ->get();

        $totalParticipants = Participant::count();
        $totalAttended = $attendances->count();

        try {
            if (class_exists('PhpOffice\PhpSpreadsheet\Spreadsheet')) {
                $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
                $sheet = $spreadsheet->getActiveSheet();
                $sheet->setTitle('Bukti Kehadiran');

                $lastColumn = $event->kategori === 'harian' ? 'I' : 'F';

                // Header Kop Surat
                $sheet->mergeCells('A1:' . $lastColumn . '1');
                $sheet->setCellValue('A1', 'REKAP PRESENSI ' . mb_strtoupper($event->nama_event));
                $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14)->getColor()->setRGB('166534');
                $sheet->getStyle('A1')->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);

                $sheet->mergeCells('A2:' . $lastColumn . '2');
                $sheet->setCellValue('A2', 'SMA NEGERI 1 BABAT');
                $sheet->getStyle('A2')->getFont()->setBold(true)->setSize(12);
                $sheet->getStyle('A2')->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);

                // Event Metadata Info
                $sheet->setCellValue('A4', 'Nama Acara / Event');
                $sheet->setCellValue('B4', ': ' . $event->nama_event);
                $sheet->getStyle('A4')->getFont()->setBold(true);

                $sheet->setCellValue('A5', 'Tanggal Acara');
                $sheet->setCellValue('B5', ': ' . $event->created_at->format('d F Y'));
                $sheet->getStyle('A5')->getFont()->setBold(true);

                $sheet->setCellValue('A6', 'Total Kehadiran');
                $sheet->setCellValue('B6', ': ' . $totalAttended . ' dari ' . $totalParticipants . ' peserta');
                $sheet->getStyle('A6')->getFont()->setBold(true);

                $sheet->setCellValue('A7', 'Waktu Unduh');
                $sheet->setCellValue('B7', ': ' . now()->format('d F Y H:i:s') . ' WIB');
                $sheet->getStyle('A7')->getFont()->setBold(true);

                // Table Headers (Row 9)
                if ($event->kategori === 'harian') {
                    $headers = ['No', 'Nama Lengkap', 'NIP', 'Alpha', 'Izin', 'Sakit', 'Lupa Absen', 'Total Telat', 'Status'];
                    $columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
                } else {
                    $headers = ['No', 'Nama Lengkap', 'NIP', 'Status Pegawai', 'Waktu Presensi', 'Status'];
                    $columns = ['A', 'B', 'C', 'D', 'E', 'F'];
                }

                foreach ($headers as $index => $header) {
                    $sheet->setCellValue($columns[$index] . '9', $header);
                }

                // Header Styling
                $headerStyle = [
                    'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                    'fill' => [
                        'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                        'startColor' => ['rgb' => '15803D'],
                    ],
                    'alignment' => [
                        'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
                        'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
                    ],
                ];
                $sheet->getStyle('A9:' . $lastColumn . '9')->applyFromArray($headerStyle);
                $sheet->getRowDimension(9)->setRowHeight(24);

                // Format column C (NIP) as Text
                $sheet->getStyle('C:C')->getNumberFormat()->setFormatCode('@');

                // Data Rows
                $row = 10;
                foreach ($attendances as $idx => $att) {
                    $sheet->setCellValue('A' . $row, $idx + 1);
                    $sheet->setCellValue('B' . $row, $att->participant->nama ?? 'Tidak Dikenal');
                    $sheet->setCellValueExplicit('C' . $row, $att->participant->nis_nip ?? '-', \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
                    if ($event->kategori === 'harian') {
                        $sheet->setCellValue('D' . $row, $att->status === 'alpha' ? '1' : '-');
                        $sheet->setCellValue('E' . $row, $att->status === 'izin' ? '1' : '-');
                        $sheet->setCellValue('F' . $row, $att->status === 'sakit' ? '1' : '-');
                        $sheet->setCellValue('G' . $row, $att->status === 'lupa_absen' ? '1' : '-');
                        $sheet->setCellValue('H' . $row, '-');
                        $sheet->setCellValue('I' . $row, ucwords(str_replace('_', ' ', $att->status)));

                        $sheet->getStyle('A' . $row)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
                        $sheet->getStyle('C' . $row)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
                        $sheet->getStyle('D' . $row)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
                        $sheet->getStyle('E' . $row)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
                        $sheet->getStyle('F' . $row)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
                        $sheet->getStyle('G' . $row)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
                        $sheet->getStyle('H' . $row)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
                        $sheet->getStyle('I' . $row)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
                    } else {
                        $sheet->setCellValue('D' . $row, $att->participant->status ?? '-');
                        $sheet->setCellValue('E' . $row, $att->waktu_hadir ? $att->waktu_hadir->format('d/m/Y H:i:s') : '-');
                        $sheet->setCellValue('F' . $row, ucwords(str_replace('_', ' ', $att->status)));

                        $sheet->getStyle('A' . $row)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
                        $sheet->getStyle('C' . $row)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
                        $sheet->getStyle('E' . $row)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
                        $sheet->getStyle('F' . $row)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
                    }

                    $row++;
                }

                if ($attendances->isEmpty()) {
                    $sheet->mergeCells('A10:' . $lastColumn . '10');
                    $sheet->setCellValue('A10', 'Belum ada data presensi untuk event ini.');
                    $sheet->getStyle('A10')->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
                    $row = 11;
                }

                // Table Borders
                $tableStyle = [
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                            'color' => ['rgb' => 'CBD5E1'],
                        ],
                    ],
                ];
                $sheet->getStyle('A9:' . $lastColumn . ($row - 1))->applyFromArray($tableStyle);

                // Width dimensions
                $sheet->getColumnDimension('A')->setWidth(8);
                $sheet->getColumnDimension('B')->setWidth(32);
                $sheet->getColumnDimension('C')->setWidth(26);
                if ($event->kategori === 'harian') {
                    $sheet->getColumnDimension('D')->setWidth(10);
                    $sheet->getColumnDimension('E')->setWidth(10);
                    $sheet->getColumnDimension('F')->setWidth(10);
                    $sheet->getColumnDimension('G')->setWidth(12);
                    $sheet->getColumnDimension('H')->setWidth(26);
                    $sheet->getColumnDimension('I')->setWidth(14);
                } else {
                    $sheet->getColumnDimension('D')->setWidth(24);
                    $sheet->getColumnDimension('E')->setWidth(22);
                    $sheet->getColumnDimension('F')->setWidth(14);
                }

                $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
                $slug = \Illuminate\Support\Str::slug($event->nama_event);
                $filename = 'Bukti_Hadir_' . $slug . '_' . date('Ymd_His') . '.xlsx';

                return response()->streamDownload(function () use ($writer) {
                    $writer->save('php://output');
                }, $filename, [
                    'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Cache-Control' => 'max-age=0',
                ]);
            }
        } catch (\Throwable $e) {
            // Fallback
        }

        // CSV Fallback
        $slug = \Illuminate\Support\Str::slug($event->nama_event);
        $csvFilename = 'Bukti_Hadir_' . $slug . '_' . date('Ymd_His') . '.csv';
        return response()->streamDownload(function () use ($event, $attendances, $totalAttended, $totalParticipants) {
            $handle = fopen('php://output', 'w');
            fputs($handle, "\xEF\xBB\xBF"); // UTF-8 BOM
            fputcsv($handle, ['REKAP PRESENSI ' . mb_strtoupper($event->nama_event) . ' - SMA NEGERI 1 BABAT']);
            fputcsv($handle, ['Nama Acara', $event->nama_event]);
            fputcsv($handle, ['Tanggal', $event->created_at->format('d/m/Y')]);
            fputcsv($handle, ['Total Kehadiran', $totalAttended . ' dari ' . $totalParticipants . ' peserta']);
            fputcsv($handle, []);
            
            if ($event->kategori === 'harian') {
                fputcsv($handle, ['No', 'Nama Lengkap', 'NIP', 'Alpha', 'Izin', 'Sakit', 'Lupa Absen', 'Total Telat', 'Status']);
                foreach ($attendances as $idx => $att) {
                    fputcsv($handle, [
                        $idx + 1,
                        $att->participant->nama ?? 'Tidak Dikenal',
                        $att->participant->nis_nip ?? '-',
                        $att->status === 'alpha' ? '1' : '-',
                        $att->status === 'izin' ? '1' : '-',
                        $att->status === 'sakit' ? '1' : '-',
                        $att->status === 'lupa_absen' ? '1' : '-',
                        '-',
                        ucwords(str_replace('_', ' ', $att->status)),
                    ]);
                }
            } else {
                fputcsv($handle, ['No', 'Nama Lengkap', 'NIP', 'Status Pegawai', 'Waktu Presensi', 'Status']);
                foreach ($attendances as $idx => $att) {
                    fputcsv($handle, [
                        $idx + 1,
                        $att->participant->nama ?? 'Tidak Dikenal',
                        $att->participant->nis_nip ?? '-',
                        $att->participant->status ?? '-',
                        $att->waktu_hadir ? $att->waktu_hadir->format('d/m/Y H:i:s') : '-',
                        ucwords(str_replace('_', ' ', $att->status)),
                    ]);
                }
            }
            fclose($handle);
        }, $csvFilename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Cache-Control' => 'max-age=0',
        ]);
    }

    /**
     * Generate TTD Digital QR Code untuk Kepala Sekolah pada Bukti Hadir Event.
     */
    public function qrSignature(Event $event)
    {
        $verificationData = "DOKUMEN RESMI REKAP PRESENSI\n"
            . "SMA NEGERI 1 BABAT\n"
            . "Acara: " . $event->nama_event . "\n"
            . "Tanggal: " . $event->created_at->format('d/m/Y') . "\n"
            . "Diverifikasi & Ditandatangani secara Digital oleh:\n"
            . "Kepala Sekolah: Muhtarom, S.Pd., M.Si.";

        $svg = \SimpleSoftwareIO\QrCode\Facades\QrCode::format('svg')
            ->size(160)
            ->errorCorrection('M')
            ->margin(1)
            ->color(15, 23, 42)
            ->generate($verificationData);

        return response($svg, 200, [
            'Content-Type' => 'image/svg+xml',
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }
}
