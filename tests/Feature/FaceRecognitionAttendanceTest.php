<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\Participant;
use App\Models\User;
use App\Models\Workcode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class FaceRecognitionAttendanceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // /api/face/match wajib login; skenario di sini = scanner wajah oleh admin.
        $this->actingAs(User::factory()->create(['role' => 'admin']));
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    public function test_activity_attendance_is_never_marked_late(): void
    {
        Carbon::setTestNow('2026-10-14 12:35:00');

        $workcode = Workcode::create([
            'nama_workcode' => 'Absen Kegiatan',
            'kategori' => 'workcode',
            'is_active' => true,
        ]);
        $participant = $this->createParticipantWithFace();

        $this->postJson(route('face.match'), [
            'descriptor' => array_fill(0, 128, 0.0),
            'device_id' => 'activity-test-device',
        ])->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('is_late', false)
            ->assertJsonPath('late_formatted', null);

        $attendance = Attendance::where('workcode_id', $workcode->id)
            ->where('participant_id', $participant->id)
            ->firstOrFail();
        $this->assertNull($attendance->signature_path);
        $this->assertSame('wajah', $attendance->attendance_method);
    }

    public function test_daily_attendance_uses_configured_checkin_deadline(): void
    {
        Carbon::setTestNow('2026-10-14 07:05:00');

        Workcode::create([
            'nama_workcode' => 'Presensi Harian',
            'kategori' => 'harian',
            'jam_datang_selesai' => '07:00',
            'is_active' => true,
        ]);
        $this->createParticipantWithFace();

        $this->postJson(route('face.match'), [
            'descriptor' => array_fill(0, 128, 0.0),
            'device_id' => 'daily-test-device',
        ])->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('is_late', true)
            ->assertJsonPath('late_formatted', '5 menit');
    }

    public function test_face_attendance_stores_camera_capture_for_report_detail(): void
    {
        Storage::fake('private');
        Workcode::create([
            'nama_workcode' => 'Presensi Wajah Dengan Foto',
            'kategori' => 'workcode',
            'is_active' => true,
        ]);
        $participant = $this->createParticipantWithFace();

        $this->postJson(route('face.match'), [
            'descriptor' => array_fill(0, 128, 0.0),
            'device_id' => 'face-capture-device',
            'face_capture' => $this->faceCaptureDataUrl(),
        ])->assertOk();

        $attendance = Attendance::where('participant_id', $participant->id)->firstOrFail();
        $this->assertNotNull($attendance->face_capture_path);
        Storage::disk('private')->assertExists($attendance->face_capture_path);
    }

    public function test_face_attendance_requires_workcode_choice_when_participant_has_multiple_active_workcodes(): void
    {
        $firstWorkcode = Workcode::create(['nama_workcode' => 'Kegiatan A', 'kategori' => 'workcode', 'is_active' => true]);
        $secondWorkcode = Workcode::create(['nama_workcode' => 'Kegiatan B', 'kategori' => 'workcode', 'is_active' => true]);
        $participant = $this->createParticipantWithFace();
        $firstWorkcode->participants()->attach($participant);
        $secondWorkcode->participants()->attach($participant);

        $this->postJson(route('face.match'), [
            'descriptor' => array_fill(0, 128, 0.0),
            'device_id' => 'multiple-workcode-device',
        ])->assertStatus(409)
            ->assertJsonPath('status', 'workcode_selection_required')
            ->assertJsonCount(2, 'workcodes');

        $this->assertDatabaseCount('attendances', 0);
    }

    public function test_daily_face_attendance_records_check_in_then_check_out(): void
    {
        // Kamis 2026-10-15: jadwal khusus Kamis (4) pulang 14:25-15:30, berbeda dari jam umum 15:30-22:00.
        Carbon::setTestNow('2026-10-15 06:30:00');
        $workcode = Workcode::create([
            'nama_workcode' => 'Presensi Harian',
            'kategori' => 'harian',
            'jam_datang_mulai' => '06:00',
            'jam_datang_selesai' => '07:00',
            'jam_pulang_mulai' => '15:30',
            'jam_pulang_selesai' => '22:00',
            'jadwal_per_hari' => [4 => ['jam_datang_mulai' => '06:00', 'jam_datang_selesai' => '07:00', 'jam_pulang_mulai' => '14:25', 'jam_pulang_selesai' => '15:30']],
            'is_active' => true,
        ]);
        $participant = $this->createParticipantWithFace();
        $scan = fn () => $this->postJson(route('face.match'), [
            'descriptor' => array_fill(0, 128, 0.0),
            'device_id' => 'daily-checkout-device',
        ]);

        $scan()->assertOk()->assertJsonPath('status', 'success')->assertJsonPath('type', 'datang');

        // Sebelum jam pulang hari ini dibuka: ditolak dengan pesan jelas, bukan "sudah absen".
        Carbon::setTestNow('2026-10-15 10:00:00');
        $scan()->assertStatus(400)->assertJsonPath('status', 'error');

        // Jam pulang mengikuti jadwal Kamis (14:25), bukan jam umum (15:30).
        Carbon::setTestNow('2026-10-15 14:30:00');
        $scan()->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('type', 'pulang')
            ->assertJsonPath('timestamp', '14:30:00');

        $scan()->assertOk()->assertJsonPath('status', 'already');

        $attendance = Attendance::where('workcode_id', $workcode->id)->where('participant_id', $participant->id)->sole();
        $this->assertSame('06:30:00', $attendance->waktu_hadir->format('H:i:s'));
        $this->assertSame('14:30:00', $attendance->waktu_pulang->format('H:i:s'));
    }

    public function test_activity_face_attendance_is_only_recorded_once(): void
    {
        Carbon::setTestNow('2026-10-15 09:00:00');
        Workcode::create(['nama_workcode' => 'Rapat', 'kategori' => 'workcode', 'is_active' => true]);
        $this->createParticipantWithFace();
        $scan = fn () => $this->postJson(route('face.match'), ['descriptor' => array_fill(0, 128, 0.0), 'device_id' => 'activity-device']);

        $scan()->assertOk()->assertJsonPath('status', 'success');
        $scan()->assertOk()->assertJsonPath('status', 'already');
        $this->assertNull(Attendance::sole()->waktu_pulang);
    }

    private function createParticipantWithFace(): Participant
    {
        return Participant::create([
            'nama' => 'Peserta Wajah',
            'nis_nip' => '198001012006041001',
            'status' => 'PNS',
            'face_descriptor' => array_fill(0, 128, 0.0),
            'face_status' => 'approved',
        ]);
    }

    private function faceCaptureDataUrl(): string
    {
        return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAF//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABBQJ//8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAwEBPwF//8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAgEBPwF//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQAGPwJ//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPyF//9k=';
    }
}
