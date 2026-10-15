<?php

namespace App\Console\Commands;

use App\Support\PrivateFile;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class MigratePrivateFiles extends Command
{
    /**
     * Pindahkan data pribadi peserta dari disk `public` (disajikan langsung oleh web server)
     * ke disk `private`. Path relatif tidak berubah, jadi database tidak perlu diubah.
     *
     *   php artisan files:migrate-private            # simulasi (tidak mengubah apa pun)
     *   php artisan files:migrate-private --execute  # jalankan
     */
    protected $signature = 'files:migrate-private {--execute : Benar-benar memindahkan file (default hanya simulasi)}';

    protected $description = 'Pindahkan foto wajah, foto presensi, tanda tangan, dan dokumen izin dari disk publik ke disk privat.';

    public function handle(): int
    {
        $public = Storage::disk('public');
        $private = PrivateFile::disk();
        $execute = (bool) $this->option('execute');

        $this->info($execute ? 'Memindahkan file ke disk privat...' : 'SIMULASI: tidak ada file yang diubah. Tambahkan --execute untuk menjalankan.');

        $moved = 0;
        $skipped = 0;
        $failed = 0;

        foreach (PrivateFile::LEGACY_PUBLIC_DIRECTORIES as $directory) {
            $files = $public->allFiles($directory);
            $this->line(sprintf('  %-28s %d file', $directory.'/', count($files)));

            foreach ($files as $path) {
                if (! PrivateFile::isSafePath($path)) {
                    $failed++;

                    continue;
                }

                $contents = $public->get($path);
                if ($contents === null) {
                    $failed++;

                    continue;
                }

                if ($private->exists($path) && $private->size($path) === strlen($contents)) {
                    // Sudah tersalin sebelumnya: cukup hapus sisa di disk publik.
                    if ($execute) {
                        $public->delete($path);
                    }
                    $skipped++;

                    continue;
                }

                if (! $execute) {
                    $moved++;

                    continue;
                }

                // Salin -> verifikasi ukuran -> baru hapus dari publik.
                if ($private->put($path, $contents) && $private->size($path) === strlen($contents)) {
                    $public->delete($path);
                    $moved++;
                } else {
                    $failed++;
                }
            }
        }

        $this->newLine();
        $this->table(['Dipindah', 'Sudah ada (dibersihkan)', 'Gagal'], [[$moved, $skipped, $failed]]);

        return $failed > 0 ? self::FAILURE : self::SUCCESS;
    }
}
