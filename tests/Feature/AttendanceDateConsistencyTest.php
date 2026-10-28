<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\Participant;
use App\Models\User;
use App\Models\Workcode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Hari presensi ditentukan kolom `tanggal` (bagian unique key), bukan created_at. Keduanya bisa
 * berbeda bila admin menambah/mengubah presensi manual untuk tanggal lain.
 */
class AttendanceDateConsistencyTest extends TestCase
{
    use RefreshDatabase;

    public function test_scanner_does_not_record_checkout_on_yesterdays_row(): void
    {
        Carbon::setTestNow('2026-10-20 07:15:00');
        $workcode = $this->dailyWorkcode();
        $participant = $this->participant();
        $yesterday = $this->manualRow($workcode, $participant, '2026-10-19');

        $this->actingAs($this->admin())
            ->postJson(route('scan'), ['qr_token' => $participant->qr_token])
            ->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('message', 'Presensi berhasil dicatat!');

        $this->assertNull($yesterday->fresh()->waktu_pulang);
        $this->assertDatabaseHas('attendances', ['participant_id' => $participant->id, 'tanggal' => '2026-10-20', 'attendance_method' => 'qr_peserta']);
    }

    public function test_individual_recap_groups_rows_by_tanggal(): void
    {
        // Presensi 30 Sep yang baru dicatat admin pada 2 Okt harus masuk rekap September.
        Carbon::setTestNow('2026-10-02 09:00:00');
        $workcode = $this->dailyWorkcode();
        $participant = $this->participant();
        $this->manualRow($workcode, $participant, '2026-09-30');

        $admin = $this->admin();
        $september = $this->actingAs($admin)
            ->getJson(route('report.individual', [$workcode, $participant]).'?year=2026&month=9')
            ->assertOk()
            ->json('attendances');
        $this->assertContains('2026-09-30', array_column($september, 'tanggal'));
        $this->assertSame('hadir', collect($september)->firstWhere('tanggal', '2026-09-30')['status']);

        $october = $this->actingAs($admin)
            ->getJson(route('report.individual', [$workcode, $participant]).'?year=2026&month=10')
            ->assertOk()
            ->json('attendances');
        $this->assertNotContains('hadir', array_column($october, 'status'));
    }

    public function test_history_api_orders_by_tanggal_and_exposes_it(): void
    {
        Carbon::setTestNow('2026-10-20 10:00:00');
        $workcode = $this->dailyWorkcode();
        $participant = $this->participant();
        $this->manualRow($workcode, $participant, '2026-10-20');
        // Dibuat paling akhir tetapi untuk tanggal paling lama.
        Carbon::setTestNow('2026-10-20 11:00:00');
        $this->manualRow($workcode, $participant, '2026-10-01');

        Sanctum::actingAs(User::factory()->create(['role' => 'participant', 'participant_id' => $participant->id]), ['role:participant']);

        $this->getJson('/api/v1/attendance-history')
            ->assertOk()
            ->assertJsonPath('data.0.tanggal', '2026-10-20')
            ->assertJsonPath('data.1.tanggal', '2026-10-01');

        $this->getJson('/api/v1/attendance-history/daily')
            ->assertOk()
            ->assertJsonPath('data.0.tanggal', '2026-10-20')
            ->assertJsonPath('data.1.tanggal', '2026-10-01')
            // Selasa 20 Okt: jadwal khusus dari jadwal_per_hari[2], kolom kosong dari jam bawaan.
            ->assertJsonPath('data.0.jadwal_hari_ini.jam_datang_selesai', '07:45')
            ->assertJsonPath('data.0.jadwal_hari_ini.jam_pulang_selesai', '16:00:00');
    }

    private function dailyWorkcode(): Workcode
    {
        return Workcode::create([
            'nama_workcode' => 'Harian',
            'kategori' => 'harian',
            'is_active' => true,
            'jam_datang_mulai' => '07:00:00',
            'jam_datang_selesai' => '07:30:00',
            'jam_pulang_mulai' => '15:00:00',
            'jam_pulang_selesai' => '16:00:00',
            'jadwal_per_hari' => [2 => ['jam_datang_selesai' => '07:45']],
        ]);
    }

    /** Presensi manual untuk $tanggal, dibuat "sekarang" (created_at = waktu test). */
    private function manualRow(Workcode $workcode, Participant $participant, string $tanggal): Attendance
    {
        return Attendance::create([
            'workcode_id' => $workcode->id,
            'participant_id' => $participant->id,
            'tanggal' => $tanggal,
            'waktu_hadir' => "{$tanggal} 07:05:00",
            'status' => 'hadir',
            'attendance_method' => 'manual',
        ]);
    }

    private function participant(): Participant
    {
        return Participant::create(['nama' => 'Budi', 'nis_nip' => Str::uuid()->toString(), 'qr_token' => Str::uuid()->toString()]);
    }

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }
}
