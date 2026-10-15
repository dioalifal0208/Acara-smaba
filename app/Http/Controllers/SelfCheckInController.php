<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Participant;
use App\Models\Workcode;
use App\Services\AttendanceValidationService;
use App\Services\QrCodeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class SelfCheckInController extends Controller
{
    /**
     * Dapatkan atau generate token workcode hari ini.
     */
    private function getWorkcodeToken()
    {
        return Cache::remember('active_workcode_token', now()->endOfDay(), function () {
            return Str::random(32); // berganti otomatis tiap hari (cache s.d. akhir hari)
        });
    }

    /**
     * Tampilkan halaman Master QR Code untuk Admin.
     */
    public function masterQr(Request $request, QrCodeService $qrCodeService)
    {
        $activeWorkcodes = Workcode::getActiveWorkcodes();
        if ($activeWorkcodes->count() > 1 && ! $request->filled('workcode_id')) {
            return Inertia::render('Admin/WorkcodeQrSelection', [
                'activeWorkcodes' => $activeWorkcodes,
            ]);
        }

        $activeWorkcode = $request->filled('workcode_id')
            ? $activeWorkcodes->firstWhere('id', $request->integer('workcode_id'))
            : $activeWorkcodes->first();

        if ($request->filled('workcode_id') && ! $activeWorkcode) {
            abort(404, 'Workcode tidak sedang aktif.');
        }
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
            'activeWorkcodes' => $activeWorkcodes,
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

        if (! hash_equals($activeToken, (string) $token)) {
            abort(403, 'Tautan presensi tidak valid atau telah kadaluarsa.');
        }

        return Inertia::render('SelfCheckIn/Form', [
            'activeWorkcode' => $activeWorkcode,
            'token' => $token,
        ]);
    }

    /**
     * Cari peserta yang belum melakukan presensi pada Workcode aktif.
     */
    public function searchParticipants(Request $request, string $token)
    {
        if (! hash_equals($this->getWorkcodeToken(), $token)) {
            return response()->json([
                'message' => 'Tautan presensi telah kadaluarsa atau tidak valid.',
            ], 403);
        }

        $query = trim((string) $request->query('query', ''));
        $activeWorkcodes = Workcode::getActiveWorkcodes();

        // Nama minimal 3 huruf; NIS/NIP hanya cocok bila diketik lengkap (bukan awalan),
        // agar endpoint publik ini tidak bisa dipakai menebak/mendaftar nomor peserta.
        if (mb_strlen($query) < 3 || $activeWorkcodes->isEmpty()) {
            return response()->json([]);
        }

        $participants = Participant::query()
            ->where(function ($participantQuery) use ($query) {
                $participantQuery->where('nis_nip', $query)
                    ->orWhere('nama', 'like', '%'.$query.'%');
            })
            ->limit(30)
            ->get(['id', 'nama', 'nis_nip', 'status'])
            ->map(function (Participant $participant) use ($activeWorkcodes) {
                $availableWorkcodes = $activeWorkcodes
                    ->filter(fn (Workcode $workcode) => $workcode->isAvailableFor($participant))
                    ->filter(fn (Workcode $workcode) => ! $participant->attendances()->where('workcode_id', $workcode->id)->exists())
                    ->values()
                    ->map(fn (Workcode $workcode) => [
                        'workcode_id' => $workcode->id,
                        'nama_workcode' => $workcode->nama_workcode,
                        'kategori' => $workcode->kategori,
                    ]);

                $participant->setAttribute('available_workcodes', $availableWorkcodes);

                return $participant;
            })
            ->filter(fn (Participant $participant) => $participant->available_workcodes->isNotEmpty())
            ->take(5)
            ->map(fn (Participant $participant) => [
                ...$participant->toPublicArray(),
                'available_workcodes' => $participant->available_workcodes,
            ])
            ->values();

        return response()->json($participants);
    }

    /**
     * Proses input NIS/NIP untuk absen mandiri per Workcode.
     */
    public function submitForm(Request $request, $token, AttendanceValidationService $validationService)
    {
        $activeToken = $this->getWorkcodeToken();

        if (! hash_equals($activeToken, (string) $token)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tautan presensi telah kadaluarsa atau tidak valid.',
            ], 403);
        }

        $activeWorkcode = Workcode::getActive();
        try {
            $validationService->validateWorkcodeActive($activeWorkcode);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->validator->errors()->first(),
            ], $e->status);
        }

        $request->validate([
            'participant_id' => 'nullable|integer|exists:participants,id',
            'workcode_id' => 'nullable|integer|exists:workcodes,id',
            'nis_nip' => 'required_without:participant_id|nullable|string|max:50',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'accuracy' => 'nullable|numeric',
            'altitude' => 'nullable|numeric',
            'device_timestamp' => 'nullable|numeric',
            'device_id' => 'nullable|string|max:255',
            'signature' => ['required', 'string', 'max:1500000', 'regex:/^data:image\/png;base64,/'],
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

        if (! $participant) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data peserta tidak terdaftar. Hubungi panitia.',
            ], 404);
        }

        $availableWorkcodes = Workcode::getActiveWorkcodes($participant);
        $activeWorkcode = $request->filled('workcode_id')
            ? $availableWorkcodes->firstWhere('id', $request->integer('workcode_id'))
            : ($availableWorkcodes->count() === 1 ? $availableWorkcodes->first() : null);

        if (! $activeWorkcode) {
            return response()->json([
                'status' => 'error',
                'message' => $availableWorkcodes->isEmpty()
                    ? 'Tidak ada workcode aktif yang tersedia untuk peserta ini.'
                    : 'Pilih workcode presensi terlebih dahulu.',
            ], 422);
        }

        try {
            $validationService->validateWorkcodeActive($activeWorkcode);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->validator->errors()->first(),
            ], $e->status);
        }

        if ($validationService->checkAlreadyAttended($activeWorkcode, $participant)) {
            return response()->json([
                'status' => 'already',
                'message' => 'Anda sudah melakukan presensi untuk workcode "'.$activeWorkcode->nama_workcode.'".',
                'participant' => $participant->toPublicArray(),
            ]);
        }

        $signaturePath = $this->storeSignature($request->string('signature')->toString());

        // Catat kehadiran untuk workcode aktif (beserta device_hash, IP, dan tanda tangan)
        try {
            $attendance = Attendance::create([
                'workcode_id' => $activeWorkcode->id,
                'participant_id' => $participant->id,
                'tanggal' => now()->toDateString(),
                'waktu_hadir' => now(),
                'device_hash' => $deviceHash,
                'ip_address' => $ipAddress,
                'signature_path' => $signaturePath,
                'attendance_method' => 'tanda_tangan',
            ]);
        } catch (\Throwable $exception) {
            Storage::disk('private')->delete($signaturePath);

            throw $exception;
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Presensi berhasil dicatat untuk workcode "'.$activeWorkcode->nama_workcode.'"!',
            'participant' => $participant->toPublicArray(),
            'timestamp' => $attendance->waktu_hadir->format('H:i:s'),
        ]);
    }

    private function storeSignature(string $dataUrl): string
    {
        $signature = base64_decode(Str::after($dataUrl, ','), true);

        if ($signature === false || strlen($signature) < 50) {
            throw ValidationException::withMessages([
                'signature' => 'Tanda tangan tidak valid. Silakan hapus dan tanda tangani kembali.',
            ]);
        }

        $path = 'attendance-signatures/'.Str::uuid().'.png';

        if (! Storage::disk('private')->put($path, $signature)) {
            throw ValidationException::withMessages([
                'signature' => 'Tanda tangan gagal disimpan. Silakan coba kembali.',
            ]);
        }

        return $path;
    }
}
