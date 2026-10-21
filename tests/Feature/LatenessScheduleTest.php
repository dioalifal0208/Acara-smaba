<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\Participant;
use App\Models\User;
use App\Models\Workcode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * Keterlambatan harus mengikuti jadwal per hari (jadwal_per_hari), bukan hanya jam datang bawaan workcode.
 */
class LatenessScheduleTest extends TestCase
{
    use RefreshDatabase;

    private function workcode(): Workcode
    {
        // Bawaan 07:00–07:30; Rabu (ISO 3) dijadwalkan 11:30–11:40.
        return Workcode::create([
            'nama_workcode' => 'Harian Office',
            'kategori' => 'harian',
            'is_active' => true,
            'jam_datang_mulai' => '07:00:00',
            'jam_datang_selesai' => '07:30:00',
            'jam_pulang_mulai' => '15:00:00',
            'jam_pulang_selesai' => '16:00:00',
            'jadwal_per_hari' => [3 => [
                'jam_datang_mulai' => '11:30',
                'jam_datang_selesai' => '11:40',
                'jam_pulang_mulai' => '11:41',
                'jam_pulang_selesai' => '11:50',
            ]],
        ]);
    }

    public function test_deadline_follows_the_schedule_of_that_day(): void
    {
        $workcode = $this->workcode();

        // Rabu 21 Okt 2026: batas 11:40.
        $this->assertFalse($workcode->isLateAt(Carbon::parse('2026-10-21 11:31:00')));
        $this->assertTrue($workcode->isLateAt(Carbon::parse('2026-10-21 11:45:00')));
        $this->assertSame(5, $workcode->lateMinutes(Carbon::parse('2026-10-21 11:45:00')));
        // Kamis tanpa jadwal khusus: batas bawaan 07:30.
        $this->assertTrue($workcode->isLateAt(Carbon::parse('2026-10-22 08:44:00')));
        $this->assertSame('15:00:00', $workcode->scheduleFor(Carbon::parse('2026-10-22'))['jam_pulang_mulai']);
        // Kegiatan (bukan harian) tidak pernah terlambat.
        $workcode->kategori = 'workcode';
        $this->assertFalse($workcode->isLateAt(Carbon::parse('2026-10-22 23:00:00')));
    }

    public function test_individual_recap_marks_lateness_using_the_daily_schedule(): void
    {
        Carbon::setTestNow('2026-10-21 12:00:00');
        $workcode = $this->workcode();
        $participant = Participant::create(['nama' => 'Dio', 'nis_nip' => '1997', 'qr_token' => Str::uuid()->toString()]);
        foreach (['2026-10-21 11:31:00', '2026-10-15 08:44:00'] as $time) {
            Attendance::create([
                'workcode_id' => $workcode->id,
                'participant_id' => $participant->id,
                'tanggal' => substr($time, 0, 10),
                'waktu_hadir' => $time,
                'status' => 'hadir',
                'created_at' => $time,
            ]);
        }

        $rows = collect($this->actingAs(User::factory()->create(['role' => 'admin']))
            ->getJson(route('report.individual', [$workcode, $participant], false).'?year=2026&month=10')
            ->assertOk()
            ->json('attendances'))
            ->keyBy('tanggal');

        $this->assertFalse($rows['2026-10-21']['is_late']);
        $this->assertTrue($rows['2026-10-15']['is_late']);
        $this->assertSame(74, $rows['2026-10-15']['late_minutes']);
    }

    public function test_forgotten_arrival_is_recorded_only_after_late_tolerance(): void
    {
        // Kamis: jadwal bawaan datang 07:00–07:30, toleransi sampai 08:30.
        $workcode = $this->workcode();
        $participant = Participant::create(['nama' => 'Dio', 'nis_nip' => '1997', 'qr_token' => Str::uuid()->toString()]);

        Carbon::setTestNow('2026-10-22 08:15:00');
        $this->artisan('attendance:calculate-alpha')->assertSuccessful();
        $this->assertDatabaseMissing('attendances', ['participant_id' => $participant->id]);

        Carbon::setTestNow('2026-10-22 08:31:00');
        $this->artisan('attendance:calculate-alpha')->assertSuccessful();
        $this->assertDatabaseHas('attendances', ['participant_id' => $participant->id, 'workcode_id' => $workcode->id, 'status' => 'lupa_absen']);

        // Tidak datang dan tidak pulang sampai jam pulang selesai: alpha.
        Carbon::setTestNow('2026-10-22 16:01:00');
        $this->artisan('attendance:calculate-alpha')->assertSuccessful();
        $this->assertDatabaseHas('attendances', ['participant_id' => $participant->id, 'status' => 'alpha']);
    }

    public function test_late_tolerance_is_capped_at_end_of_day(): void
    {
        $this->assertSame('08:00:00', Workcode::withLateTolerance(Carbon::parse('2026-10-22 07:00:00'))->format('H:i:s'));
        $this->assertSame('23:59:59', Workcode::withLateTolerance(Carbon::parse('2026-10-22 23:30:00'))->format('H:i:s'));
        $this->assertSame('1 jam 5 menit', Workcode::formatLateDuration(65));
        $this->assertSame('2 jam', Workcode::formatLateDuration(120));
    }
}
