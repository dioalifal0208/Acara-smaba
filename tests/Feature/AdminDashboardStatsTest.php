<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\Participant;
use App\Models\User;
use App\Models\Workcode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminDashboardStatsTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_receives_chart_and_recent_attendance_data(): void
    {
        Carbon::setTestNow('2026-10-20 10:30:00');
        // Batas datang 07:15; Selasa (20 Okt) punya jadwal khusus 07:30.
        $workcode = Workcode::create([
            'nama_workcode' => 'Harian',
            'kategori' => 'harian',
            'is_active' => true,
            'jam_datang_selesai' => '07:15:00',
            'jadwal_per_hari' => [2 => ['jam_datang_selesai' => '07:30']],
        ]);

        $budi = $this->participant('Budi Santoso');
        $sari = $this->participant('Sari');
        $this->attend($workcode, $budi, '2026-10-20 07:05:00', 'wajah');
        $this->attend($workcode, $sari, '2026-10-20 07:40:00', 'qr_peserta');
        $this->attend($workcode, $budi, '2026-10-18 07:10:00', 'wajah');
        // Di luar 7 hari dan status bukan hadir tidak dihitung.
        $this->attend($workcode, $budi, '2026-10-10 07:00:00', 'wajah');
        $this->attend($workcode, $sari, '2026-10-19 07:00:00', 'manual', 'izin');

        $this->actingAs(User::factory()->create(['role' => 'admin']))
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->has('weekly', 7)
                ->where('weekly.6.date', '2026-10-20')
                ->where('weekly.6.value', 2)
                ->where('weekly.4.value', 1)
                ->where('weekly.5.value', 0)
                ->has('lateness', 7)
                ->where('lateness.6.date', '2026-10-20')
                ->where('lateness.6.total', 2)
                ->where('lateness.6.late', 1)
                ->where('lateness.4.late', 0)
                ->where('methods.0.key', 'wajah')
                ->where('methods.0.value', 1)
                ->where('methods.1.value', 1)
                ->has('recentAttendances', 2)
                ->where('recentAttendances.0.nama', 'Sari')
                ->where('recentAttendances.0.waktu', '07:40')
                ->where('recentAttendances.0.metode', 'QR Peserta'));
    }

    public function test_daily_kpi_counts_only_present_today(): void
    {
        Carbon::setTestNow('2026-10-20 10:30:00');
        $workcode = Workcode::create(['nama_workcode' => 'Harian', 'kategori' => 'harian', 'is_active' => true]);

        $budi = $this->participant('Budi');
        $sari = $this->participant('Sari');
        $andi = $this->participant('Andi');
        $this->participant('Dewi');

        $this->attend($workcode, $budi, '2026-10-20 07:05:00', 'wajah');
        // Hadir kemarin, lupa absen & izin hari ini (dari scheduler/persetujuan izin) bukan hadir hari ini.
        $this->attend($workcode, $sari, '2026-10-19 07:00:00', 'wajah');
        $this->attend($workcode, $sari, '2026-10-20 08:30:00', 'manual', 'lupa_absen');
        $this->attend($workcode, $andi, '2026-10-20 08:00:00', 'manual', 'izin');

        $this->actingAs(User::factory()->create(['role' => 'admin']))
            ->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('stats.total', 4)
                ->where('stats.hadir', 1)
                ->where('stats.belum', 3));
    }

    public function test_event_kpi_uses_selected_participants(): void
    {
        Carbon::setTestNow('2026-10-20 10:30:00');
        $workcode = Workcode::create(['nama_workcode' => 'Rapat', 'kategori' => 'workcode', 'is_active' => true]);

        $budi = $this->participant('Budi');
        $sari = $this->participant('Sari');
        $andi = $this->participant('Andi');
        $workcode->participants()->attach([$budi->id, $sari->id]);

        $this->attend($workcode, $budi, '2026-10-20 09:00:00', 'tanda_tangan');
        // Peserta yang tidak dipilih tidak ikut dihitung (mis. data lama sebelum pemilihan peserta).
        $this->attend($workcode, $andi, '2026-10-20 09:05:00', 'manual');

        $this->actingAs(User::factory()->create(['role' => 'admin']))
            ->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('stats.total', 2)
                ->where('stats.hadir', 1)
                ->where('stats.belum', 1));
    }

    public function test_welcome_page_exposes_no_attendance_data_to_the_public(): void
    {
        Carbon::setTestNow('2026-10-20 10:30:00');
        $workcode = Workcode::create(['nama_workcode' => 'Harian', 'kategori' => 'harian', 'is_active' => true]);
        $this->attend($workcode, $this->participant('Budi Santoso'), '2026-10-20 07:05:00', 'wajah');

        // Halaman depan publik hanya berisi informasi umum: tanpa statistik, nama, jam, atau versi server.
        $this->get('/')
            ->assertOk()
            ->assertDontSee('Budi')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Welcome')
                ->missing('stats')
                ->missing('board')
                ->missing('recentScans')
                ->missing('workcodeName')
                ->missing('laravelVersion')
                ->missing('phpVersion'));
    }

    public function test_scanner_stats_use_today_presence(): void
    {
        Carbon::setTestNow('2026-10-20 10:30:00');
        $workcode = Workcode::create(['nama_workcode' => 'Harian', 'kategori' => 'harian', 'is_active' => true]);

        $budi = $this->participant('Budi');
        $sari = $this->participant('Sari');
        $andi = $this->participant('Andi');
        $this->attend($workcode, $budi, '2026-10-19 07:00:00', 'wajah');
        $this->attend($workcode, $sari, '2026-10-20 08:30:00', 'manual', 'lupa_absen');

        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->get(route('scanner'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('initialStats.total', 3)
                ->where('initialStats.hadir', 0)
                ->where('initialStats.belum', 3));

        $this->actingAs($admin)
            ->postJson(route('scan'), ['qr_token' => $andi->qr_token])
            ->assertOk()
            ->assertJsonPath('stats.total', 3)
            ->assertJsonPath('stats.hadir', 1)
            ->assertJsonPath('stats.belum', 2);
    }

    public function test_dashboard_board_carries_todays_schedule(): void
    {
        Carbon::setTestNow('2026-10-20 10:30:00'); // Selasa
        Workcode::create([
            'nama_workcode' => 'Harian',
            'kategori' => 'harian',
            'is_active' => true,
            'hari_aktif' => [1, 2, 3, 4, 5],
            'jam_datang_mulai' => '06:00:00',
            'jam_datang_selesai' => '07:00:00',
            'jam_pulang_mulai' => '15:30:00',
            'jam_pulang_selesai' => '22:00:00',
        ]);
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('boards.0.jadwal.datang_mulai', '06:00')
                ->where('boards.0.jadwal.datang_selesai', '07:00')
                ->where('boards.0.jadwal.ditutup', '08:00')
                ->where('boards.0.jadwal.pulang_mulai', '15:30'));
    }

    public function test_scanner_accepts_a_typed_nip_when_the_qr_cannot_be_read(): void
    {
        Carbon::setTestNow('2026-10-20 10:30:00');
        $workcode = Workcode::create(['nama_workcode' => 'Harian', 'kategori' => 'harian', 'is_active' => true]);
        $andi = $this->participant('Andi');
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->postJson(route('scan'), ['nis_nip' => '  '.$andi->nis_nip.' '])
            ->assertOk()
            ->assertJsonPath('participant.id', $andi->id)
            ->assertJsonPath('board.total', 1)
            ->assertJsonPath('stats.hadir', 1);

        $this->assertSame('manual', Attendance::where('participant_id', $andi->id)->value('attendance_method'));

        $this->actingAs($admin)
            ->postJson(route('scan'), ['nis_nip' => 'tidak-ada'])
            ->assertNotFound()
            ->assertJsonPath('status', 'error');

        $this->actingAs($admin)->postJson(route('scan'), [])->assertUnprocessable();
    }

    private function participant(string $name): Participant
    {
        return Participant::create([
            'nama' => $name,
            'nis_nip' => Str::uuid()->toString(),
            'qr_token' => Str::uuid()->toString(),
        ]);
    }

    private function attend(Workcode $workcode, Participant $participant, string $time, string $method, string $status = 'hadir'): void
    {
        Attendance::create([
            'workcode_id' => $workcode->id,
            'participant_id' => $participant->id,
            'tanggal' => substr($time, 0, 10),
            'waktu_hadir' => $time,
            'status' => $status,
            'attendance_method' => $method,
        ]);
    }
}
