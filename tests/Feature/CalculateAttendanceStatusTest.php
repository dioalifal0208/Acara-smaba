<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\Participant;
use App\Models\Workcode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * attendance:calculate-alpha hanya untuk peserta yang wajib presensi di workcode itu,
 * dan tidak berjalan pada hari libur nasional.
 */
class CalculateAttendanceStatusTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_selected_participants_get_lupa_absen_and_alpha(): void
    {
        $workcode = $this->workcode();
        $selected = $this->participant('Dio');
        $notSelected = $this->participant('Sari');
        $workcode->participants()->attach($selected->id);

        // Kamis 22 Okt: datang 07:00–07:30 + toleransi 60 menit = 08:30.
        Carbon::setTestNow('2026-10-22 08:31:00');
        $this->artisan('attendance:calculate-alpha')->assertSuccessful();
        $this->assertDatabaseHas('attendances', ['participant_id' => $selected->id, 'status' => 'lupa_absen']);
        $this->assertDatabaseMissing('attendances', ['participant_id' => $notSelected->id]);

        Carbon::setTestNow('2026-10-22 16:01:00');
        $this->artisan('attendance:calculate-alpha')->assertSuccessful();
        $this->assertDatabaseHas('attendances', ['participant_id' => $selected->id, 'status' => 'alpha']);
        $this->assertDatabaseMissing('attendances', ['participant_id' => $notSelected->id]);
    }

    public function test_workcode_without_selection_applies_to_all_participants(): void
    {
        $workcode = $this->workcode();
        $dio = $this->participant('Dio');
        $sari = $this->participant('Sari');

        Carbon::setTestNow('2026-10-22 16:01:00');
        $this->artisan('attendance:calculate-alpha')->assertSuccessful();

        $this->assertSame(2, Attendance::where('workcode_id', $workcode->id)->where('status', 'alpha')->count());
        $this->assertDatabaseHas('attendances', ['participant_id' => $dio->id, 'status' => 'alpha']);
        $this->assertDatabaseHas('attendances', ['participant_id' => $sari->id, 'status' => 'alpha']);
    }

    public function test_national_holiday_records_nothing(): void
    {
        Http::fake(['calendar.google.com/*' => Http::response(implode("\r\n", [
            'BEGIN:VCALENDAR',
            'BEGIN:VEVENT',
            'DTSTART;VALUE=DATE:20261022',
            'SUMMARY:Hari Libur Uji',
            'END:VEVENT',
            'END:VCALENDAR',
        ]))]);

        $this->workcode();
        $this->participant('Dio');

        Carbon::setTestNow('2026-10-22 16:01:00');
        $this->artisan('attendance:calculate-alpha')->assertSuccessful();

        $this->assertSame(0, Attendance::count());
    }

    public function test_holiday_fetch_failure_still_calculates(): void
    {
        Http::fake(['calendar.google.com/*' => Http::response('', 500)]);

        $this->workcode();
        $dio = $this->participant('Dio');

        Carbon::setTestNow('2026-10-22 16:01:00');
        $this->artisan('attendance:calculate-alpha')->assertSuccessful();

        $this->assertDatabaseHas('attendances', ['participant_id' => $dio->id, 'status' => 'alpha']);
    }

    public function test_existing_row_is_matched_by_tanggal_not_created_at(): void
    {
        $workcode = $this->workcode();
        $dio = $this->participant('Dio');

        // Presensi manual hari ini yang dibuat kemarin: dulu dicari lewat created_at, tidak ketemu,
        // lalu command mencoba membuat baris baru dan gagal karena unique (workcode, peserta, tanggal).
        Carbon::setTestNow('2026-10-21 17:00:00');
        Attendance::create([
            'workcode_id' => $workcode->id,
            'participant_id' => $dio->id,
            'tanggal' => '2026-10-22',
            'waktu_hadir' => '2026-10-22 07:10:00',
            'status' => 'hadir',
            'attendance_method' => 'manual',
        ]);

        Carbon::setTestNow('2026-10-22 16:01:00');
        $this->artisan('attendance:calculate-alpha')->assertSuccessful();

        $this->assertSame(1, Attendance::count());
        $this->assertDatabaseHas('attendances', ['participant_id' => $dio->id, 'status' => 'lupa_absen']);
    }

    private function workcode(): Workcode
    {
        return Workcode::create([
            'nama_workcode' => 'Harian Office',
            'kategori' => 'harian',
            'is_active' => true,
            'jam_datang_mulai' => '07:00:00',
            'jam_datang_selesai' => '07:30:00',
            'jam_pulang_mulai' => '15:00:00',
            'jam_pulang_selesai' => '16:00:00',
        ]);
    }

    private function participant(string $name): Participant
    {
        return Participant::create([
            'nama' => $name,
            'nis_nip' => Str::uuid()->toString(),
            'qr_token' => Str::uuid()->toString(),
        ]);
    }
}
