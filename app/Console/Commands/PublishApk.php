<?php

namespace App\Console\Commands;

use App\Models\AppRelease;
use Illuminate\Console\Command;

class PublishApk extends Command
{
    protected $signature = 'apk:publish
        {file : Path file APK yang sudah diunggah ke server}
        {--version-code= : versionCode APK}
        {--version-name= : versionName APK, mis. 1.2.1}
        {--sha256= : Hash SHA-256 dari PC, untuk memastikan file utuh}';

    protected $description = 'Daftarkan APK Android hasil deploy sebagai rilis terbaru dan simpan hanya beberapa rilis terakhir.';

    /**
     * Dipanggil deploy.ps1 setelah APK diunggah lewat scp. File dipindah ke storage/app/apk dengan nama
     * berversi; versionCode yang sudah terdaftar dengan file yang sama dilewati (deploy diulang).
     */
    public function handle(): int
    {
        $source = $this->argument('file');
        $versionCode = (int) $this->option('version-code');
        $versionName = trim((string) $this->option('version-name'));

        if (! is_file($source)) {
            $this->error("File APK tidak ditemukan: {$source}");

            return self::FAILURE;
        }

        if ($versionCode <= 0 || ! preg_match('/^\d+\.\d+\.\d+$/', $versionName)) {
            $this->error('Isi --version-code (angka) dan --version-name (format x.y.z).');

            return self::FAILURE;
        }

        // APK adalah arsip ZIP.
        if (file_get_contents($source, false, null, 0, 4) !== "PK\x03\x04") {
            $this->error('File bukan APK yang valid.');

            return self::FAILURE;
        }

        $sha256 = hash_file('sha256', $source);
        if ($this->option('sha256') && ! hash_equals(strtolower($this->option('sha256')), $sha256)) {
            $this->error('Hash SHA-256 tidak cocok; file APK rusak saat diunggah.');

            return self::FAILURE;
        }

        $existing = AppRelease::where('version_code', $versionCode)->first();
        if ($existing) {
            if ($existing->sha256 !== $sha256) {
                $this->error("versionCode {$versionCode} sudah terdaftar dengan file berbeda. Naikkan versi aplikasi.");

                return self::FAILURE;
            }

            @unlink($source);
            $this->info("APK {$versionName} ({$versionCode}) sudah terdaftar.");

            return self::SUCCESS;
        }

        $fileName = "presensi-smaba-v{$versionName}-{$versionCode}.apk";
        $target = AppRelease::directory().DIRECTORY_SEPARATOR.$fileName;
        if (! is_dir(AppRelease::directory())) {
            mkdir(AppRelease::directory(), 0775, true);
        }
        if (realpath($source) !== realpath($target) && ! rename($source, $target)) {
            $this->error("Gagal memindahkan APK ke {$target}.");

            return self::FAILURE;
        }

        AppRelease::create([
            'version_code' => $versionCode,
            'version_name' => $versionName,
            'file_name' => $fileName,
            'size_bytes' => filesize($target),
            'sha256' => $sha256,
            'published_at' => now(),
        ]);

        // Simpan hanya beberapa rilis terakhir; file APK ikut terhapus (AppRelease::deleted).
        AppRelease::orderByDesc('version_code')->skip(AppRelease::KEEP)->take(PHP_INT_MAX)->get()->each->delete();

        $this->info("APK {$versionName} ({$versionCode}) diterbitkan. Versi minimum aplikasi: ".AppRelease::minimumVersionCode().'.');

        return self::SUCCESS;
    }
}
