<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\Participant;
use App\Models\User;
use App\Models\Workcode;
use App\Services\AttendanceStateService;
use App\Services\SelfCheckInTokenService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class WorkcodeAutoAttendanceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('private');
        Carbon::setTestNow('2026-10-28 07:00:00');
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    public function test_stakeholder_is_marked_present_at_activity_start_not_when_admin_saves(): void
    {
        $stakeholder = Participant::create(['nama' => 'Kepala Sekolah', 'nis_nip' => '3001']);

        $this->store(['auto_participant_ids' => [$stakeholder->id]])->assertSessionHasNoErrors();
        $workcode = Workcode::firstOrFail();

        $this->assertSame([$stakeholder->id], $workcode->autoAttendees()->pluck('participants.id')->all());
        $this->assertDatabaseCount('attendances', 0);

        Carbon::setTestNow('2026-10-28 08:00:00');
        $this->artisan('workcode:auto-activate')->assertSuccessful();

        $attendance = Attendance::sole();
        $this->assertSame($stakeholder->id, $attendance->participant_id);
        $this->assertSame('hadir', $attendance->status);
        $this->assertSame(Attendance::METHOD_AUTO, $attendance->attendance_method);
        $this->assertSame('2026-10-28 08:00:00', $attendance->waktu_hadir->format('Y-m-d H:i:s'));

        // Idempoten: cron berikutnya tidak membuat baris baru.
        $this->artisan('workcode:auto-activate')->assertSuccessful();
        $this->assertDatabaseCount('attendances', 1);
    }

    public function test_saving_after_start_records_attendance_at_start_time(): void
    {
        Carbon::setTestNow('2026-10-28 09:15:00');
        $stakeholder = Participant::create(['nama' => 'Pengawas', 'nis_nip' => '3002']);

        $this->store(['auto_participant_ids' => [$stakeholder->id]])->assertSessionHasNoErrors();

        $this->assertSame('2026-10-28 08:00:00', Attendance::sole()->waktu_hadir->format('Y-m-d H:i:s'));
    }

    public function test_unchecking_or_rescheduling_updates_automatic_records_only(): void
    {
        Carbon::setTestNow('2026-10-28 09:00:00');
        $first = Participant::create(['nama' => 'Stakeholder Satu', 'nis_nip' => '3003']);
        $second = Participant::create(['nama' => 'Stakeholder Dua', 'nis_nip' => '3004']);
        $this->store(['auto_participant_ids' => [$first->id, $second->id]]);
        $workcode = Workcode::firstOrFail();

        // Stakeholder kedua punya izin: catatannya bukan lagi otomatis dan tidak boleh hilang.
        Attendance::where('participant_id', $second->id)->update(['status' => 'izin', 'attendance_method' => 'manual']);

        $this->update($workcode, ['jam_aktif_mulai' => '08:30', 'auto_participant_ids' => [$first->id]])->assertSessionHasNoErrors();

        $this->assertSame('2026-10-28 08:30:00', Attendance::where('participant_id', $first->id)->sole()->waktu_hadir->format('Y-m-d H:i:s'));
        $this->assertSame('izin', Attendance::where('participant_id', $second->id)->sole()->status);

        $this->update($workcode, ['auto_participant_ids' => []]);

        $this->assertDatabaseMissing('attendances', ['participant_id' => $first->id]);
        $this->assertDatabaseHas('attendances', ['participant_id' => $second->id, 'status' => 'izin']);
    }

    public function test_stakeholder_chosen_apart_from_participants_can_still_attend_restricted_workcode(): void
    {
        $selected = Participant::create(['nama' => 'Peserta Terpilih', 'nis_nip' => '3005']);
        $stakeholder = Participant::create(['nama' => 'Stakeholder Terpisah', 'nis_nip' => '3006']);
        $outsider = Participant::create(['nama' => 'Bukan Peserta', 'nis_nip' => '3011']);

        $this->store(['participant_ids' => [$selected->id], 'auto_participant_ids' => [$stakeholder->id]])
            ->assertSessionHasNoErrors();
        $workcode = Workcode::firstOrFail();

        $this->assertTrue($workcode->isAvailableFor($selected));
        $this->assertTrue($workcode->isAvailableFor($stakeholder));
        $this->assertFalse($workcode->isAvailableFor($outsider));
        $this->assertSame([$stakeholder->id], $workcode->autoAttendees()->pluck('participants.id')->all());
    }

    public function test_daily_workcode_ignores_auto_attendees(): void
    {
        $stakeholder = Participant::create(['nama' => 'Stakeholder Harian', 'nis_nip' => '3007']);

        $this->store([
            'kategori' => 'harian', 'tanggal' => null, 'jam_aktif_mulai' => null, 'jam_aktif_selesai' => null,
            'hari_aktif' => [1, 2, 3, 4, 5], 'auto_participant_ids' => [$stakeholder->id],
        ])->assertSessionHasNoErrors();

        $this->assertSame(0, Workcode::firstOrFail()->autoAttendees()->count());
    }

    public function test_open_workcode_stays_open_for_everyone_with_auto_attendees(): void
    {
        $stakeholder = Participant::create(['nama' => 'Tamu', 'nis_nip' => '3008']);
        $other = Participant::create(['nama' => 'Peserta Biasa', 'nis_nip' => '3009']);

        $this->store(['auto_participant_ids' => [$stakeholder->id]]);

        $this->assertTrue(Workcode::firstOrFail()->isAvailableFor($other));
    }

    public function test_stakeholder_scan_replaces_automatic_record(): void
    {
        Carbon::setTestNow('2026-10-28 09:00:00');
        $stakeholder = Participant::create(['nama' => 'Kepala Sekolah', 'nis_nip' => '3010']);
        $this->store(['auto_participant_ids' => [$stakeholder->id]]);
        $workcode = Workcode::firstOrFail();

        // Tombol presensi di aplikasi tetap terbuka walau sudah tercatat otomatis.
        $state = app(AttendanceStateService::class)->current($stakeholder);
        $this->assertSame('arrival', $state['attendance_ui']['action']);

        $token = app(SelfCheckInTokenService::class)->tokenFor($workcode);
        $this->postJson("/self-checkin/{$token}", [
            'participant_id' => $stakeholder->id,
            'device_id' => 'dev-1',
            'signature' => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
        ], ['User-Agent' => 'Agent-dev-1'])->assertOk()->assertJsonPath('status', 'success');

        $attendance = Attendance::sole();
        $this->assertSame('tanda_tangan', $attendance->attendance_method);
        $this->assertSame('2026-10-28 09:00:00', $attendance->waktu_hadir->format('Y-m-d H:i:s'));
        $this->assertNotNull($attendance->signature_path);

        // Cron tidak mengembalikan catatan otomatis setelah stakeholder scan sendiri.
        $this->artisan('workcode:auto-activate')->assertSuccessful();
        $this->assertSame('tanda_tangan', Attendance::sole()->attendance_method);
    }

    public function test_edit_form_receives_stakeholders_and_admin_can_add_them_on_update(): void
    {
        Carbon::setTestNow('2026-10-28 09:00:00');
        $peserta = Participant::create(['nama' => 'Peserta Biasa', 'nis_nip' => '3012']);
        $stakeholder = Participant::create(['nama' => 'Kepala Sekolah', 'nis_nip' => '3013']);
        $this->store(['participant_ids' => [$peserta->id]]);
        $workcode = Workcode::firstOrFail();
        $this->assertDatabaseCount('attendances', 0);

        // Stakeholder ditambahkan saat edit: langsung tercatat hadir karena kegiatan sudah mulai.
        $this->update($workcode, ['participant_ids' => [$peserta->id], 'auto_participant_ids' => [$stakeholder->id]])
            ->assertSessionHasNoErrors();
        $this->assertSame($stakeholder->id, Attendance::sole()->participant_id);

        // Form edit menerima daftar stakeholder sebagai `auto_attendees`.
        $this->actingAs($this->admin())->get(route('workcodes.index'))->assertOk()
            ->assertInertia(fn ($page) => $page->where('workcodes.0.auto_attendees.0.id', $stakeholder->id));
    }

    private function store(array $overrides = [])
    {
        return $this->actingAs($this->admin())->post(route('workcodes.store'), $this->payload($overrides));
    }

    private function update(Workcode $workcode, array $overrides = [])
    {
        return $this->actingAs($this->admin())->put(route('workcodes.update', $workcode), $this->payload($overrides));
    }

    private function payload(array $overrides): array
    {
        return array_merge([
            'nama_workcode' => 'Upacara Hari Sumpah Pemuda',
            'kategori' => 'workcode',
            'tanggal' => '2026-10-28',
            'jam_aktif_mulai' => '08:00',
            'jam_aktif_selesai' => '12:00',
            'radius_meters' => 100,
            'participant_ids' => [],
        ], $overrides);
    }

    private function admin(): User
    {
        return User::where('role', 'admin')->first() ?? User::factory()->create(['role' => 'admin']);
    }
}
