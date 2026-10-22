<?php

namespace App\Support;

use Illuminate\Support\Facades\Cache;

/**
 * Sinyal sinkronisasi Android → web. Aplikasi Android menaikkannya (tarik ke bawah, atau setiap
 * perubahan data dari API), dan halaman admin web yang memantaunya memuat ulang datanya di latar belakang.
 *
 * Disimpan di cache file, bukan database: endpoint sinyal dipanggil tiap beberapa detik oleh setiap
 * tab admin, jadi tidak boleh membuka koneksi database (hosting membatasi jumlah proses/koneksi).
 */
class WebSync
{
    private const KEY = 'web-sync:signal';

    /** @return array{v: int, at: ?string} */
    public static function current(): array
    {
        return Cache::store('file')->get(self::KEY, ['v' => 0, 'at' => null]);
    }

    public static function bump(): void
    {
        // Versi = waktu dalam milidetik: selalu naik, dan tetap unik bila cache file sempat terhapus.
        Cache::store('file')->forever(self::KEY, [
            'v' => (int) floor(microtime(true) * 1000),
            'at' => now()->toIso8601String(),
        ]);
    }
}
