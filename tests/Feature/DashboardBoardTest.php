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

/** Papan Hadir dashboard: tepat waktu, terlambat, izin, dan belum per workcode aktif. */
class DashboardBoardTest extends TestCase
{
    use RefreshDatabase;

    public function test_board_splits_today_presence_into_four_segments(): void
    {
        Carbon::setTestNow('2026-10-20 10:30:00');
        $workcode = Workcode::create([
            'nama_workcode' => 'Harian',
            'kategori' => 'harian',
            'is_active' => true,
            'jam_datang_mulai' => '06:00',
            'jam_datang_selesai' => '07:00',
        ]);

        $budi = $this->participant('Budi');
        $sari = $this->participant('Sari');
        $andi = $this->participant('Andi');
        $dewi = $this->participant('Dewi');
        $eko = $this->participant('Eko');
        $this->participant('Fajar');

        $this->attend($workcode, $budi, '2026-10-20 06:50:00', 'hadir');
        $this->attend($workcode, $sari, '2026-10-20 07:30:00', 'hadir');
        $this->attend($workcode, $andi, '2026-10-20 08:00:00', 'izin');
        $this->attend($workcode, $dewi, '2026-10-20 08:00:00', 'sakit');
        // Alpha dan presensi kemarin tidak mengurangi "belum".
        $this->attend($workcode, $eko, '2026-10-20 09:00:00', 'alpha');
        $this->attend($workcode, $eko, '2026-10-19 06:40:00', 'hadir');

        $this->actingAs(User::factory()->create(['role' => 'admin']))
            ->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->has('boards', 1)
                ->where('boards.0.nama', 'Harian')
                ->where('boards.0.counts.total', 6)
                ->where('boards.0.counts.tepat_waktu', 1)
                ->where('boards.0.counts.terlambat', 1)
                ->where('boards.0.counts.izin', 2)
                ->where('boards.0.counts.belum', 2)
                ->where('recentAttendances.0.nama', 'Sari')
                ->where('recentAttendances.0.terlambat', true)
                ->where('recentAttendances.1.terlambat', false));
    }

    public function test_workcode_list_carries_board_only_for_active_workcodes(): void
    {
        Carbon::setTestNow('2026-10-20 10:30:00');
        $active = Workcode::create(['nama_workcode' => 'Harian', 'kategori' => 'harian', 'is_active' => true, 'jam_datang_selesai' => '07:00']);
        Workcode::create(['nama_workcode' => 'Lama', 'kategori' => 'harian', 'is_active' => false]);
        $this->attend($active, $this->participant('Budi'), '2026-10-20 06:50:00', 'hadir');
        $this->participant('Sari');

        $this->actingAs(User::factory()->create(['role' => 'admin']))
            ->get(route('workcodes.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('workcodes.0.nama_workcode', 'Harian')
                ->where('workcodes.0.board.tepat_waktu', 1)
                ->where('workcodes.0.board.belum', 1)
                ->where('workcodes.1.board', null));
    }

    public function test_board_is_empty_without_active_workcode(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']))
            ->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page->has('boards', 0));
    }

    private function participant(string $name): Participant
    {
        return Participant::create([
            'nama' => $name,
            'nis_nip' => Str::uuid()->toString(),
            'qr_token' => Str::uuid()->toString(),
        ]);
    }

    private function attend(Workcode $workcode, Participant $participant, string $time, string $status): void
    {
        Attendance::create([
            'workcode_id' => $workcode->id,
            'participant_id' => $participant->id,
            'tanggal' => substr($time, 0, 10),
            'waktu_hadir' => $time,
            'status' => $status,
            'attendance_method' => 'wajah',
        ]);
    }
}
