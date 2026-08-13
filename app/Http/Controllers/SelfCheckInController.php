<?php

namespace App\Http\Controllers;

use App\Models\Participant;
use App\Models\Attendance;
use App\Models\Event;
use App\Services\QrCodeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SelfCheckInController extends Controller
{
    /**
     * Dapatkan atau generate token event hari ini.
     */
    private function getEventToken()
    {
        return Cache::remember('active_event_token', now()->endOfDay(), function () {
            return Str::random(16);
        });
    }

    /**
     * Tampilkan halaman Master QR Code untuk Admin.
     */
    public function masterQr(QrCodeService $qrCodeService)
    {
        $activeEvent = Event::getActive();
        $token = $this->getEventToken();
        
        // Buat URL check-in menggunakan host saat ini
        $checkInUrl = url("/self-checkin/{$token}");
        
        // Generate QR code SVG untuk URL tersebut
        $qrCodeSvg = $qrCodeService->generate($checkInUrl, 400);

        return Inertia::render('Admin/MasterQr', [
            'activeEvent' => $activeEvent,
            'checkInUrl' => $checkInUrl,
            'qrCodeSvg' => $qrCodeSvg,
            'token' => $token,
        ]);
    }

    /**
     * Regenerasi token event.
     */
    public function regenerateToken()
    {
        Cache::forget('active_event_token');
        return redirect()->route('admin.master-qr')
            ->with('success', 'Token event berhasil diregenerasi! URL absen telah diperbarui.');
    }

    /**
     * Tampilkan halaman form Self Check-In.
     */
    public function showForm($token)
    {
        $activeToken = $this->getEventToken();
        $activeEvent = Event::getActive();

        if ($token !== $activeToken) {
            abort(403, 'Tautan presensi tidak valid atau telah kadaluarsa.');
        }

        return Inertia::render('SelfCheckIn/Form', [
            'activeEvent' => $activeEvent,
            'token' => $token,
        ]);
    }

    /**
     * Proses input NIS/NIP untuk absen mandiri per Event.
     */
    public function submitForm(Request $request, $token)
    {
        $activeToken = $this->getEventToken();

        if ($token !== $activeToken) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tautan presensi telah kadaluarsa atau tidak valid.',
            ], 403);
        }

        $activeEvent = Event::getActive();

        if (!$activeEvent) {
            return response()->json([
                'status' => 'error',
                'message' => 'Belum ada Event yang aktif. Presensi mandiri saat ini ditutup.',
            ], 400);
        }

        $request->validate([
            'nis_nip' => 'required|string|max:50',
        ]);

        $nisNip = trim($request->input('nis_nip'));

        // Cari peserta berdasarkan NIS/NIP
        $participant = Participant::where('nis_nip', $nisNip)->first();

        if (!$participant) {
            return response()->json([
                'status' => 'error',
                'message' => 'NIS/NIP tidak terdaftar. Hubungi panitia.',
            ], 404);
        }

        // Cek apakah sudah absen pada event aktif ini
        $alreadyAttended = Attendance::where('event_id', $activeEvent->id)
            ->where('participant_id', $participant->id)
            ->exists();

        if ($alreadyAttended) {
            return response()->json([
                'status' => 'already',
                'message' => 'Anda sudah melakukan presensi untuk event "' . $activeEvent->nama_event . '".',
                'participant' => $participant,
            ]);
        }

        // Catat kehadiran untuk event aktif
        $attendance = Attendance::create([
            'event_id' => $activeEvent->id,
            'participant_id' => $participant->id,
            'waktu_hadir' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Presensi berhasil dicatat untuk event "' . $activeEvent->nama_event . '"!',
            'participant' => $participant,
            'timestamp' => $attendance->waktu_hadir->format('H:i:s'),
        ]);
    }
}
