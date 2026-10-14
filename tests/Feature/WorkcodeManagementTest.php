<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Workcode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Kreait\Firebase\Contract\Messaging;
use Tests\TestCase;

class WorkcodeManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_cannot_create_a_removed_24_hour_workcode_category(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)
            ->from(route('workcodes.index'))
            ->post(route('workcodes.store'), [
                'nama_workcode' => 'Kategori Lama',
                'kategori' => '24_jam',
                'radius_meters' => 100,
                'set_active' => true,
            ]);

        $response->assertRedirect(route('workcodes.index'))
            ->assertSessionHasErrors('kategori');

        $this->assertDatabaseMissing('workcodes', [
            'nama_workcode' => 'Kategori Lama',
        ]);
    }

    public function test_admin_cannot_update_a_workcode_to_removed_24_hour_category(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $workcode = Workcode::create([
            'nama_workcode' => 'Kegiatan Sekolah',
            'kategori' => 'workcode',
        ]);

        $response = $this->actingAs($admin)
            ->from(route('workcodes.index'))
            ->put(route('workcodes.update', $workcode), [
                'nama_workcode' => 'Kategori Lama',
                'kategori' => '24_jam',
                'radius_meters' => 100,
            ]);

        $response->assertRedirect(route('workcodes.index'))
            ->assertSessionHasErrors('kategori');

        $this->assertSame('workcode', $workcode->fresh()->kategori);
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

    public function test_workcode_name_cannot_be_the_logged_in_account_identity(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'username' => 'admin', 'email' => 'admin@smaba.sch.id']);
        $workcode = Workcode::create(['nama_workcode' => 'Rapat Pleno', 'kategori' => 'workcode']);

        foreach (['admin', ' Admin ', 'admin@smaba.sch.id', $admin->name] as $autofilled) {
            $this->actingAs($admin)
                ->from(route('workcodes.index'))
                ->post(route('workcodes.store'), [
                    'nama_workcode' => $autofilled,
                    'kategori' => 'harian',
                    'radius_meters' => 100,
                ])
                ->assertSessionHasErrors('nama_workcode');

            $this->actingAs($admin)
                ->from(route('workcodes.index'))
                ->put(route('workcodes.update', $workcode), [
                    'nama_workcode' => $autofilled,
                    'kategori' => 'workcode',
                    'radius_meters' => 100,
                ])
                ->assertSessionHasErrors('nama_workcode');
        }

        $this->assertSame('Rapat Pleno', $workcode->fresh()->nama_workcode);
        $this->assertSame(1, Workcode::count());
    }

    public function test_workcode_actions_still_work_when_firebase_is_not_configured(): void
    {
        $this->app->bind(Messaging::class, function () {
            throw new \RuntimeException('Unable to determine the Firebase Project ID');
        });

        $admin = User::factory()->create(['role' => 'admin']);
        $workcode = Workcode::create([
            'nama_workcode' => 'Kegiatan Sekolah',
            'kategori' => 'workcode',
            'is_active' => true,
        ]);

        $this->actingAs($admin)
            ->from(route('workcodes.index'))
            ->post(route('workcodes.deactivate', $workcode))
            ->assertRedirect(route('workcodes.index'));
        $this->assertFalse($workcode->fresh()->is_active);

        $this->actingAs($admin)
            ->from(route('workcodes.index'))
            ->post(route('workcodes.activate', $workcode))
            ->assertRedirect(route('workcodes.index'));
        $this->assertTrue($workcode->fresh()->is_active);
    }
}
