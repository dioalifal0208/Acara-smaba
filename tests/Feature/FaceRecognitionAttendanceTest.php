<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\Participant;
use App\Models\Workcode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class FaceRecognitionAttendanceTest extends TestCase
{
    use RefreshDatabase;

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
        Storage::fake('public');
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
        Storage::disk('public')->assertExists($attendance->face_capture_path);
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
