<?php

namespace Tests\Feature;

use App\Support\Holidays;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/** Kalender libur Google: gagal mengambil tidak boleh menyimpan daftar kosong selama 7 hari. */
class HolidaysTest extends TestCase
{
    private const ICS = "BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nDTSTART;VALUE=DATE:20261022\r\nSUMMARY:Hari Santri\r\nEND:VEVENT\r\nEND:VCALENDAR";

    public function test_success_is_cached_for_seven_days(): void
    {
        Carbon::setTestNow('2026-10-20 10:00:00');
        Http::fake(['calendar.google.com/*' => Http::response(self::ICS)]);

        $this->assertSame(['2026-10-22' => 'Hari Santri'], Holidays::all());
        Carbon::setTestNow('2026-10-26 10:00:00');
        $this->assertTrue(Holidays::isHoliday(Carbon::parse('2026-10-22')));

        Http::assertSentCount(1);
    }

    public function test_failure_is_retried_after_an_hour_instead_of_seven_days(): void
    {
        Carbon::setTestNow('2026-10-20 10:00:00');
        Http::fake(['calendar.google.com/*' => Http::sequence()
            ->push('', 500)
            ->push(self::ICS)]);

        $this->assertSame([], Holidays::all());
        Carbon::setTestNow('2026-10-20 10:30:00');
        $this->assertSame([], Holidays::all());
        Http::assertSentCount(1);

        Carbon::setTestNow('2026-10-20 11:01:00');
        $this->assertSame(['2026-10-22' => 'Hari Santri'], Holidays::all());
        Http::assertSentCount(2);
    }

    public function test_failure_after_success_keeps_last_known_holidays(): void
    {
        Carbon::setTestNow('2026-10-01 10:00:00');
        Http::fake(['calendar.google.com/*' => Http::sequence()
            ->push(self::ICS)
            ->push('', 500)
            // Respons berhasil tetapi tanpa libur (mis. format berubah) diperlakukan sebagai gagal.
            ->push("BEGIN:VCALENDAR\r\nEND:VCALENDAR")]);

        Holidays::all();

        Carbon::setTestNow('2026-10-09 10:00:00');
        $this->assertTrue(Holidays::isHoliday(Carbon::parse('2026-10-22')));

        Carbon::setTestNow('2026-10-09 11:01:00');
        $this->assertTrue(Holidays::isHoliday(Carbon::parse('2026-10-22')));
        Http::assertSentCount(3);
    }
}
