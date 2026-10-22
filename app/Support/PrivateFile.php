<?php

namespace App\Support;

use App\Models\Attendance;
use App\Models\LeaveRequest;
use App\Models\Participant;
use App\Models\PhotoChangeRequest;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
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
     * Masa berlaku URL dibulatkan ke blok ini, jadi URL file yang sama tetap identik selama satu
     * blok (berlaku TTL s.d. TTL + blok menit). Halaman yang memuat ulang data di latar belakang
     * (mis. Laporan tiap 20 detik) memakai gambar dari cache browser, tidak mengunduh ulang.
     */
    public const URL_BUCKET_MINUTES = 30;

    /**
     * Foto/tanda tangan presensi yang dibatasi masa simpan (config attendance.media_retention_days)
     * => kolom waktu penyimpanannya (urutan fallback).
     *
     * @var array<string, list<string>>
     */
    public const ATTENDANCE_MEDIA = [
        'attendance-face' => ['waktu_hadir', 'created_at'],
        'attendance-face-pulang' => ['waktu_pulang', 'updated_at'],
        'attendance-signature' => ['waktu_hadir', 'created_at'],
    ];

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
     * URL bertanda tangan untuk file milik model, atau null bila model tidak punya file atau
     * masa simpan foto/tanda tangan presensinya sudah habis.
     */
    public static function url(string $type, ?Model $model): ?string
    {
        [, $column] = self::TYPES[$type];

        if (! $model || ! $model->{$column} || self::isExpired($type, $model)) {
            return null;
        }

        $bucket = self::URL_BUCKET_MINUTES * 60;
        $expiresAt = Carbon::createFromTimestamp((intdiv(now()->timestamp, $bucket) + 1) * $bucket)
            ->addMinutes(self::TTL_MINUTES - self::URL_BUCKET_MINUTES);

        return URL::temporarySignedRoute('files.show', $expiresAt, [
            'type' => $type,
            'id' => $model->getKey(),
            // Berubah bila file diganti, agar cache browser tidak menampilkan file lama.
            'v' => substr(sha1($model->{$column}), 0, 10),
        ]);
    }

    /** Apakah foto/tanda tangan presensi sudah melewati masa simpan (jenis lain tidak pernah). */
    public static function isExpired(string $type, Model $model): bool
    {
        $storedAt = self::storedAt($type, $model);

        return $storedAt !== null
            && $storedAt->lt(now()->subDays(config('attendance.media_retention_days', 30)));
    }

    /** Waktu penyimpanan foto/tanda tangan presensi (null untuk jenis file tanpa masa simpan). */
    public static function storedAt(string $type, Model $model): ?Carbon
    {
        foreach (self::ATTENDANCE_MEDIA[$type] ?? [] as $column) {
            if ($model->{$column}) {
                return Carbon::parse($model->{$column});
            }
        }

        return null;
    }

    /**
     * Path file untuk jenis + id, atau null bila tidak ada atau masa simpannya habis.
     */
    public static function pathFor(string $type, int|string $id): ?string
    {
        if (! isset(self::TYPES[$type])) {
            return null;
        }

        [$modelClass, $column] = self::TYPES[$type];
        $model = $modelClass::query()->whereKey($id)->first();
        $path = $model?->{$column};

        return $path && self::isSafePath($path) && ! self::isExpired($type, $model) ? $path : null;
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
