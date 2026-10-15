<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Workcode;
use App\Services\FcmService;
use Carbon\Carbon;
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
}
