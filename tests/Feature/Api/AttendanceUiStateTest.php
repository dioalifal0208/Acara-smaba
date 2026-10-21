<?php

namespace Tests\Feature\Api;

use App\Models\Attendance;
use App\Models\Participant;
use App\Models\User;
use App\Models\Workcode;
use App\Services\AttendanceValidationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * data.attendance_ui pada GET /api/v1/workcodes/active: status tombol presensi diputuskan server.
 */
class AttendanceUiStateTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    public function test_action_is_arrival_inside_server_arrival_window(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-10-20 07:15:00', 'Asia/Jakarta'));
        $this->actingParticipant();
        $this->createDailyWorkcode();

        $this->getJson('/api/v1/workcodes/active')
            ->assertOk()
            // Field lama tetap ada.
            ->assertJsonPath('data.workcode_aktif.jam_datang_mulai', '07:00:00')
            ->assertJsonPath('data.presensi_hari_ini', null)
            ->assertJsonPath('data.attendance_ui.action', 'arrival')
            ->assertJsonPath('data.attendance_ui.action_label', 'Absen Datang')
            ->assertJsonPath('data.attendance_ui.reason', 'arrival_open')
            ->assertJsonPath('data.attendance_ui.message', null)
            ->assertJsonPath('data.attendance_ui.server_time', '2026-10-20T07:15:00+07:00')
            ->assertJsonPath('data.attendance_ui.effective_schedule', [
                'arrival' => [
                    'start' => '2026-10-20T07:00:00+07:00',
                    'end' => '2026-10-20T08:00:00+07:00',
                    'closes_at' => '2026-10-20T09:00:00+07:00',
                    'display' => '07:00–08:00',
                ],
                'departure' => [
                    'start' => '2026-10-20T15:00:00+07:00',
                    'end' => '2026-10-20T16:00:00+07:00',
                    'closes_at' => '2026-10-20T16:00:00+07:00',
                    'display' => '15:00–16:00',
                ],
            ]);
    }

    public function test_action_is_departure_after_check_in_inside_server_departure_window(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-10-20 15:30:00', 'Asia/Jakarta'));
        $participant = $this->actingParticipant();
        $workcode = $this->createDailyWorkcode();
        $this->checkIn($workcode, $participant);

        $this->getJson('/api/v1/workcodes/active')
            ->assertOk()
            ->assertJsonPath('data.attendance_ui.action', 'departure')
            ->assertJsonPath('data.attendance_ui.action_label', 'Absen Pulang')
            ->assertJsonPath('data.attendance_ui.reason', 'departure_open');
    }

    public function test_action_is_none_outside_server_windows(): void
    {
        $participant = $this->actingParticipant();

        Carbon::setTestNow(Carbon::parse('2026-10-20 06:59:00', 'Asia/Jakarta'));
        $workcode = $this->createDailyWorkcode();
        $this->assertUi('none', 'arrival_not_open');

        // Jam datang selesai 08:00 + toleransi terlambat 60 menit: ditutup setelah 09:00.
        Carbon::setTestNow(Carbon::parse('2026-10-20 09:01:00', 'Asia/Jakarta'));
        $this->assertUi('none', 'arrival_closed');

        // Sudah datang, tetapi jendela pulang belum dibuka / sudah ditutup.
        $this->checkIn($workcode, $participant);
        Carbon::setTestNow(Carbon::parse('2026-10-20 14:59:00', 'Asia/Jakarta'));
        $this->assertUi('none', 'departure_not_open');

        Carbon::setTestNow(Carbon::parse('2026-10-20 16:01:00', 'Asia/Jakarta'));
        $this->assertUi('none', 'departure_closed');
    }

    public function test_arrival_stays_open_as_late_within_tolerance(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-10-20 08:25:00', 'Asia/Jakarta'));
        $this->actingParticipant();
        $this->createDailyWorkcode();

        $this->getJson('/api/v1/workcodes/active')
            ->assertOk()
            ->assertJsonPath('data.attendance_ui.action', 'arrival')
            ->assertJsonPath('data.attendance_ui.reason', 'arrival_open')
            ->assertJsonPath('data.attendance_ui.is_late', true)
            ->assertJsonPath('data.attendance_ui.late_minutes', 25)
            ->assertJsonPath('data.attendance_ui.message', 'Anda terlambat 25 menit. Presensi datang ditutup pukul 09:00 WIB.');

        $this->postJson('/api/v1/attendance', $this->payload(), ['Idempotency-Key' => Str::uuid()->toString()])
            ->assertCreated()
            ->assertJsonPath('data.attendance.status', 'hadir')
            ->assertJsonPath('data.attendance.is_late', true)
            ->assertJsonPath('data.attendance.late_minutes', 25)
            ->assertJsonPath('message', 'Presensi datang berhasil dicatat, tetapi terlambat 25 menit.');

        // Tepat waktu: tidak terlambat.
        Attendance::query()->delete();
        Carbon::setTestNow(Carbon::parse('2026-10-20 07:30:00', 'Asia/Jakarta'));
        $this->getJson('/api/v1/workcodes/active')
            ->assertJsonPath('data.attendance_ui.is_late', false)
            ->assertJsonPath('data.attendance_ui.late_minutes', 0);

        // Lewat toleransi: ditolak.
        Carbon::setTestNow(Carbon::parse('2026-10-20 09:01:00', 'Asia/Jakarta'));
        $this->postJson('/api/v1/attendance', $this->payload(), ['Idempotency-Key' => Str::uuid()->toString()])
            ->assertStatus(400);
    }

    public function test_forgotten_arrival_message_does_not_claim_arrival_was_recorded(): void
    {
        $participant = $this->actingParticipant();
        Carbon::setTestNow(Carbon::parse('2026-10-20 09:05:00', 'Asia/Jakarta'));
        $workcode = $this->createDailyWorkcode();
        // Dibuat attendance:calculate-alpha setelah toleransi datang habis.
        Attendance::create([
            'workcode_id' => $workcode->id,
            'participant_id' => $participant->id,
            'tanggal' => now()->toDateString(),
            'status' => 'lupa_absen',
        ]);

        Carbon::setTestNow(Carbon::parse('2026-10-20 10:00:00', 'Asia/Jakarta'));
        $this->getJson('/api/v1/workcodes/active')
            ->assertJsonPath('data.attendance_ui.reason', 'departure_not_open')
            ->assertJsonPath('data.attendance_ui.message', 'Anda tidak melakukan presensi datang hari ini (tercatat lupa absen). Presensi pulang baru dibuka pukul 15:00 WIB.');

        // Presensi pulang tetap dibuka sesuai jadwal.
        Carbon::setTestNow(Carbon::parse('2026-10-20 15:30:00', 'Asia/Jakarta'));
        $this->getJson('/api/v1/workcodes/active')
            ->assertJsonPath('data.attendance_ui.action', 'departure')
            ->assertJsonPath('data.attendance_ui.reason', 'departure_open')
            ->assertJsonPath('data.attendance_ui.message', 'Anda tidak melakukan presensi datang hari ini (tercatat lupa absen).');

        Carbon::setTestNow(Carbon::parse('2026-10-20 16:01:00', 'Asia/Jakarta'));
        $this->getJson('/api/v1/workcodes/active')
            ->assertJsonPath('data.attendance_ui.reason', 'departure_closed')
            ->assertJsonPath('data.attendance_ui.message', 'Anda tidak melakukan presensi datang hari ini (tercatat lupa absen). Waktu presensi pulang sudah ditutup (15:00 – 16:00 WIB).');
    }

    public function test_departure_has_no_late_tolerance(): void
    {
        $participant = $this->actingParticipant();
        Carbon::setTestNow(Carbon::parse('2026-10-20 15:30:00', 'Asia/Jakarta'));
        $workcode = $this->createDailyWorkcode();
        $this->checkIn($workcode, $participant);

        Carbon::setTestNow(Carbon::parse('2026-10-20 16:01:00', 'Asia/Jakarta'));
        $this->assertUi('none', 'departure_closed');
        $this->postJson('/api/v1/attendance', $this->payload(), ['Idempotency-Key' => Str::uuid()->toString()])
            ->assertStatus(400);
    }

    public function test_late_tolerance_does_not_pass_midnight(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-10-20 23:58:00', 'Asia/Jakarta'));
        $this->actingParticipant();
        $this->createDailyWorkcode([
            'jam_datang_mulai' => '23:00:00',
            'jam_datang_selesai' => '23:30:00',
            'jam_pulang_mulai' => null,
            'jam_pulang_selesai' => null,
        ]);

        $this->getJson('/api/v1/workcodes/active')
            ->assertJsonPath('data.attendance_ui.reason', 'arrival_open')
            ->assertJsonPath('data.attendance_ui.effective_schedule.arrival.closes_at', '2026-10-20T23:59:59+07:00');
    }

    public function test_device_time_in_request_does_not_affect_action(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-10-20 06:00:00', 'Asia/Jakarta'));
        $this->actingParticipant();
        $this->createDailyWorkcode();

        $this->getJson('/api/v1/workcodes/active?device_timestamp=2026-10-20T07:30:00%2B07:00', [
            'Date' => 'Tue, 20 Oct 2026 00:30:00 GMT',
        ])->assertOk()->assertJsonPath('data.attendance_ui.action', 'none');
    }

    public function test_action_is_none_after_attendance_is_complete(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-10-20 15:30:00', 'Asia/Jakarta'));
        $participant = $this->actingParticipant();
        $workcode = $this->createDailyWorkcode();
        $this->checkIn($workcode, $participant)->update(['waktu_pulang' => now()->subMinutes(5)]);

        $this->assertUi('none', 'completed');
    }

    public function test_action_is_none_without_active_workcode_and_legacy_data_stays_null(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-10-20 07:15:00', 'Asia/Jakarta'));
        $this->actingParticipant();

        $this->getJson('/api/v1/workcodes/active')
            ->assertOk()
            ->assertJsonPath('data', null)
            ->assertJsonPath('attendance_ui.action', 'none')
            ->assertJsonPath('attendance_ui.action_label', null)
            ->assertJsonPath('attendance_ui.reason', 'no_active_workcode')
            ->assertJsonPath('attendance_ui.server_time', '2026-10-20T07:15:00+07:00')
            ->assertJsonPath('attendance_ui.effective_schedule', null);
    }

    public function test_action_is_none_for_unassigned_participant(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-10-20 07:15:00', 'Asia/Jakarta'));
        $this->actingParticipant();
        $other = Participant::create([
            'nama' => 'Peserta Lain', 'nis_nip' => 'other-'.Str::random(8), 'qr_token' => Str::uuid(),
        ]);
        $this->createDailyWorkcode()->participants()->attach($other);

        $this->getJson('/api/v1/workcodes/active')
            ->assertOk()
            ->assertJsonPath('data', null)
            ->assertJsonPath('attendance_ui.action', 'none')
            ->assertJsonPath('attendance_ui.reason', 'not_assigned');
    }

    public function test_event_workcode_allows_single_arrival_without_departure(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-10-20 08:00:00', 'Asia/Jakarta'));
        $participant = $this->actingParticipant();
        $workcode = Workcode::create([
            'nama_workcode' => 'Kegiatan Pagi',
            'kategori' => 'workcode',
            'tanggal' => '2026-10-20',
            'jam_aktif_mulai' => '07:00:00',
            'jam_aktif_selesai' => '10:00:00',
        ]);

        $this->getJson('/api/v1/workcodes/active')
            ->assertOk()
            ->assertJsonPath('data.attendance_ui.action', 'arrival')
            ->assertJsonPath('data.attendance_ui.effective_schedule.arrival.display', '07:00–10:00')
            ->assertJsonPath('data.attendance_ui.effective_schedule.departure', ['start' => null, 'end' => null, 'closes_at' => null, 'display' => null]);

        $this->checkIn($workcode, $participant);
        $this->assertUi('none', 'completed');
    }

    public function test_effective_schedule_follows_per_day_schedule_used_by_attendance_validation(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-10-20 06:10:00', 'Asia/Jakarta'));
        $this->actingParticipant();
        $workcode = $this->createDailyWorkcode([
            'jadwal_per_hari' => [
                now()->dayOfWeekIso => [
                    'jam_datang_mulai' => '06:00',
                    'jam_datang_selesai' => '06:30',
                    'jam_pulang_mulai' => '13:00',
                    'jam_pulang_selesai' => '14:00',
                ],
            ],
        ]);

        $service = app(AttendanceValidationService::class);
        $this->assertSame(['06:00', '06:30'], $service->todayWindow($workcode, false));
        $this->assertSame(['13:00', '14:00'], $service->todayWindow($workcode, true));

        $this->getJson('/api/v1/workcodes/active')
            ->assertOk()
            ->assertJsonPath('data.attendance_ui.action', 'arrival')
            ->assertJsonPath('data.attendance_ui.effective_schedule.arrival.display', '06:00–06:30')
            ->assertJsonPath('data.attendance_ui.effective_schedule.arrival.start', '2026-10-20T06:00:00+07:00')
            ->assertJsonPath('data.attendance_ui.effective_schedule.departure.display', '13:00–14:00');

        // Keputusan tombol sama dengan validasi POST /attendance pada waktu server yang sama.
        $this->postJson('/api/v1/attendance', $this->payload(), ['Idempotency-Key' => Str::uuid()->toString()])
            ->assertCreated();

        // Jam umum (07:00–08:00) tidak berlaku hari ini karena ada jadwal per hari (06:30 + toleransi = 07:30).
        Carbon::setTestNow(Carbon::parse('2026-10-20 07:31:00', 'Asia/Jakarta'));
        Attendance::query()->delete();
        $this->assertUi('none', 'arrival_closed');
        $this->postJson('/api/v1/attendance', $this->payload(), ['Idempotency-Key' => Str::uuid()->toString()])
            ->assertStatus(400);
    }

    public function test_legacy_descriptor_requires_reenrollment_in_face_state(): void
    {
        $participant = Participant::create([
            'nama' => 'Peserta Descriptor Lama',
            'nis_nip' => 'legacy-'.Str::random(8),
            'qr_token' => Str::uuid(),
            'face_descriptor' => array_fill(0, 512, 0.1),
            'face_status' => 'approved',
        ]);

        $face = $participant->faceState();

        $this->assertSame('approved', $face['status']);
        $this->assertFalse($face['ready']);
        $this->assertSame('face_reenroll_required', $face['blocker']['status']);
        $this->assertSame(0, $face['sample_count']);
        $this->assertTrue($face['can_enroll']);
        $this->assertFalse($face['locked']);
        $this->assertNull($face['retry_after_seconds']);
    }

    private function assertUi(string $action, string $reason): void
    {
        $this->getJson('/api/v1/workcodes/active')
            ->assertOk()
            ->assertJsonPath('data.attendance_ui.action', $action)
            ->assertJsonPath('data.attendance_ui.reason', $reason)
            ->assertJsonPath('data.attendance_ui.action_label', $action === 'none' ? null : ($action === 'arrival' ? 'Absen Datang' : 'Absen Pulang'));
    }

    private function actingParticipant(): Participant
    {
        $participant = Participant::create([
            'nama' => 'Peserta Login',
            'nis_nip' => 'participant-'.Str::random(8),
            'qr_token' => Str::uuid(),
            'face_descriptor' => $this->descriptor(),
            'face_status' => 'approved',
        ]);
        $user = User::factory()->create(['role' => 'participant', 'participant_id' => $participant->id]);
        Sanctum::actingAs($user, ['role:participant']);

        return $participant;
    }

    private function createDailyWorkcode(array $attributes = []): Workcode
    {
        return Workcode::create(array_merge([
            'nama_workcode' => 'Harian Test UI',
            'kategori' => 'harian',
            'is_active' => true,
            'hari_aktif' => [now()->dayOfWeekIso],
            'jam_datang_mulai' => '07:00:00',
            'jam_datang_selesai' => '08:00:00',
            'jam_pulang_mulai' => '15:00:00',
            'jam_pulang_selesai' => '16:00:00',
        ], $attributes));
    }

    private function checkIn(Workcode $workcode, Participant $participant): Attendance
    {
        return Attendance::create([
            'workcode_id' => $workcode->id,
            'participant_id' => $participant->id,
            'tanggal' => now()->toDateString(),
            'waktu_hadir' => now(),
            'device_hash' => hash('sha256', Str::uuid()->toString()),
            'status' => 'hadir',
            'attendance_method' => 'wajah',
        ]);
    }

    private function payload(): array
    {
        return [
            'latitude' => -6.1234,
            'longitude' => 106.1234,
            'accuracy' => 10,
            'device_timestamp' => now()->toIso8601String(),
            'installation_id' => Str::uuid()->toString(),
            'face_descriptor' => $this->descriptor(),
        ];
    }

    /** @return list<float> */
    private function descriptor(): array
    {
        return array_fill(0, 128, 1.0);
    }
}
