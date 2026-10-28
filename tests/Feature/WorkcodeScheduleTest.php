<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Workcode;
use App\Services\FcmService;
use Carbon\Carbon;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkcodeScheduleTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_schedule_an_activity_workcode_for_a_time_window(): void
    {
        $this->travelTo(Carbon::parse('2026-10-14 06:30:00', 'Asia/Jakarta'));
        $this->mock(FcmService::class)
            ->shouldReceive('sendWorkcodeUpdate')
            ->once();

        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)
            ->from(route('workcodes.index'))
            ->post(route('workcodes.store'), [
                'nama_workcode' => 'Upacara Sekolah',
                'kategori' => 'workcode',
                'tanggal' => '2026-10-14',
                'jam_aktif_mulai' => '07:00',
                'jam_aktif_selesai' => '10:00',
                'radius_meters' => 100,
            ]);

        $response->assertRedirect(route('workcodes.index'))
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('workcodes', [
            'nama_workcode' => 'Upacara Sekolah',
            'tanggal' => '2026-10-14',
            'is_active' => false,
        ]);

        $workcode = Workcode::where('nama_workcode', 'Upacara Sekolah')->firstOrFail();
        $this->assertSame('07:00', substr($workcode->jam_aktif_mulai, 0, 5));
        $this->assertSame('10:00', substr($workcode->jam_aktif_selesai, 0, 5));
    }

    public function test_activity_end_time_must_be_after_start_time(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)
            ->from(route('workcodes.index'))
            ->post(route('workcodes.store'), [
                'nama_workcode' => 'Jadwal Tidak Valid',
                'kategori' => 'workcode',
                'tanggal' => '2026-10-14',
                'jam_aktif_mulai' => '10:00',
                'jam_aktif_selesai' => '07:00',
                'radius_meters' => 100,
            ]);

        $response->assertRedirect(route('workcodes.index'))
            ->assertSessionHasErrors('jam_aktif_selesai');
    }

    public function test_scheduled_workcode_is_not_effectively_active_outside_its_window(): void
    {
        $this->travelTo(Carbon::parse('2026-10-14 10:00:00', 'Asia/Jakarta'));

        Workcode::create([
            'nama_workcode' => 'Kegiatan Pagi',
            'kategori' => 'workcode',
            'tanggal' => '2026-10-14',
            'jam_aktif_mulai' => '07:00',
            'jam_aktif_selesai' => '10:00',
            'is_active' => true,
        ]);

        $this->assertNull(Workcode::getActive());
    }

    public function test_scheduled_workcode_is_active_without_scheduler_or_database_flag(): void
    {
        $this->travelTo(Carbon::parse('2026-10-14 07:30:00', 'Asia/Jakarta'));

        $workcode = Workcode::create([
            'nama_workcode' => 'Kegiatan Dinamis',
            'kategori' => 'workcode',
            'tanggal' => '2026-10-14',
            'jam_aktif_mulai' => '07:00',
            'jam_aktif_selesai' => '10:00',
            'is_active' => false,
        ]);

        $this->assertTrue($workcode->isEffectivelyActive());
        $this->assertTrue(Workcode::getActive()->is($workcode));
    }

    public function test_scheduler_activates_and_deactivates_workcode_at_configured_times(): void
    {
        $fcmService = $this->mock(FcmService::class);
        $fcmService->shouldReceive('sendWorkcodeUpdate')->twice();

        $workcode = Workcode::create([
            'nama_workcode' => 'Kegiatan Terjadwal',
            'kategori' => 'workcode',
            'tanggal' => '2026-10-14',
            'jam_aktif_mulai' => '07:00',
            'jam_aktif_selesai' => '10:00',
            'is_active' => false,
        ]);

        $this->travelTo(Carbon::parse('2026-10-14 07:00:00', 'Asia/Jakarta'));
        $this->artisan('workcode:auto-activate')->assertSuccessful();

        $this->assertTrue($workcode->fresh()->is_active);
        $this->assertTrue(Workcode::getActive()->is($workcode));

        $this->travelTo(Carbon::parse('2026-10-14 10:00:00', 'Asia/Jakarta'));
        $this->artisan('workcode:auto-activate')->assertSuccessful();

        $this->assertFalse($workcode->fresh()->is_active);
        $this->assertNull(Workcode::getActive());
    }

    public function test_scheduler_keeps_daily_and_other_active_workcodes_during_an_activity(): void
    {
        $fcmService = $this->mock(FcmService::class);
        // Dua kegiatan terjadwal dibuka (07:00), lalu keduanya ditutup (10:00 dan 11:00): 4 push.
        $fcmService->shouldReceive('sendWorkcodeUpdate')->times(4);

        $daily = Workcode::create(['nama_workcode' => 'Harian Office', 'kategori' => 'harian', 'is_active' => true]);
        $manual = Workcode::create(['nama_workcode' => 'Rapat Tanpa Jadwal', 'kategori' => 'workcode', 'is_active' => true]);
        $first = $this->scheduledActivity('Upacara', '07:00', '10:00');
        $overlapping = $this->scheduledActivity('Lomba', '07:00', '11:00');

        $this->travelTo(Carbon::parse('2026-10-14 07:00:00', 'Asia/Jakarta'));
        $this->artisan('workcode:auto-activate')->assertSuccessful();
        // Dijalankan lagi tanpa perubahan: tidak ada push tambahan.
        $this->artisan('workcode:auto-activate')->assertSuccessful();

        $this->assertTrue($daily->fresh()->is_active);
        $this->assertTrue($manual->fresh()->is_active);
        $this->assertTrue($first->fresh()->is_active);
        $this->assertTrue($overlapping->fresh()->is_active);
        $this->assertCount(4, Workcode::getActiveWorkcodes());

        $this->travelTo(Carbon::parse('2026-10-14 10:00:00', 'Asia/Jakarta'));
        $this->artisan('workcode:auto-activate')->assertSuccessful();

        $this->assertFalse($first->fresh()->is_active);
        $this->assertTrue($overlapping->fresh()->is_active);
        $this->assertTrue($daily->fresh()->is_active);

        $this->travelTo(Carbon::parse('2026-10-14 11:00:00', 'Asia/Jakarta'));
        $this->artisan('workcode:auto-activate')->assertSuccessful();

        $this->assertFalse($overlapping->fresh()->is_active);
        $this->assertTrue($daily->fresh()->is_active);
        $this->assertTrue($manual->fresh()->is_active);
    }

    public function test_auto_activate_is_scheduled_every_minute(): void
    {
        $event = collect(app(Schedule::class)->events())
            ->firstWhere('description', 'workcode:auto-activate');

        $this->assertNotNull($event);
        $this->assertSame('* * * * *', $event->expression);
    }

    private function scheduledActivity(string $name, string $start, string $end): Workcode
    {
        return Workcode::create([
            'nama_workcode' => $name,
            'kategori' => 'workcode',
            'tanggal' => '2026-10-14',
            'jam_aktif_mulai' => $start,
            'jam_aktif_selesai' => $end,
            'is_active' => false,
        ]);
    }

    public function test_extending_an_ended_activity_reactivates_it_immediately(): void
    {
        $this->travelTo(Carbon::parse('2026-10-22 11:00:00', 'Asia/Jakarta'));
        $this->mock(FcmService::class)->shouldReceive('sendWorkcodeUpdate')->once();
        $workcode = Workcode::create([
            'nama_workcode' => 'Hari Santri Nasional 2026',
            'kategori' => 'workcode',
            'tanggal' => '2026-10-22',
            'jam_aktif_mulai' => '07:00:00',
            'jam_aktif_selesai' => '10:00:00',
            'is_active' => false,
            'radius_meters' => 100,
        ]);
        $this->assertFalse($workcode->isEffectivelyActive());

        $this->actingAs(User::factory()->create(['role' => 'admin']))
            ->from(route('workcodes.index'))
            ->put(route('workcodes.update', $workcode), [
                'nama_workcode' => 'Hari Santri Nasional 2026',
                'kategori' => 'workcode',
                'tanggal' => '2026-10-22',
                'jam_aktif_mulai' => '07:00',
                'jam_aktif_selesai' => '12:00',
                'radius_meters' => 100,
            ])
            ->assertSessionHasNoErrors();

        $workcode->refresh();
        $this->assertSame('12:00', substr($workcode->jam_aktif_selesai, 0, 5));
        $this->assertTrue($workcode->is_active);
        $this->assertTrue($workcode->isEffectivelyActive());
        $this->assertTrue(Workcode::getActive()->is($workcode));
    }

    public function test_daily_departure_cannot_open_before_late_tolerance_ends(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $schedule = fn (string $pulangMulai) => [
            'jam_datang_mulai' => '06:00', 'jam_datang_selesai' => '07:00',
            'jam_pulang_mulai' => $pulangMulai, 'jam_pulang_selesai' => '22:00',
        ];

        $this->actingAs($admin)
            ->from(route('workcodes.index'))
            ->post(route('workcodes.store'), [
                'nama_workcode' => 'Harian Bentrok',
                'kategori' => 'harian',
                'hari_aktif' => [1, 5],
                'jam_datang_mulai' => '06:00',
                'jam_datang_selesai' => '07:00',
                'jam_pulang_mulai' => '15:30',
                'jam_pulang_selesai' => '22:00',
                // Jumat: pulang mulai 08:00 = batas toleransi datang (07:00 + 60 menit).
                'jadwal_per_hari' => [1 => $schedule('15:30'), 5 => $schedule('08:00')],
            ])
            ->assertRedirect(route('workcodes.index'))
            ->assertSessionHasErrors('jadwal_per_hari.5.jam_pulang_mulai')
            ->assertSessionDoesntHaveErrors('jadwal_per_hari.1.jam_pulang_mulai');

        $this->assertDatabaseMissing('workcodes', ['nama_workcode' => 'Harian Bentrok']);

        $this->mock(FcmService::class)->shouldReceive('sendWorkcodeUpdate')->once();
        $this->actingAs($admin)
            ->from(route('workcodes.index'))
            ->post(route('workcodes.store'), [
                'nama_workcode' => 'Harian Valid',
                'kategori' => 'harian',
                'hari_aktif' => [5],
                'jam_datang_selesai' => '07:00',
                'jam_pulang_mulai' => '15:30',
                'jadwal_per_hari' => [5 => $schedule('08:01')],
            ])
            ->assertSessionHasNoErrors();
    }
}
