<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\Participant;
use App\Models\User;
use App\Models\Workcode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Tests\TestCase;

/** Laporan: admin menandai hadir peserta yang tidak presensi pada acara yang sudah lewat/tidak aktif. */
class MarkPresentTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_past_event_marks_only_missing_eligible_participants_as_manual_present(): void
    {
        Carbon::setTestNow('2026-10-20 12:00:00');
        $workcode = $this->event();
        [$absent, $present, $outsider] = [$this->participant(), $this->participant(), $this->participant()];
        $workcode->participants()->attach([$absent->id, $present->id]);
        $existing = Attendance::create(['workcode_id' => $workcode->id, 'participant_id' => $present->id,
            'tanggal' => '2026-10-20', 'waktu_hadir' => '2026-10-20 07:05:00', 'status' => 'hadir', 'attendance_method' => 'wajah']);

        $this->actingAs($this->admin())
            ->post(route('admin.workcodes.mark-present', $workcode), [
                'participant_ids' => [$absent->id, $present->id, $outsider->id], 'jam' => '07:15',
            ])
            ->assertSessionHasNoErrors()
            ->assertSessionHas('success', '1 peserta ditandai hadir. 2 dilewati karena sudah tercatat atau bukan peserta acara ini.');

        $row = Attendance::where('participant_id', $absent->id)->sole();
        $this->assertSame('hadir', $row->status);
        $this->assertSame('manual', $row->attendance_method);
        $this->assertSame('2026-10-20 07:15:00', $row->waktu_hadir->format('Y-m-d H:i:s'));
        $this->assertSame('wajah', $existing->fresh()->attendance_method);
        $this->assertDatabaseMissing('attendances', ['participant_id' => $outsider->id]);
    }

    public function test_running_event_and_daily_workcode_are_rejected(): void
    {
        Carbon::setTestNow('2026-10-20 07:30:00');
        $running = $this->event();
        $daily = Workcode::create(['nama_workcode' => 'WFO', 'kategori' => 'harian', 'is_active' => false]);
        $participant = $this->participant();

        foreach ([$running, $daily] as $workcode) {
            $this->actingAs($this->admin())
                ->post(route('admin.workcodes.mark-present', $workcode), ['participant_ids' => [$participant->id], 'jam' => '07:00'])
                ->assertSessionHasErrors('participant_ids');
        }
        $this->assertSame(0, Attendance::count());
    }

    public function test_participant_cannot_mark_present(): void
    {
        Carbon::setTestNow('2026-10-20 12:00:00');
        $workcode = $this->event();
        $participant = $this->participant();
        $user = User::factory()->create(['role' => 'participant', 'participant_id' => $participant->id]);

        $this->actingAs($user)
            ->post(route('admin.workcodes.mark-present', $workcode), ['participant_ids' => [$participant->id], 'jam' => '07:00']);
        $this->assertSame(0, Attendance::count());
    }

    private function event(): Workcode
    {
        return Workcode::create(['nama_workcode' => 'Upacara', 'kategori' => 'workcode', 'is_active' => true,
            'tanggal' => '2026-10-20', 'jam_aktif_mulai' => '07:00:00', 'jam_aktif_selesai' => '09:00:00']);
    }

    private function participant(): Participant
    {
        return Participant::create(['nama' => 'Peserta '.Str::random(4), 'nis_nip' => Str::uuid()->toString(), 'qr_token' => Str::uuid()->toString()]);
    }

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }
}
