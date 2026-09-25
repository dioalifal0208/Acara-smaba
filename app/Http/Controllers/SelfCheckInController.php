<?php

namespace App\Http\Controllers;

use App\Models\Participant;
use App\Models\Attendance;
use App\Models\Workcode;
use App\Services\QrCodeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SelfCheckInController extends Controller
{
    /**
     * Dapatkan atau generate token workcode hari ini.
     */
    private function getWorkcodeToken()
    {
        return Cache::remember('active_workcode_token', now()->endOfDay(), function () {
            return Str::random(16);
        });
    }

    /**
     * Tampilkan halaman Master QR Code untuk Admin.
     */
    public function masterQr(QrCodeService $qrCodeService)
    {
        $activeWorkcode = Workcode::getActive();
        $token = $this->getWorkcodeToken();
        
        // Buat URL check-in menggunakan host saat ini
        $checkInUrl = url("/self-checkin/{$token}");
        
        // Generate QR code SVG untuk URL tersebut dengan Logo Sekolah di tengahnya
        $qrCodeSvg = $qrCodeService->generateWithLogo($checkInUrl, 400);

        return Inertia::render('Admin/MasterQr', [
            'activeWorkcode' => $activeWorkcode,
            'checkInUrl' => $checkInUrl,
            'qrCodeSvg' => $qrCodeSvg,
            'token' => $token,
        ]);
    }

    /**
     * Regenerasi token workcode.
     */
    public function regenerateToken()
    {
        Cache::forget('active_workcode_token');
        return redirect()->route('admin.master-qr')
            ->with('success', 'Token workcode berhasil diregenerasi! URL absen telah diperbarui.');
    }

    /**
     * Tampilkan halaman form Self Check-In.
     */
    public function showForm($token)
    {
        $activeToken = $this->getWorkcodeToken();
        $activeWorkcode = Workcode::getActive();

        if ($token !== $activeToken) {
            abort(403, 'Tautan presensi tidak valid atau telah kadaluarsa.');
        }

        return Inertia::render('SelfCheckIn/Form', [
            'activeWorkcode' => $activeWorkcode,
            'token' => $token,
        ]);
    }

    /**
     * Tampilkan halaman form Face Check-In.
     */
    public function showFaceForm($token)
    {
        $activeToken = $this->getWorkcodeToken();
        $activeWorkcode = Workcode::getActive();

        if ($token !== $activeToken) {
            abort(403, 'Tautan presensi tidak valid atau telah kadaluarsa.');
        }

        return Inertia::render('SelfCheckIn/FaceForm', [
            'activeWorkcode' => $activeWorkcode,
            'token' => $token,
        ]);
    }



    /**
     * Proses input NIS/NIP untuk absen mandiri per Workcode.
     */
    public function submitForm(Request $request, $token, \App\Services\AttendanceValidationService $validationService)
    {
        $activeToken = $this->getWorkcodeToken();

        if ($token !== $activeToken) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tautan presensi telah kadaluarsa atau tidak valid.',
            ], 403);
        }

        $activeWorkcode = Workcode::getActive();

        try {
            $validationService->validateWorkcodeActive($activeWorkcode);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->validator->errors()->first(),
            ], $e->status);
        }

        $request->validate([
            'participant_id' => 'nullable|integer|exists:participants,id',
            'nis_nip' => 'required_without:participant_id|nullable|string|max:50',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'accuracy' => 'nullable|numeric',
            'altitude' => 'nullable|numeric',
            'device_timestamp' => 'nullable|numeric',
            'device_id' => 'nullable|string|max:255',
        ]);

        $deviceHash = $validationService->generateDeviceHash($request->input('device_id'), $request->userAgent());
        $ipAddress = $request->ip();

        try {
            $validationService->validateDeviceLock($activeWorkcode, $deviceHash);
            $validationService->validateGpsAndRadius($activeWorkcode, $request->only(['latitude', 'longitude', 'accuracy', 'device_timestamp']));
        } catch (\Exception $e) {
            $errorData = json_decode($e->getMessage(), true);
            if ($errorData && isset($errorData['status'])) {
                return response()->json($errorData, $e->getCode());
            }
            throw $e;
        }

        $participant = $request->filled('participant_id')
            ? Participant::find($request->integer('participant_id'))
            : Participant::where('nis_nip', trim($request->input('nis_nip')))->first();

        if (!$participant) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data peserta tidak terdaftar. Hubungi panitia.',
            ], 404);
        }

        if ($validationService->checkAlreadyAttended($activeWorkcode, $participant)) {
            return response()->json([
                'status' => 'already',
                'message' => 'Anda sudah melakukan presensi untuk workcode "' . $activeWorkcode->nama_workcode . '".',
                'participant' => $participant,
            ]);
        }

        // Catat kehadiran untuk workcode aktif (beserta device_hash & IP untuk lock)
        $attendance = Attendance::create([
            'workcode_id' => $activeWorkcode->id,
            'participant_id' => $participant->id,
            'waktu_hadir' => now(),
            'device_hash' => $deviceHash,
            'ip_address' => $ipAddress,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Presensi berhasil dicatat untuk workcode "' . $activeWorkcode->nama_workcode . '"!',
            'participant' => $participant,
            'timestamp' => $attendance->waktu_hadir->format('H:i:s'),
        ]);
    }
}
