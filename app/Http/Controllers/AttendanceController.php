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
}
