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
