<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Rilis APK aplikasi Android yang diunggah deploy ke storage/app/apk. Hanya rilis terbaru yang
 * ditawarkan untuk diunduh; beberapa rilis sebelumnya disimpan sebagai cadangan rollback.
 */
class AppRelease extends Model
{
    /** Jumlah rilis (beserta file APK-nya) yang disimpan di server. */
    public const KEEP = 3;

    protected $fillable = ['version_code', 'version_name', 'file_name', 'size_bytes', 'sha256', 'download_count', 'published_at'];

    protected $casts = [
        'version_code' => 'integer',
        'size_bytes' => 'integer',
        'download_count' => 'integer',
        'published_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::deleted(function (AppRelease $release) {
            @unlink($release->path());
        });
    }

    public static function directory(): string
    {
        return storage_path('app/apk');
    }

    public function path(): string
    {
        return self::directory().DIRECTORY_SEPARATOR.$this->file_name;
    }

    public static function latestRelease(): ?self
    {
        return static::orderByDesc('version_code')->first();
    }

    /** Link unduhan APK terbaru untuk halaman depan & layar update aplikasi; null bila belum ada rilis. */
    public static function downloadUrl(): ?string
    {
        return static::query()->exists() ? route('apk.download') : null;
    }

    /**
     * Versi minimum aplikasi (jendela bergeser): HP boleh tertinggal paling banyak min_version_lag rilis
     * dari APK terbaru. ANDROID_MIN_VERSION_CODE tetap berlaku sebagai batas bawah manual.
     */
    public static function minimumVersionCode(): int
    {
        return self::minimumFor(static::max('version_code'));
    }

    /** Versi minimum bila APK terbaru ber-versionCode $latestVersionCode (dipakai juga untuk prakiraan). */
    public static function minimumFor(?int $latestVersionCode): int
    {
        $floor = (int) config('attendance.android_app.min_version_code');
        $lag = (int) config('attendance.android_app.min_version_lag');

        if ($lag <= 0 || ! $latestVersionCode) {
            return $floor;
        }

        return max($floor, $latestVersionCode - $lag);
    }
}
