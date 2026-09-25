<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Workcode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkcodeManagementTest extends TestCase
{
    use RefreshDatabase;

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
