<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Participant;
use App\Models\Workcode;
use App\Services\AttendanceValidationService;
use App\Services\QrCodeService;
use App\Services\SelfCheckInTokenService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class SelfCheckInController extends Controller
{
    /** Penjelasan untuk tiap alasan QR/tautan presensi tidak dapat dipakai. */
    private const CLOSED_MESSAGES = [
        'invalid' => 'Tautan presensi tidak valid atau telah kadaluarsa.',
        'ended' => 'Sesi presensi workcode ini telah berakhir.',
        'not_started' => 'Sesi presensi workcode ini belum dimulai.',
        'inactive' => 'Presensi workcode ini sedang dinonaktifkan sementara oleh panitia.',
        'closed_by_selection' => 'Presensi workcode ini ditutup karena ada workcode aktif lain yang pesertanya sudah dipilih.',
        'harian' => 'QR presensi mandiri hanya untuk workcode acara. Presensi Work From Office dilakukan lewat aplikasi PRESENSI SMABA, atau tunjukkan QR pribadi Anda kepada petugas scanner.',
    ];

    /** Alasan yang bersifat sementara: halaman informasi memeriksa ulang dan kembali ke form bila workcode aktif lagi. */
    private const TEMPORARY_REASONS = ['inactive', 'not_started', 'closed_by_selection'];

    /**
     * Tampilkan halaman Master QR Code untuk Admin: satu QR untuk tiap workcode aktif.
     */
    public function masterQr(QrCodeService $qrCodeService, SelfCheckInTokenService $tokens)
    {
        $activeWorkcodes = Workcode::getActiveWorkcodes();

        $workcodeQrs = $activeWorkcodes->map(function (Workcode $workcode) use ($activeWorkcodes, $qrCodeService, $tokens) {
            $item = [
                'workcode' => $workcode->only(['id', 'nama_workcode', 'kategori', 'tanggal', 'jam_aktif_mulai', 'jam_aktif_selesai', 'participants_count']),
                // Presensi harian memakai QR pribadi/aplikasi; workcode terbuka ditutup saat ada workcode aktif berpeserta.
                'unavailable_reason' => $this->closedReason($workcode, $activeWorkcodes),
                'checkInUrl' => null,
                'qrCodeSvg' => null,
            ];

            if ($item['unavailable_reason'] === null) {
                $item['checkInUrl'] = url('/self-checkin/'.$tokens->tokenFor($workcode));
                $item['qrCodeSvg'] = $qrCodeService->generateWithLogo($item['checkInUrl'], 400);
            }

            return $item;
        })->values();

        return Inertia::render('Admin/MasterQr', [
            'workcodeQrs' => $workcodeQrs,
            'upcomingWorkcodes' => $this->upcomingWorkcodes(),
            'nextChangeAt' => $this->nextScheduleChange()?->toIso8601String(),
            'serverTime' => now()->toIso8601String(),
        ]);
    }

    /**
     * Regenerasi token URL satu workcode (atau semua workcode aktif bila tidak dipilih).
     */
    public function regenerateToken(Request $request, SelfCheckInTokenService $tokens)
    {
        $request->validate(['workcode_id' => 'nullable|integer|exists:workcodes,id']);

        $workcodes = $request->filled('workcode_id')
            ? Workcode::whereKey($request->integer('workcode_id'))->get()
            : Workcode::getActiveWorkcodes();

        $workcodes->each(fn (Workcode $workcode) => $tokens->regenerate($workcode));

        return redirect()->route('admin.master-qr')
            ->with('success', 'Token workcode berhasil diregenerasi! URL absen telah diperbarui.');
    }

    /**
     * Tampilkan form Self Check-In, atau halaman informasi bila QR/tautan sedang tidak dapat dipakai.
     */
    public function showForm(Request $request, $token, SelfCheckInTokenService $tokens)
    {
        $workcode = $tokens->resolve((string) $token);
        $activeWorkcodes = Workcode::getActiveWorkcodes();
        $reason = $workcode ? $this->closedReason($workcode, $activeWorkcodes) : 'invalid';

        if ($reason !== null) {
            return $this->closedPage($request, $reason, $workcode, $activeWorkcodes);
        }

        return Inertia::render('SelfCheckIn/Form', [
            'activeWorkcode' => $activeWorkcodes->firstWhere('id', $workcode->id),
            'token' => $token,
        ]);
    }

    /**
     * Cari peserta yang belum melakukan presensi pada workcode milik QR ini.
     */
    public function searchParticipants(Request $request, string $token, SelfCheckInTokenService $tokens)
    {
        $workcode = $tokens->resolve($token);

        if (! $workcode) {
            return response()->json([
                'message' => self::CLOSED_MESSAGES['invalid'],
            ], 403);
        }

        $activeWorkcodes = Workcode::getActiveWorkcodes();
        if ($reason = $this->closedReason($workcode, $activeWorkcodes)) {
            return $this->closedJson($reason);
        }

        $query = trim((string) $request->query('query', ''));
        $workcode = $activeWorkcodes->firstWhere('id', $workcode->id);

        // Nama minimal 3 huruf; NIS/NIP hanya cocok bila diketik lengkap (bukan awalan),
        // agar endpoint publik ini tidak bisa dipakai menebak/mendaftar nomor peserta.
        if (mb_strlen($query) < 3) {
            return response()->json([]);
        }

        $workcodeOption = [
            'workcode_id' => $workcode->id,
            'nama_workcode' => $workcode->nama_workcode,
            'kategori' => $workcode->kategori,
        ];

        $participants = Participant::query()
            ->where(function ($participantQuery) use ($query) {
                $participantQuery->where('nis_nip', $query)
                    ->orWhere('nama', 'like', '%'.$query.'%');
            })
            ->when($workcode->participants_count > 0, fn ($participantQuery) => $participantQuery
                ->whereHas('workcodes', fn ($assigned) => $assigned->whereKey($workcode->id)))
            ->whereDoesntHave('attendances', fn ($attendance) => $attendance->where('workcode_id', $workcode->id))
            ->limit(5)
            ->get(['id', 'nama', 'nis_nip', 'status'])
            ->map(fn (Participant $participant) => [
                ...$participant->toPublicArray(),
                'available_workcodes' => [$workcodeOption],
            ])
            ->values();

        return response()->json($participants);
    }

    /**
     * Proses input NIS/NIP untuk absen mandiri per Workcode.
     */
    public function submitForm(Request $request, $token, AttendanceValidationService $validationService, SelfCheckInTokenService $tokens)
    {
        $activeWorkcode = $tokens->resolve((string) $token);

        if (! $activeWorkcode) {
            return response()->json([
                'status' => 'error',
                'message' => self::CLOSED_MESSAGES['invalid'],
            ], 403);
        }

        // Token hanya berlaku selama workcode-nya aktif; di luar itu dinonaktifkan sementara.
        $reason = $this->closedReason($activeWorkcode, Workcode::getActiveWorkcodes());
        if ($reason === 'harian') {
            return response()->json([
                'status' => 'error',
                'message' => self::CLOSED_MESSAGES['harian'],
            ], 403);
        }
        if ($reason !== null) {
            return $this->closedJson($reason);
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

        // QR menentukan workcode; peserta hanya boleh presensi bila workcode itu tersedia untuknya.
        if (! Workcode::getActiveWorkcodes($participant)->contains('id', $activeWorkcode->id)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda tidak terdaftar sebagai peserta workcode "'.$activeWorkcode->nama_workcode.'".',
            ], 403);
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
            $attendance = Attendance::createOrReplaceAutomatic([
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

    /**
     * Alasan QR workcode tidak dapat dipakai saat ini, atau null bila dapat dipakai.
     * $activeWorkcodes = Workcode::getActiveWorkcodes() (memuat participants_count).
     */
    private function closedReason(Workcode $workcode, Collection $activeWorkcodes): ?string
    {
        if ($workcode->kategori === 'harian') {
            return 'harian';
        }

        $active = $activeWorkcodes->firstWhere('id', $workcode->id);

        if (! $active) {
            $startsAt = $workcode->activeWindowStartsAt();

            if (! $startsAt) {
                return 'inactive';
            }

            return now()->lessThan($startsAt) ? 'not_started' : 'ended';
        }

        return $active->isClosedAmong($activeWorkcodes) ? 'closed_by_selection' : null;
    }

    /**
     * Halaman informasi untuk QR/tautan yang kadaluarsa, berakhir, atau ditutup sementara.
     * Hanya data umum workcode yang ditampilkan (tanpa koordinat/radius).
     */
    private function closedPage(Request $request, string $reason, ?Workcode $workcode, Collection $activeWorkcodes)
    {
        $otherActive = $activeWorkcodes->contains(fn (Workcode $active) => $active->kategori !== 'harian'
            && $active->id !== $workcode?->id
            && ! $active->isClosedAmong($activeWorkcodes));

        $response = Inertia::render('SelfCheckIn/Closed', [
            'reason' => $reason,
            'message' => self::CLOSED_MESSAGES[$reason],
            'temporary' => in_array($reason, self::TEMPORARY_REASONS, true),
            'workcode' => $workcode ? [
                'id' => $workcode->id,
                'nama_workcode' => $workcode->nama_workcode,
                'starts_at' => $workcode->activeWindowStartsAt()?->toIso8601String(),
                'tanggal' => $workcode->tanggal,
                'jam_aktif_mulai' => $workcode->jam_aktif_mulai,
                'jam_aktif_selesai' => $workcode->jam_aktif_selesai,
            ] : null,
            'hasOtherActiveWorkcode' => $otherActive,
            'serverTime' => now()->toIso8601String(),
        ])->toResponse($request);

        // Tautan yang sudah tidak berlaku lagi: 410 Gone. Penutupan sementara tetap 200.
        return in_array($reason, ['invalid', 'ended'], true)
            ? $response->setStatusCode(410)
            : $response;
    }

    private function closedJson(string $reason)
    {
        return response()->json([
            'status' => 'closed',
            'reason' => $reason,
            'message' => self::CLOSED_MESSAGES[$reason],
        ], 410);
    }

    /** Kegiatan terjadwal hari ini yang belum dimulai, untuk ditampilkan di Master QR. */
    private function upcomingWorkcodes(): Collection
    {
        $now = now();

        return $this->scheduledToday()
            ->filter(fn (Workcode $workcode) => $workcode->activeWindowStartsAt()->greaterThan($now))
            ->sortBy(fn (Workcode $workcode) => $workcode->activeWindowStartsAt()->getTimestamp())
            ->map(fn (Workcode $workcode) => [
                'id' => $workcode->id,
                'nama_workcode' => $workcode->nama_workcode,
                'starts_at' => $workcode->activeWindowStartsAt()->toIso8601String(),
                'jam_aktif_mulai' => $workcode->jam_aktif_mulai,
                'jam_aktif_selesai' => $workcode->jam_aktif_selesai,
            ])
            ->values();
    }

    /**
     * Waktu terdekat sebuah workcode terjadwal hari ini mulai/selesai (atau pergantian hari),
     * agar halaman Master QR bisa memuat ulang tepat saat workcode aktif berganti.
     */
    private function nextScheduleChange(): ?Carbon
    {
        $now = now();

        return $this->scheduledToday()
            ->flatMap(fn (Workcode $workcode) => [$workcode->activeWindowStartsAt(), $workcode->activeWindowEndsAt()])
            ->push($now->copy()->addDay()->startOfDay())
            ->filter(fn (Carbon $moment) => $moment->greaterThan($now))
            ->sortBy(fn (Carbon $moment) => $moment->getTimestamp())
            ->first();
    }

    private function scheduledToday(): Collection
    {
        return Workcode::query()
            ->where('kategori', 'workcode')
            ->whereDate('tanggal', now()->toDateString())
            ->whereNotNull('jam_aktif_mulai')
            ->whereNotNull('jam_aktif_selesai')
            ->get(['id', 'nama_workcode', 'kategori', 'tanggal', 'jam_aktif_mulai', 'jam_aktif_selesai']);
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
