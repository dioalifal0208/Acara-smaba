<?php

namespace Tests\Feature\Api;

use App\Models\Attendance;
use App\Models\Participant;
use App\Models\User;
use App\Models\Workcode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AttendanceFaceCaptureApiTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    public function test_mobile_check_in_and_check_out_store_face_captures(): void
    {
        Storage::fake('private');
        Carbon::setTestNow('2026-10-14 06:30:00');
        $this->actingAsParticipant();
        Workcode::create([
            'nama_workcode' => 'Presensi Harian',
            'kategori' => 'harian',
            'jam_datang_mulai' => '06:00',
            'jam_datang_selesai' => '07:00',
            'jam_pulang_mulai' => '14:00',
            'jam_pulang_selesai' => '16:00',
            'is_active' => true,
        ]);

        $this->submit(['face_capture' => $this->faceCaptureDataUrl()])->assertStatus(201);
        Carbon::setTestNow('2026-10-14 14:30:00');
        $this->submit(['face_capture' => $this->faceCaptureDataUrl()])->assertOk()->assertJsonPath('status', 'success');

        $attendance = Attendance::sole();
        $this->assertNotNull($attendance->waktu_pulang);
        $this->assertNotSame($attendance->face_capture_path, $attendance->face_capture_pulang_path);
        Storage::disk('private')->assertExists([$attendance->face_capture_path, $attendance->face_capture_pulang_path]);

        // Log laporan admin menampilkan kedua foto.
        $this->app['auth']->forgetGuards();
        $log = collect($this->actingAs(User::factory()->create(['role' => 'admin']))
            ->getJson(route('report.individual', [$attendance->workcode_id, $attendance->participant_id]).'?year=2026&month=10')
            ->assertOk()
            ->json('attendances'))
            ->firstWhere('id', $attendance->id);
        $this->assertIsString($log['face_capture_url']);
        $this->assertIsString($log['face_capture_pulang_url']);

        // Menghapus presensi ikut menghapus fotonya.
        $attendance->delete();
        Storage::disk('private')->assertMissing([$attendance->face_capture_path, $attendance->face_capture_pulang_path]);
    }

    public function test_face_capture_stays_optional_for_older_apps(): void
    {
        Storage::fake('private');
        $this->actingAsParticipant();
        Workcode::create(['nama_workcode' => 'Rapat', 'kategori' => 'workcode', 'is_active' => true]);

        $this->submit()->assertStatus(201);

        $this->assertNull(Attendance::sole()->face_capture_path);
    }

    public function test_rejected_attendance_does_not_keep_face_capture(): void
    {
        Storage::fake('private');
        $this->actingAsParticipant();
        Workcode::create(['nama_workcode' => 'Rapat', 'kategori' => 'workcode', 'is_active' => true]);

        $this->submit(['face_descriptor' => array_fill(0, 128, -1.0), 'face_capture' => $this->faceCaptureDataUrl()])
            ->assertJsonPath('status', 'face_mismatch');

        $this->assertDatabaseCount('attendances', 0);
        $this->assertSame([], Storage::disk('private')->allFiles());
    }

    public function test_invalid_face_capture_format_is_rejected(): void
    {
        $this->actingAsParticipant();
        Workcode::create(['nama_workcode' => 'Rapat', 'kategori' => 'workcode', 'is_active' => true]);

        $this->submit(['face_capture' => 'data:image/png;base64,AAAA'])->assertStatus(422);

        $this->assertDatabaseCount('attendances', 0);
    }

    private function actingAsParticipant(): void
    {
        $participant = Participant::create([
            'nama' => 'Peserta Android',
            'nis_nip' => '123',
            'qr_token' => Str::uuid(),
            'face_descriptor' => json_encode(array_fill(0, 128, 1.0)),
            'face_status' => 'approved',
        ]);
        $user = User::factory()->create(['role' => 'participant', 'participant_id' => $participant->id]);
        Sanctum::actingAs($user, ['role:participant']);
    }

    private function submit(array $overrides = [])
    {
        return $this->postJson('/api/v1/attendance', [
            'installation_id' => '7f0c2a52-9d1e-4a39-8c1e-2b8f6d3a9e10',
            'face_descriptor' => array_fill(0, 128, 1.0),
            ...$overrides,
        ], ['Idempotency-Key' => Str::uuid()->toString()]);
    }

    private function faceCaptureDataUrl(): string
    {
        return 'data:image/jpeg;base64,'.base64_encode(str_repeat("\xFF\xD8\xFF\xE0", 32));
    }
}
