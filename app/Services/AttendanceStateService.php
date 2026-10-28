<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\Participant;
use App\Models\Workcode;

/**
 * Status presensi peserta saat ini (workcode aktif, catatan presensi, status tombol).
 * Dipakai bersama oleh GET /api/v1/workcodes/active (format lama) dan GET /api/v1/me/state.
 */
class AttendanceStateService
{
    public function __construct(private AttendanceValidationService $validationService) {}

    /**
     * @param  ?string  $deviceHash  hash ID instalasi aplikasi; bila HP ini sudah dipakai presensi akun lain
     *                               pada workcode ini, tombol Absen Datang ditutup sejak awal.
     * @return array{workcode: ?Workcode, attendance: ?Attendance, attendance_ui: array}
     */
    public function current(Participant $participant, ?string $deviceHash = null): array
    {
        $activeWorkcode = Workcode::getActive($participant);

        if (! $activeWorkcode) {
            return [
                'workcode' => null,
                'attendance' => null,
                'attendance_ui' => $this->validationService->attendanceUi(null, null, Workcode::getActive() !== null),
            ];
        }

        $attendanceQuery = Attendance::where('workcode_id', $activeWorkcode->id)
            ->where('participant_id', $participant->id);

        // Presensi harian hanya melihat catatan pada tanggal berjalan (kolom tanggal, bagian unique key;
        // created_at bisa berbeda, mis. presensi manual yang dibuat/diubah admin di hari lain).
        if ($activeWorkcode->kategori === 'harian') {
            $attendanceQuery->whereDate('tanggal', now()->toDateString());
        }

        $attendance = $attendanceQuery->first();
        $attendanceUi = $this->validationService->attendanceUi($activeWorkcode, $attendance);

        if ($attendanceUi['action'] === 'arrival' && $deviceHash !== null
            && $this->validationService->deviceUsedByOther($activeWorkcode, $deviceHash, $participant->id)) {
            $attendanceUi = $this->validationService->deviceUsedUi($activeWorkcode);
        }

        return [
            'workcode' => $activeWorkcode,
            'attendance' => $attendance,
            'attendance_ui' => $attendanceUi,
        ];
    }
}
