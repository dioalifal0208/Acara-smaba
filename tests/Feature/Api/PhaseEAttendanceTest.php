<?php

namespace Tests\Feature\Api;

use App\Models\Attendance;
use App\Models\Participant;
use App\Models\User;
use App\Models\Workcode;
use App\Models\ApiIdempotencyLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;
use Illuminate\Support\Str;
use Carbon\Carbon;

class PhaseEAttendanceTest extends TestCase
{
    use RefreshDatabase;

    public function test_attendance_submission_returns_401_if_unauthenticated()
    {
        $response = $this->postJson('/api/v1/attendance', [], [
            'Idempotency-Key' => Str::uuid()->toString()
        ]);
        $response->assertStatus(401);
    }

    public function test_attendance_submission_returns_403_for_non_participant()
    {
        $user = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($user, ['role:admin']);

        $response = $this->postJson('/api/v1/attendance', [], [
            'Idempotency-Key' => Str::uuid()->toString()
        ]);
        
        $response->assertStatus(403)
                 ->assertJson(['status' => 'error']);
    }

    public function test_attendance_requires_idempotency_key()
    {
        $user = User::factory()->create(['role' => 'participant']);
        $participant = Participant::create(['nama' => 'Test', 'nis_nip' => '123', 'qr_token' => Str::uuid()]);
        $user->participant_id = $participant->id;
        $user->save();
        Sanctum::actingAs($user, ['role:participant']);

        $response = $this->postJson('/api/v1/attendance', [
            'installation_id' => Str::uuid()->toString(),
        ]);
        
        $response->assertStatus(400)
                 ->assertJson(['status' => 'error', 'message' => 'Header Idempotency-Key tidak valid atau tidak ditemukan.']);
    }

    public function test_attendance_submission_success()
    {
        $user = User::factory()->create(['role' => 'participant']);
        $participant = Participant::create(['nama' => 'Test', 'nis_nip' => '123', 'qr_token' => Str::uuid()]);
        $user->participant_id = $participant->id;
        $user->save();
        Sanctum::actingAs($user, ['role:participant']);

        Workcode::create([
            'nama_workcode' => 'Acara Pagi',
            'kategori' => 'workcode',
            'is_active' => true,
            'latitude' => -6.1234,
            'longitude' => 106.1234,
            'radius_meters' => 150000000000, // Very large radius for testing
        ]);

        $idempotencyKey = Str::uuid()->toString();
        $installationId = Str::uuid()->toString();

        $payload = [
            'latitude' => -6.1234,
            'longitude' => 106.1234,
            'accuracy' => 10,
            'device_timestamp' => now()->toIso8601String(),
            'installation_id' => $installationId,
        ];

        $response = $this->postJson('/api/v1/attendance', $payload, [
            'Idempotency-Key' => $idempotencyKey
        ]);
        
        $response->assertStatus(201)
                 ->assertJson([
                     'status' => 'success',
                 ])
                 ->assertJsonStructure([
                     'data' => [
                         'attendance' => [
                             'id',
                             'status',
                             'checked_in_at',
                             'workcode' => [
                                 'id',
                                 'nama_workcode'
                             ]
                         ]
                     ]
                 ]);

        $json = $response->json();
        // Ensure sensitive fields are excluded
        $this->assertArrayNotHasKey('device_hash', $json['data']['attendance']);
        $this->assertArrayNotHasKey('ip_address', $json['data']['attendance']);

        // Assert database idempotency log
        $this->assertDatabaseHas('api_idempotency_logs', [
            'idempotency_key' => $idempotencyKey,
            'participant_id' => $participant->id,
            'response_code' => 201,
        ]);

        // Verify device hash logic in attendance table (hashed installation_id)
        $expectedHash = hash('sha256', $installationId);
        $this->assertDatabaseHas('attendances', [
            'participant_id' => $participant->id,
            'device_hash' => $expectedHash,
        ]);
    }

    public function test_attendance_submission_idempotency_replay_success()
    {
        $user = User::factory()->create(['role' => 'participant']);
        $participant = Participant::create(['nama' => 'Test', 'nis_nip' => '123', 'qr_token' => Str::uuid()]);
        $user->participant_id = $participant->id;
        $user->save();
        Sanctum::actingAs($user, ['role:participant']);

        Workcode::create([
            'nama_workcode' => 'Acara Pagi',
            'kategori' => 'workcode',
            'is_active' => true,
            'latitude' => -6.1234,
            'longitude' => 106.1234,
            'radius_meters' => 150000000000, 
        ]);

        $idempotencyKey = Str::uuid()->toString();
        $installationId = Str::uuid()->toString();
        
        $payload = [
            'latitude' => -6.1234,
            'longitude' => 106.1234,
            'accuracy' => 10,
            'device_timestamp' => now()->toIso8601String(),
            'installation_id' => $installationId,
        ];

        // 1. Initial request
        $response1 = $this->postJson('/api/v1/attendance', $payload, ['Idempotency-Key' => $idempotencyKey]);
        $response1->assertStatus(201);
        
        $initialAttendanceId = $response1->json('data.attendance.id');
        $initialCheckedInAt = $response1->json('data.attendance.checked_in_at');

        // 2. Same idempotency key and same payload
        $response2 = $this->postJson('/api/v1/attendance', $payload, ['Idempotency-Key' => $idempotencyKey]);
        $response2->assertStatus(201);
        
        // Assert exact same response (id and checked_in_at match)
        $this->assertEquals($initialAttendanceId, $response2->json('data.attendance.id'));
        $this->assertEquals($initialCheckedInAt, $response2->json('data.attendance.checked_in_at'));
        
        // Assert only ONE attendance is in DB
        $this->assertEquals(1, Attendance::count());
    }

    public function test_attendance_submission_idempotency_conflict_when_payload_changes()
    {
        $user = User::factory()->create(['role' => 'participant']);
        $participant = Participant::create(['nama' => 'Test', 'nis_nip' => '123', 'qr_token' => Str::uuid()]);
        $user->participant_id = $participant->id;
        $user->save();
        Sanctum::actingAs($user, ['role:participant']);

        Workcode::create([
            'nama_workcode' => 'Acara Pagi',
            'kategori' => 'workcode',
            'is_active' => true,
            'latitude' => -6.1234,
            'longitude' => 106.1234,
            'radius_meters' => 150000000000, 
        ]);

        $idempotencyKey = Str::uuid()->toString();
        $installationId = Str::uuid()->toString();
        
        $payload1 = [
            'latitude' => -6.1234,
            'longitude' => 106.1234,
            'accuracy' => 10,
            'device_timestamp' => now()->toIso8601String(),
            'installation_id' => $installationId,
        ];

        // 1. Initial request
        $this->postJson('/api/v1/attendance', $payload1, ['Idempotency-Key' => $idempotencyKey])->assertStatus(201);
        
        // 2. Change payload but use SAME idempotency key
        $payload2 = $payload1;
        $payload2['accuracy'] = 20;

        $response2 = $this->postJson('/api/v1/attendance', $payload2, ['Idempotency-Key' => $idempotencyKey]);
        $response2->assertStatus(409)
                  ->assertJson([
                      'status' => 'error',
                      'message' => 'Konflik permintaan: Idempotency-Key sudah digunakan dengan payload yang berbeda.',
                  ]);
                  
        // Assert still ONE attendance
        $this->assertEquals(1, Attendance::count());
    }

    public function test_mock_location_is_rejected_by_service()
    {
        $user = User::factory()->create(['role' => 'participant']);
        $participant = Participant::create(['nama' => 'Test', 'nis_nip' => '123', 'qr_token' => Str::uuid()]);
        $user->participant_id = $participant->id;
        $user->save();
        Sanctum::actingAs($user, ['role:participant']);

        Workcode::create([
            'nama_workcode' => 'Acara Pagi',
            'kategori' => 'workcode',
            'is_active' => true,
        ]);

        $payload = [
            'latitude' => -6.1234,
            'longitude' => 106.1234,
            'accuracy' => 0, // Mock location trigger in service
            'installation_id' => Str::uuid()->toString(),
        ];

        $response = $this->postJson('/api/v1/attendance', $payload, ['Idempotency-Key' => Str::uuid()->toString()]);
        
        $response->assertStatus(403)
                 ->assertJson([
                     'status' => 'error',
                     'message' => 'Peringatan Keamanan: Terdeteksi manipulasi lokasi (Mock Location). Matikan aplikasi Fake GPS pada perangkat Anda.',
                 ]);
    }
}
