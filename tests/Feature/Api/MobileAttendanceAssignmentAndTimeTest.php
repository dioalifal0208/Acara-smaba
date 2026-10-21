<?php

namespace Tests\Feature\Api;

use App\Models\Attendance;
use App\Models\Participant;
use App\Models\User;
use App\Models\Workcode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MobileAttendanceAssignmentAndTimeTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    public function test_unassigned_participant_cannot_view_or_submit_active_workcode(): void
    {
        $participant = $this->actingParticipant();
        $otherParticipant = Participant::create([
            'nama' => 'Peserta Lain', 'nis_nip' => 'other-'.Str::random(8), 'qr_token' => Str::uuid(),
        ]);
        $workcode = Workcode::create([
            'nama_workcode' => 'Khusus Peserta Lain', 'kategori' => 'workcode', 'is_active' => true,
        ]);
        $workcode->participants()->attach($otherParticipant);

        $this->getJson('/api/v1/workcodes/active')
            ->assertOk()
            ->assertJson(['status' => 'success', 'data' => null]);

        $response = $this->postJson('/api/v1/attendance', $this->payload(), [
            'Idempotency-Key' => Str::uuid()->toString(),
        ]);

        $response->assertForbidden()->assertJson([
            'status' => 'error',
            'message' => 'Workcode aktif tidak tersedia untuk akun Anda.',
        ]);
        $this->assertStringNotContainsString('face_descriptor', $response->getContent());
        $this->assertStringNotContainsString('installation_id', $response->getContent());
        $this->assertDatabaseCount('attendances', 0);
    }

    public function test_check_in_outside_server_window_is_rejected(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-10-20 06:59:00', 'Asia/Jakarta'));
        $this->actingParticipant();
        $this->createDailyWorkcode();

        $this->postJson('/api/v1/attendance', $this->payload(), [
            'Idempotency-Key' => Str::uuid()->toString(),
        ])->assertStatus(400)->assertJson(['status' => 'error']);
    }

    public function test_check_out_outside_server_window_is_rejected(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-10-20 14:59:00', 'Asia/Jakarta'));
        $participant = $this->actingParticipant();
        $workcode = $this->createDailyWorkcode();
        Attendance::create([
            'workcode_id' => $workcode->id,
            'participant_id' => $participant->id,
            'tanggal' => now()->toDateString(),
            'waktu_hadir' => now()->subHours(7),
            'device_hash' => hash('sha256', Str::uuid()->toString()),
            'status' => 'hadir',
            'attendance_method' => 'wajah',
        ]);

        $this->postJson('/api/v1/attendance', $this->payload(), [
            'Idempotency-Key' => Str::uuid()->toString(),
        ])->assertStatus(400)->assertJson(['status' => 'error']);
    }

    public function test_check_in_within_server_window_is_accepted(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-10-20 07:15:00', 'Asia/Jakarta'));
        $this->actingParticipant();
        $this->createDailyWorkcode();

        $this->postJson('/api/v1/attendance', $this->payload(), [
            'Idempotency-Key' => Str::uuid()->toString(),
        ])->assertCreated()->assertJson(['status' => 'success']);
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

    private function createDailyWorkcode(): Workcode
    {
        return Workcode::create([
            'nama_workcode' => 'Harian Test Waktu',
            'kategori' => 'harian',
            'is_active' => true,
            'hari_aktif' => [now()->dayOfWeekIso],
            'jam_datang_mulai' => '07:00:00',
            'jam_datang_selesai' => '08:00:00',
            'jam_pulang_mulai' => '15:00:00',
            'jam_pulang_selesai' => '16:00:00',
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