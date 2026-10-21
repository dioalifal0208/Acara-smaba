<?php

namespace App\Support;

/**
 * Anti fake GPS untuk presensi Android.
 *
 * Aplikasi Android mengirim sinyal integritas lokasi (`location_integrity`) bersama presensi;
 * server yang memutuskan berdasarkan kebijakan di config/attendance.php (`location_integrity`).
 * Sinyal dari HP bisa dipalsukan oleh APK yang dimodifikasi, jadi ini lapisan pencegah, bukan bukti
 * mutlak — itulah sebabnya root/hooking (cara umum menyembunyikan mock) juga ditolak.
 */
final class LocationIntegrity
{
    public const MOCK_LOCATION = 'mock_location';

    public const MOCK_APP_ACTIVE = 'mock_app_active';

    public const FAKE_APP_INSTALLED = 'fake_app_installed';

    public const ROOTED = 'rooted';

    public const HOOKING = 'hooking_framework';

    /** Hanya dicatat untuk admin, tidak pernah menolak presensi. */
    public const DEVELOPER_OPTIONS = 'developer_options';

    /** Pesan untuk peserta, urut dari yang paling spesifik. */
    private const MESSAGES = [
        self::MOCK_LOCATION => 'Lokasi palsu (mock location) terdeteksi. Matikan aplikasi Fake GPS dan opsi "Pilih aplikasi lokasi palsu" di Opsi Pengembang.',
        self::MOCK_APP_ACTIVE => 'Aplikasi lokasi palsu sedang aktif di Opsi Pengembang. Ubah "Pilih aplikasi lokasi palsu" menjadi "Tidak ada".',
        self::FAKE_APP_INSTALLED => 'Aplikasi Fake GPS terpasang di HP ini. Hapus aplikasi tersebut untuk dapat melakukan presensi.',
        self::HOOKING => 'HP ini memakai framework modifikasi sistem (Xposed/LSPosed). Presensi tidak diizinkan pada perangkat yang dimodifikasi.',
        self::ROOTED => 'HP ini terdeteksi di-root. Presensi tidak diizinkan pada perangkat yang di-root.',
    ];

    /** Aturan validasi untuk field `location_integrity` di POST /api/v1/attendance. */
    public static function rules(): array
    {
        return [
            'location_integrity' => 'nullable|array',
            'location_integrity.is_mock' => 'nullable|boolean',
            'location_integrity.mock_app_active' => 'nullable|boolean',
            'location_integrity.fake_apps' => 'nullable|array|max:20',
            'location_integrity.fake_apps.*' => 'string|max:120',
            'location_integrity.rooted' => 'nullable|boolean',
            'location_integrity.hooking' => 'nullable|boolean',
            'location_integrity.developer_options' => 'nullable|boolean',
            'location_integrity.device_model' => 'nullable|string|max:100',
        ];
    }

    /**
     * Alasan penolakan sesuai kebijakan. Akurasi 0 (khas injektor mock) diperlakukan sebagai mock
     * walau aplikasi tidak mengirim sinyal.
     *
     * @return list<string>
     */
    public static function violations(?array $signals, mixed $accuracy = null): array
    {
        $signals ??= [];
        $policy = config('attendance.location_integrity');
        $reasons = [];

        if (($signals['is_mock'] ?? false) === true || ($accuracy !== null && (float) $accuracy <= 0)) {
            $reasons[] = self::MOCK_LOCATION;
        }
        if (($signals['mock_app_active'] ?? false) === true) {
            $reasons[] = self::MOCK_APP_ACTIVE;
        }
        if (($policy['block_fake_apps'] ?? true) && ! empty($signals['fake_apps'])) {
            $reasons[] = self::FAKE_APP_INSTALLED;
        }
        if (($policy['block_hooking'] ?? true) && ($signals['hooking'] ?? false) === true) {
            $reasons[] = self::HOOKING;
        }
        if (($policy['block_root'] ?? true) && ($signals['rooted'] ?? false) === true) {
            $reasons[] = self::ROOTED;
        }

        return $reasons;
    }

    /** Pesan untuk alasan paling utama; nama aplikasi fake GPS disebut bila ada. */
    public static function message(array $reasons, ?array $signals = null): string
    {
        $primary = collect(array_keys(self::MESSAGES))->first(fn ($code) => in_array($code, $reasons, true));
        $message = self::MESSAGES[$primary] ?? 'Indikasi lokasi palsu terdeteksi.';

        if ($primary === self::FAKE_APP_INSTALLED && ! empty($signals['fake_apps'])) {
            $message .= ' Terdeteksi: '.implode(', ', array_slice($signals['fake_apps'], 0, 3)).'.';
        }

        return 'Presensi diblokir. '.$message;
    }

    /** Semua kode keterangan yang bisa muncul di catatan, untuk filter halaman admin. */
    public const ALL_REASONS = [
        self::MOCK_LOCATION, self::MOCK_APP_ACTIVE, self::FAKE_APP_INSTALLED,
        self::HOOKING, self::ROOTED, self::DEVELOPER_OPTIONS,
    ];

    /** Label singkat untuk admin. */
    public static function label(string $reason): string
    {
        return match ($reason) {
            self::MOCK_LOCATION => 'Lokasi palsu',
            self::MOCK_APP_ACTIVE => 'Mock app aktif',
            self::FAKE_APP_INSTALLED => 'App fake GPS terpasang',
            self::HOOKING => 'Xposed/LSPosed',
            self::ROOTED => 'HP di-root',
            self::DEVELOPER_OPTIONS => 'Opsi pengembang aktif',
            default => $reason,
        };
    }
}
