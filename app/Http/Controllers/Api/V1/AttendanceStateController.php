<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\WorkcodeResource;
use App\Services\AttendanceStateService;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;

/**
 * GET /api/v1/me/state: satu status gabungan untuk aplikasi Android (workcode aktif, presensi hari
 * ini, status tombol, status wajah). Aplikasi memuat ulang endpoint ini saat dibuka/kembali ke depan
 * dan setiap kali menerima pesan FCM; ETag/If-None-Match membuat pemuatan ulang tanpa perubahan murah (304).
 */
class AttendanceStateController extends Controller
{
    public function show(Request $request, AttendanceStateService $stateService)
    {
        $user = $request->user();
        // Jangan gunakan relasi peserta yang mungkin sudah termuat dari request/proses sebelumnya.
        // State dan ETag harus selalu mencerminkan perubahan terbaru (mis. persetujuan wajah).
        $user->load('participant');

        if (! $user->tokenCan('role:participant') || $user->role !== 'participant' || ! $user->participant_id || ! $user->participant) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses ditolak. Endpoint ini khusus untuk peserta.',
            ], 403);
        }

        $participant = $user->participant;
        // ID instalasi aplikasi (sama dengan installation_id saat presensi) agar status tombol ikut
        // memperhitungkan HP yang sudah dipakai presensi akun lain.
        $installationId = trim((string) $request->header('X-Installation-Id'));
        $deviceHash = $installationId !== '' && strlen($installationId) <= 128 ? hash('sha256', $installationId) : null;
        $state = $stateService->current($participant, $deviceHash);
        $attendance = $state['attendance'];

        $data = [
            'workcode_aktif' => $state['workcode'] ? (new WorkcodeResource($state['workcode']))->resolve($request) : null,
            'presensi_hari_ini' => $attendance ? [
                'waktu_hadir' => $attendance->waktu_hadir?->toIso8601String(),
                'waktu_pulang' => $attendance->waktu_pulang?->toIso8601String(),
            ] : null,
            'attendance_ui' => $state['attendance_ui'],
            'face' => $participant->faceState(),
        ];

        $version = self::stateVersion($data);
        $etag = '"'.$version.'"';

        if ($this->etagMatches($request, $version)) {
            return response('', 304)->header('ETag', $etag);
        }

        return response()->json([
            'status' => 'success',
            'data' => ['server_time' => now()->toIso8601String(), 'state_version' => $version] + $data,
        ])->header('ETag', $etag);
    }

    /**
     * Versi status: sha1 data tanpa nilai yang berubah tiap detik (server_time, sisa detik kunci wajah),
     * sehingga versi hanya berubah bila ada perubahan yang berarti bagi tampilan.
     */
    public static function stateVersion(array $data): string
    {
        Arr::forget($data, ['server_time', 'attendance_ui.server_time', 'face.retry_after_seconds']);

        return sha1(json_encode($data));
    }

    private function etagMatches(Request $request, string $version): bool
    {
        $header = $request->header('If-None-Match');
        if (! $header) {
            return false;
        }

        foreach (explode(',', $header) as $candidate) {
            $candidate = trim(preg_replace('/^W\//', '', trim($candidate)), '"');
            if ($candidate === $version || $candidate === '*') {
                return true;
            }
        }

        return false;
    }
}
