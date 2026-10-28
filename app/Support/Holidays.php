<?php

namespace App\Support;

use Carbon\CarbonInterface;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

/**
 * Hari libur nasional Indonesia dari kalender publik Google (format ICS), di-cache 7 hari.
 * Dipakai kalender presensi (GET /api/holidays) dan attendance:calculate-alpha.
 */
class Holidays
{
    private const URL = 'https://calendar.google.com/calendar/ical/id.indonesian%23holiday%40group.v.calendar.google.com/public/basic.ics';

    private const CACHE_KEY = 'google_holidays_id';

    /** Salinan terakhir yang berhasil diambil, tanpa kedaluwarsa: cadangan saat Google gagal. */
    private const LAST_GOOD_KEY = 'google_holidays_id:last_good';

    /** @return array<string, string> tanggal Y-m-d => nama libur */
    public static function all(): array
    {
        $cached = Cache::get(self::CACHE_KEY);
        if (is_array($cached)) {
            return $cached;
        }

        $holidays = self::fetch();

        if ($holidays !== []) {
            Cache::put(self::CACHE_KEY, $holidays, now()->addDays(7));
            Cache::forever(self::LAST_GOOD_KEY, $holidays);

            return $holidays;
        }

        // Gagal (atau kalender kosong): jangan simpan daftar kosong 7 hari, karena scheduler bisa mencatat
        // alpha pada hari libur. Pakai salinan terakhir yang berhasil, lalu coba lagi setelah 1 jam.
        // Tanpa salinan sama sekali, anggap tidak ada libur agar kalender dan scheduler tetap berjalan.
        $fallback = Cache::get(self::LAST_GOOD_KEY, []);
        Cache::put(self::CACHE_KEY, $fallback, now()->addHour());

        return $fallback;
    }

    /** @return array<string, string> kosong bila gagal mengambil */
    private static function fetch(): array
    {
        try {
            $response = Http::timeout(10)->get(self::URL);

            return $response->successful() ? self::parse($response->body()) : [];
        } catch (\Exception $e) {
            return [];
        }
    }

    public static function isHoliday(CarbonInterface $date): bool
    {
        return isset(self::all()[$date->toDateString()]);
    }

    /** @return array<string, string> */
    private static function parse(string $ics): array
    {
        $lines = explode("\n", str_replace("\r", '', $ics));
        $holidays = [];
        $currentDate = null;
        $currentSummary = null;

        foreach ($lines as $line) {
            $line = trim($line);

            if (strpos($line, 'DTSTART;VALUE=DATE:') === 0) {
                $dateStr = substr($line, 19); // Format: YYYYMMDD
                if (strlen($dateStr) === 8) {
                    $currentDate = substr($dateStr, 0, 4).'-'.substr($dateStr, 4, 2).'-'.substr($dateStr, 6, 2);
                }
            } elseif (strpos($line, 'SUMMARY:') === 0) {
                $currentSummary = substr($line, 8);
            } elseif ($line === 'END:VEVENT') {
                if ($currentDate && $currentSummary) {
                    // Beberapa libur di hari yang sama digabung.
                    $holidays[$currentDate] = isset($holidays[$currentDate])
                        ? $holidays[$currentDate].' / '.$currentSummary
                        : $currentSummary;
                }
                $currentDate = null;
                $currentSummary = null;
            }
        }

        return $holidays;
    }
}
