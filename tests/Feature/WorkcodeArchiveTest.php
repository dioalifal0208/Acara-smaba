<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\Participant;
use App\Models\User;
use App\Models\Workcode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class WorkcodeArchiveTest extends TestCase
{
    use RefreshDatabase;

    public function test_archiving_keeps_attendance_and_never_activates(): void
    {
        Carbon::setTestNow('2026-10-29 09:00:00');
        $admin = User::factory()->create(['role' => 'admin']);
        $workcode = Workcode::create(['nama_workcode' => 'Rapat lama', 'kategori' => 'workcode', 'is_active' => false]);
        $participant = Participant::create(['nama' => 'Peserta', 'nis_nip' => '123']);
        Attendance::create([
            'workcode_id' => $workcode->id,
            'participant_id' => $participant->id,
            'tanggal' => '2026-10-01',
            'waktu_hadir' => '2026-10-01 07:00:00',
            'status' => 'hadir',
        ]);

        $this->actingAs($admin)->post(route('workcodes.archive', $workcode))->assertSessionHas('success');
        $this->assertNotNull($workcode->fresh()->archived_at);
        $this->assertSame(1, Attendance::where('workcode_id', $workcode->id)->count());

        // Diarsipkan: tidak bisa diaktifkan dan tidak pernah terhitung aktif.
        $this->actingAs($admin)->post(route('workcodes.activate', $workcode))->assertSessionHas('error');
        $workcode->update(['is_active' => true]);
        $this->assertTrue(Workcode::getActiveWorkcodes()->isEmpty());

        $this->actingAs($admin)->post(route('workcodes.unarchive', $workcode))->assertSessionHas('success');
        $this->assertNull($workcode->fresh()->archived_at);
    }

    public function test_active_workcode_cannot_be_archived(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $workcode = Workcode::create(['nama_workcode' => 'Harian', 'kategori' => 'harian', 'is_active' => true]);

        $this->actingAs($admin)->post(route('workcodes.archive', $workcode))->assertSessionHas('error');
        $this->assertNull($workcode->fresh()->archived_at);
    }
}
