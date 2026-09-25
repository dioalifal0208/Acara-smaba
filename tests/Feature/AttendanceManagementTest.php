<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\Participant;
use App\Models\User;
use App\Models\Workcode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AttendanceManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_creates_single_attendance_workcode_without_checkout_time(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $workcode = $this->createWorkcode('workcode');
        $participant = $this->createParticipant();

        $response = $this->actingAs($admin)
            ->from(route('report', ['workcode_id' => $workcode->id]))
            ->post(route('admin.attendances.store'), [
                'workcode_id' => $workcode->id,
                'participant_id' => $participant->id,
                'tanggal' => '2026-09-25',
                'jam_masuk' => '09:15',
                'jam_pulang' => '17:00',
                'status' => 'hadir',
            ]);

        $response->assertRedirect(route('report', ['workcode_id' => $workcode->id]))
            ->assertSessionHasNoErrors();

        $attendance = Attendance::whereBelongsTo($workcode)
            ->whereBelongsTo($participant)
            ->firstOrFail();

        $this->assertSame('2026-09-25 09:15', $attendance->waktu_hadir->format('Y-m-d H:i'));
        $this->assertNull($attendance->waktu_pulang);
    }

    public function test_admin_updates_single_attendance_workcode_without_checkout_time(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $workcode = $this->createWorkcode('workcode');
        $attendance = $this->createAttendance($workcode);

        $response = $this->actingAs($admin)
            ->from(route('report', ['workcode_id' => $workcode->id]))
            ->put(route('admin.attendances.update', $attendance), [
                'tanggal' => '2026-09-25',
                'jam_masuk' => '09:15',
                'jam_pulang' => '17:00',
                'status' => 'hadir',
            ]);

        $response->assertRedirect(route('report', ['workcode_id' => $workcode->id]))
            ->assertSessionHasNoErrors();

        $attendance->refresh();

        $this->assertSame('2026-09-25 09:15', $attendance->waktu_hadir->format('Y-m-d H:i'));
        $this->assertNull($attendance->waktu_pulang);
    }

    public function test_admin_updates_daily_workcode_with_checkin_and_checkout_times(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $workcode = $this->createWorkcode('harian');
        $attendance = $this->createAttendance($workcode);

        $response = $this->actingAs($admin)
            ->from(route('report', ['workcode_id' => $workcode->id]))
            ->put(route('admin.attendances.update', $attendance), [
                'tanggal' => '2026-09-25',
                'jam_masuk' => '07:10',
                'jam_pulang' => '15:45',
                'status' => 'hadir',
            ]);

        $response->assertRedirect(route('report', ['workcode_id' => $workcode->id]))
            ->assertSessionHasNoErrors();

        $attendance->refresh();

        $this->assertSame('2026-09-25 07:10', $attendance->waktu_hadir->format('Y-m-d H:i'));
        $this->assertSame('2026-09-25 15:45', $attendance->waktu_pulang->format('Y-m-d H:i'));
    }

    private function createWorkcode(string $kategori): Workcode
    {
        return Workcode::create([
            'nama_workcode' => $kategori === 'harian' ? 'Presensi Harian' : 'Pembinaan Terkait',
            'kategori' => $kategori,
            'is_active' => true,
        ]);
    }

    private function createAttendance(Workcode $workcode): Attendance
    {
        return Attendance::create([
            'workcode_id' => $workcode->id,
            'participant_id' => $this->createParticipant()->id,
            'waktu_hadir' => '2026-09-25 08:00:00',
            'waktu_pulang' => '2026-09-25 16:00:00',
            'status' => 'hadir',
        ]);
    }

    private function createParticipant(): Participant
    {
        return Participant::create([
            'nama' => 'Pegawai Uji',
            'nis_nip' => '198001012006041001',
            'status' => 'PNS',
        ]);
    }
}
