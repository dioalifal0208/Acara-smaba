<?php

namespace App\Console\Commands;

use App\Models\Attendance;
use App\Support\PrivateFile;
use Illuminate\Console\Command;

class PruneAttendanceMedia extends Command
{
    protected $signature = 'attendance:prune-media';

    protected $description = 'Hapus foto wajah & tanda tangan presensi yang melewati masa simpan (attendance.media_retention_days)';

    /** Kolom file per jenis (lihat PrivateFile::TYPES / ATTENDANCE_MEDIA). */
    private const COLUMNS = [
        'attendance-face' => 'face_capture_path',
        'attendance-face-pulang' => 'face_capture_pulang_path',
        'attendance-signature' => 'signature_path',
    ];

    public function handle(): int
    {
        $days = config('attendance.media_retention_days', 30);
        $cutoff = now()->subDays($days);
        $deleted = 0;

        foreach (self::COLUMNS as $type => $column) {
            // Waktu simpan = kolom pertama yang terisi (mis. waktu_hadir, lalu created_at).
            [$primary, $fallback] = PrivateFile::ATTENDANCE_MEDIA[$type];

            Attendance::query()
                ->whereNotNull($column)
                ->whereRaw("COALESCE({$primary}, {$fallback}) < ?", [$cutoff])
                ->select(['id', $column])
                ->chunkById(200, function ($attendances) use ($column, &$deleted) {
                    $paths = $attendances->pluck($column)->filter(fn (string $path) => PrivateFile::isSafePath($path));
                    PrivateFile::disk()->delete($paths->all());

                    // Tanpa event model/updated_at: ini pembersihan, bukan perubahan presensi.
                    Attendance::query()->whereKey($attendances->modelKeys())->toBase()->update([$column => null]);
                    $deleted += $attendances->count();
                });
        }

        $this->info("Foto/tanda tangan presensi lebih dari {$days} hari dihapus: {$deleted} file.");

        return self::SUCCESS;
    }
}
