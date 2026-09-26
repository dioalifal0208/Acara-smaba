<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\Participant;
use App\Models\User;
use App\Models\Workcode;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class WorkcodeManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_an_active_24_hour_workcode(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        $response = $this->actingAs($admin)
            ->from(route('workcodes.index'))
            ->post(route('workcodes.store'), [
                'nama_workcode' => 'Presensi Bebas 24 Jam',
                'deskripsi' => 'Presensi dapat dilakukan kapan saja selama Workcode aktif.',
                'kategori' => '24_jam',
                'tanggal' => null,
                'hari_aktif' => [1, 2, 3, 4, 5],
                'jam_datang_mulai' => '06:00',
                'jam_datang_selesai' => '07:00',
                'jam_pulang_mulai' => '15:30',
                'jam_pulang_selesai' => '22:00',
                'latitude' => null,
                'longitude' => null,
                'radius_meters' => 100,
                'set_active' => true,
                'jadwal_per_hari' => [
                    1 => [
                        'jam_datang_mulai' => '06:00',
                        'jam_datang_selesai' => '07:00',
                        'jam_pulang_mulai' => '15:30',
                        'jam_pulang_selesai' => '22:00',
                    ],
                ],
            ]);

        $response->assertRedirect(route('workcodes.index'))
            ->assertSessionHasNoErrors()
            ->assertSessionHas('success', "Workcode 'Presensi Bebas 24 Jam' berhasil dibuat dan diaktifkan!");

        $this->assertDatabaseHas('workcodes', [
            'nama_workcode' => 'Presensi Bebas 24 Jam',
            'kategori' => '24_jam',
            'is_active' => true,
        ]);

        $workcode = Workcode::where('kategori', '24_jam')->firstOrFail();

        $this->assertNull($workcode->tanggal);
        $this->assertNull($workcode->hari_aktif);
        $this->assertNull($workcode->jam_datang_mulai);
        $this->assertNull($workcode->jam_datang_selesai);
        $this->assertNull($workcode->jam_pulang_mulai);
        $this->assertNull($workcode->jam_pulang_selesai);
        $this->assertNull($workcode->jadwal_per_hari);
    }

    public function test_24_hour_workcode_accepts_an_admin_scan_outside_daily_schedule_hours(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);
        $token = Str::uuid()->toString();
        $participant = Participant::create([
            'nama' => 'Peserta Dini Hari',
            'nis_nip' => '240001',
            'qr_token' => $token,
        ]);
        $workcode = Workcode::create([
            'nama_workcode' => 'Presensi Bebas 24 Jam',
            'kategori' => '24_jam',
            'is_active' => true,
        ]);

        $this->travelTo(Carbon::parse('2026-09-25 02:15:00', 'Asia/Jakarta'));

        $response = $this->actingAs($admin)->postJson(route('api.scan'), [
            'qr_token' => $token,
        ]);

        $response->assertOk()
            ->assertJson([
                'status' => 'success',
            ]);

        $attendance = Attendance::whereBelongsTo($workcode)
            ->whereBelongsTo($participant)
            ->firstOrFail();

        $this->assertSame('02:15', $attendance->waktu_hadir->format('H:i'));
    }

    public function test_admin_can_rename_an_active_workcode_with_database_formatted_times(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        $workcode = Workcode::create([
            'nama_workcode' => 'Presensi Harian Lama',
            'kategori' => 'harian',
            'hari_aktif' => [1, 2, 3, 4, 5],
            'jam_datang_mulai' => '06:00:00',
            'jam_datang_selesai' => '07:00:00',
            'jam_pulang_mulai' => '15:30:00',
            'jam_pulang_selesai' => '22:00:00',
            'radius_meters' => 100,
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)
            ->from(route('workcodes.index'))
            ->put(route('workcodes.update', $workcode), [
                'nama_workcode' => 'Presensi Harian Baru',
                'deskripsi' => null,
                'kategori' => 'harian',
                'tanggal' => null,
                'hari_aktif' => [1, 2, 3, 4, 5],
                'jam_datang_mulai' => '06:00:00',
                'jam_datang_selesai' => '07:00:00',
                'jam_pulang_mulai' => '15:30:00',
                'jam_pulang_selesai' => '22:00:00',
                'latitude' => null,
                'longitude' => null,
                'radius_meters' => 100,
                'jadwal_per_hari' => null,
            ]);

        $response->assertRedirect(route('workcodes.index'))
            ->assertSessionHasNoErrors()
            ->assertSessionHas('success', "Workcode 'Presensi Harian Baru' berhasil diperbarui.");

        $workcode->refresh();

        $this->assertSame('Presensi Harian Baru', $workcode->nama_workcode);
        $this->assertTrue($workcode->is_active);
    }
}
