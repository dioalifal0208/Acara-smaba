<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\Participant;
use App\Models\User;
use App\Models\Workcode;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ParticipantTodayTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_dashboard_shows_todays_daily_attendance_schedule_and_server_date(): void
    {
        // Selasa 06:30 WIB: tanggal UTC di browser masih hari sebelumnya.
        Carbon::setTestNow(Carbon::parse('2026-10-27 06:30:00', 'Asia/Jakarta'));
        config(['attendance.late_tolerance_minutes' => 60]);

        $daily = Workcode::create([
            'nama_workcode' => 'Presensi harian',
            'kategori' => 'harian',
            'is_active' => true,
            'hari_aktif' => [1, 2, 3, 4, 5],
            'jam_datang_mulai' => '06:00',
            'jam_datang_selesai' => '07:00',
            'jam_pulang_mulai' => '15:30',
            'jam_pulang_selesai' => '22:00',
        ]);
        [$user, $participant] = $this->participantUser();
        Attendance::create([
            'workcode_id' => $daily->id,
            'participant_id' => $participant->id,
            'tanggal' => '2026-10-27',
            'waktu_hadir' => '2026-10-27 07:12:00',
            'status' => 'hadir',
            'attendance_method' => 'wajah',
        ]);

        $this->actingAs($user)
            ->get(route('participant.dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Participant/Dashboard')
                ->where('today', '2026-10-27')
                ->where('schedule.datang_selesai', '07:00')
                ->where('schedule.ditutup', '08:00')
                ->where('schedule.pulang_mulai', '15:30')
                ->where('todayAttendances.0.harian', true)
                ->where('todayAttendances.0.datang', '07:12')
                ->where('todayAttendances.0.terlambat', 12)
                ->where('leaveWorkcodes.0.id', $daily->id));
    }

    public function test_leave_can_target_daily_workcode_on_a_day_off(): void
    {
        // Minggu: tidak ada jadwal harian, tetapi izin tetap bisa diajukan ke presensi harian.
        Carbon::setTestNow(Carbon::parse('2026-10-25 20:00:00', 'Asia/Jakarta'));
        $daily = Workcode::create(['nama_workcode' => 'Presensi harian', 'kategori' => 'harian', 'is_active' => true, 'hari_aktif' => [1, 2, 3, 4, 5]]);
        [$user] = $this->participantUser();

        $this->actingAs($user)
            ->get(route('participant.dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('schedule', null)
                ->where('todayAttendances', [])
                ->where('leaveWorkcodes', [['id' => $daily->id, 'nama_workcode' => 'Presensi harian']]));
    }

    public function test_daily_workcode_for_other_participants_is_not_offered(): void
    {
        $daily = Workcode::create(['nama_workcode' => 'Harian TU', 'kategori' => 'harian', 'is_active' => true, 'hari_aktif' => [1, 2, 3, 4, 5, 6, 7]]);
        $other = Participant::create(['nama' => 'Lain', 'nis_nip' => Str::uuid()->toString(), 'qr_token' => Str::uuid()->toString()]);
        $daily->participants()->attach($other->id);
        [$user] = $this->participantUser();

        $this->actingAs($user)
            ->get(route('participant.dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('schedule', null)
                ->where('leaveWorkcodes', []));
    }

    /** @return array{0: User, 1: Participant} */
    private function participantUser(): array
    {
        $participant = Participant::create(['nama' => 'Budi', 'nis_nip' => Str::uuid()->toString(), 'qr_token' => Str::uuid()->toString()]);
        $user = User::factory()->create(['role' => 'participant', 'participant_id' => $participant->id]);

        return [$user, $participant];
    }
}
