<?php

namespace App\Support;

use App\Models\Attendance;
use App\Models\LeaveRequest;
use App\Models\Participant;
use App\Models\PhotoChangeRequest;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

/**
 * File pribadi peserta di disk `private`, disajikan hanya lewat URL bertanda tangan sementara.
 *
 * URL dibuat server HANYA di konteks yang sudah berhak (admin, atau pemilik data), jadi tanda
 * tangan sekaligus menjadi bukti izin akses. Satu URL hanya membuka satu file tertentu dan
 * kedaluwarsa setelah TTL. Cara ini juga kompatibel dengan aplikasi Android: library gambar
 * cukup memuat URL tanpa perlu header Authorization.
 */
final class PrivateFile
{
    public const DISK = 'private';

    public const TTL_MINUTES = 60;

    /**
     * Jenis file => [kelas model, kolom path].
     *
     * @var array<string, array{0: class-string<Model>, 1: string}>
     */
    public const TYPES = [
        'participant-photo' => [Participant::class, 'photo_path'],
        'photo-change-request' => [PhotoChangeRequest::class, 'photo_path'],
        'leave-document' => [LeaveRequest::class, 'bukti_path'],
        'attendance-face' => [Attendance::class, 'face_capture_path'],
        'attendance-face-pulang' => [Attendance::class, 'face_capture_pulang_path'],
        'attendance-signature' => [Attendance::class, 'signature_path'],
    ];

    /** Folder di disk `public` lama yang berisi data pribadi (dipindah oleh files:migrate-private). */
    public const LEGACY_PUBLIC_DIRECTORIES = [
        'faces',
        'photo-change-requests',
        'dokumen_izin',
        'attendance-face-captures',
        'attendance-signatures',
    ];

    public static function disk(): Filesystem
    {
        return Storage::disk(self::DISK);
    }

    /**
     * URL bertanda tangan untuk file milik model, atau null bila model tidak punya file.
     */
    public static function url(string $type, ?Model $model): ?string
    {
        [, $column] = self::TYPES[$type];

        if (! $model || ! $model->{$column}) {
            return null;
        }

        return URL::temporarySignedRoute(
            'files.show',
            now()->addMinutes(self::TTL_MINUTES),
            ['type' => $type, 'id' => $model->getKey()],
        );
    }

    /**
     * Path file untuk jenis + id, atau null bila tidak ada.
     */
    public static function pathFor(string $type, int|string $id): ?string
    {
        if (! isset(self::TYPES[$type])) {
            return null;
        }

        [$modelClass, $column] = self::TYPES[$type];
        $path = $modelClass::query()->whereKey($id)->value($column);

        return $path && self::isSafePath($path) ? $path : null;
    }

    /**
     * Semua file pribadi milik peserta (foto wajah, foto kandidat, foto presensi, tanda tangan,
     * dokumen izin). Dipakai saat peserta dihapus, karena baris turunannya ikut terhapus lewat
     * cascade database tanpa memicu event model.
     *
     * @return list<string>
     */
    public static function pathsOwnedByParticipant(int $participantId): array
    {
        return self::collect([
            Participant::query()->whereKey($participantId)->pluck('photo_path'),
            PhotoChangeRequest::query()->where('participant_id', $participantId)->pluck('photo_path'),
            Attendance::query()->where('participant_id', $participantId)->pluck('face_capture_path'),
            Attendance::query()->where('participant_id', $participantId)->pluck('face_capture_pulang_path'),
            Attendance::query()->where('participant_id', $participantId)->pluck('signature_path'),
            LeaveRequest::query()->where('participant_id', $participantId)->pluck('bukti_path'),
        ]);
    }

    /**
     * Semua file pribadi yang terikat ke workcode (foto presensi, tanda tangan, dokumen izin).
     *
     * @return list<string>
     */
    public static function pathsOwnedByWorkcode(int $workcodeId): array
    {
        return self::collect([
            Attendance::query()->where('workcode_id', $workcodeId)->pluck('face_capture_path'),
            Attendance::query()->where('workcode_id', $workcodeId)->pluck('face_capture_pulang_path'),
            Attendance::query()->where('workcode_id', $workcodeId)->pluck('signature_path'),
            LeaveRequest::query()->where('workcode_id', $workcodeId)->pluck('bukti_path'),
        ]);
    }

    /**
     * @param  iterable<Collection<int, string|null>>  $groups
     * @return list<string>
     */
    private static function collect(iterable $groups): array
    {
        return collect($groups)->flatten()->filter()->unique()
            ->filter(fn (string $path) => self::isSafePath($path))
            ->values()->all();
    }

    /** Tolak path traversal, path absolut, dan null byte. */
    public static function isSafePath(string $path): bool
    {
        return $path !== ''
            && ! str_contains($path, '..')
            && ! str_contains($path, "\0")
            && ! str_starts_with($path, '/')
            && ! str_contains($path, '\\')
            && ! preg_match('/^[a-zA-Z]:/', $path);
    }
}
