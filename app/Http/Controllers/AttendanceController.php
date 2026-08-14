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
        ]);

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

        // Cek apakah sudah presensi pada event ini
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
                    'waktu_hadir' => $existingAttendance->waktu_hadir->format('d M Y H:i:s'),
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
            $totalAttended = Attendance::where('event_id', $selectedEventId)
                ->distinct('participant_id')
                ->count('participant_id');

            $attendances = Attendance::with('participant')
                ->where('event_id', $selectedEventId)
                ->orderBy('waktu_hadir', 'desc')
                ->get()
                ->map(function ($attendance) {
                    return [
                        'id' => $attendance->id,
                        'nama' => $attendance->participant->nama ?? 'Tidak Dikenal',
                        'nis_nip' => $attendance->participant->nis_nip ?? '-',
                        'keterangan' => $attendance->participant->keterangan ?? '-',
                        'waktu_hadir' => $attendance->waktu_hadir->format('d M Y H:i:s'),
                    ];
                });
        } else {
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
                'hadir' => $totalAttended,
                'belum' => $totalNotAttended,
            ],
            'attendances' => $attendances,
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

                // Header Kop Surat
                $sheet->mergeCells('A1:F1');
                $sheet->setCellValue('A1', 'BUKTI DAFTAR HADIR PESERTA ACARA');
                $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14)->getColor()->setRGB('166534');
                $sheet->getStyle('A1')->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);

                $sheet->mergeCells('A2:F2');
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
                $headers = ['No', 'Nama Lengkap', 'NIP', 'Keterangan', 'Waktu Presensi', 'Status'];
                $columns = ['A', 'B', 'C', 'D', 'E', 'F'];

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
                $sheet->getStyle('A9:F9')->applyFromArray($headerStyle);
                $sheet->getRowDimension(9)->setRowHeight(24);

                // Format column C (NIP) as Text
                $sheet->getStyle('C:C')->getNumberFormat()->setFormatCode('@');

                // Data Rows
                $row = 10;
                foreach ($attendances as $idx => $att) {
                    $sheet->setCellValue('A' . $row, $idx + 1);
                    $sheet->setCellValue('B' . $row, $att->participant->nama ?? 'Tidak Dikenal');
                    $sheet->setCellValueExplicit('C' . $row, $att->participant->nis_nip ?? '-', \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
                    $sheet->setCellValue('D' . $row, $att->participant->keterangan ?? '-');
                    $sheet->setCellValue('E' . $row, $att->waktu_hadir->format('d/m/Y H:i:s'));
                    $sheet->setCellValue('F' . $row, 'Hadir');

                    // Alignments
                    $sheet->getStyle('A' . $row)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
                    $sheet->getStyle('C' . $row)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
                    $sheet->getStyle('E' . $row)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
                    $sheet->getStyle('F' . $row)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);

                    $row++;
                }

                if ($attendances->isEmpty()) {
                    $sheet->mergeCells('A10:F10');
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
                $sheet->getStyle('A9:F' . ($row - 1))->applyFromArray($tableStyle);

                // Width dimensions
                $sheet->getColumnDimension('A')->setWidth(8);
                $sheet->getColumnDimension('B')->setWidth(32);
                $sheet->getColumnDimension('C')->setWidth(26);
                $sheet->getColumnDimension('D')->setWidth(24);
                $sheet->getColumnDimension('E')->setWidth(22);
                $sheet->getColumnDimension('F')->setWidth(14);

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
            fputcsv($handle, ['BUKTI DAFTAR HADIR PESERTA ACARA - SMA NEGERI 1 BABAT']);
            fputcsv($handle, ['Nama Acara', $event->nama_event]);
            fputcsv($handle, ['Tanggal', $event->created_at->format('d/m/Y')]);
            fputcsv($handle, ['Total Kehadiran', $totalAttended . ' dari ' . $totalParticipants . ' peserta']);
            fputcsv($handle, []);
            fputcsv($handle, ['No', 'Nama Lengkap', 'NIP', 'Keterangan', 'Waktu Presensi', 'Status']);

            foreach ($attendances as $idx => $att) {
                fputcsv($handle, [
                    $idx + 1,
                    $att->participant->nama ?? 'Tidak Dikenal',
                    $att->participant->nis_nip ?? '-',
                    $att->participant->keterangan ?? '-',
                    $att->waktu_hadir->format('d/m/Y H:i:s'),
                    'Hadir',
                ]);
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
        $verificationData = "DOKUMEN RESMI BUKTI DAFTAR HADIR\n"
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
