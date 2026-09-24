<?php

namespace Tests\Feature\Api;

use App\Models\Participant;
use App\Models\User;
use App\Models\Workcode;
use App\Models\LeaveRequest;
use App\Models\ApiIdempotencyLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;
use Illuminate\Support\Str;

class PhaseFLeaveRequestTest extends TestCase
{
    use RefreshDatabase;

    public function test_leave_submission_returns_401_if_unauthenticated()
    {
        $response = $this->postJson('/api/v1/attendances/leave', [], [
            'Idempotency-Key' => Str::uuid()->toString()
        ]);
        $response->assertStatus(401);
    }

    public function test_leave_submission_returns_403_for_non_participant()
    {
        $user = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($user, ['role:admin']);

        $response = $this->postJson('/api/v1/attendances/leave', [], [
            'Idempotency-Key' => Str::uuid()->toString()
        ]);
        
        $response->assertStatus(403)
                 ->assertJson(['status' => 'error']);
    }

    public function test_leave_requires_idempotency_key()
    {
        $user = User::factory()->create(['role' => 'participant']);
        $participant = Participant::create(['nama' => 'Test', 'nis_nip' => '123', 'qr_token' => Str::uuid()]);
        $user->participant_id = $participant->id;
        $user->save();
        Sanctum::actingAs($user, ['role:participant']);

        $response = $this->postJson('/api/v1/attendances/leave', [
            'tipe' => 'sakit',
            'alasan' => 'Sakit test',
        ]);
        
        $response->assertStatus(400)
                 ->assertJson(['status' => 'error', 'message' => 'Header Idempotency-Key tidak valid atau tidak ditemukan.']);
    }

    public function test_leave_submission_success()
    {
        Storage::fake('public');

        $user = User::factory()->create(['role' => 'participant']);
        $participant = Participant::create(['nama' => 'Test', 'nis_nip' => '123', 'qr_token' => Str::uuid()]);
        $user->participant_id = $participant->id;
        $user->save();
        Sanctum::actingAs($user, ['role:participant']);

        $workcode = Workcode::create([
            'nama_workcode' => 'Acara Pagi',
            'kategori' => 'workcode',
            'is_active' => true,
        ]);

        $idempotencyKey = Str::uuid()->toString();
        $file = UploadedFile::fake()->image('surat_dokter.jpg');

        $payload = [
            'tipe' => 'sakit',
            'alasan' => 'Sakit demam',
            'bukti' => $file,
        ];

        $response = $this->postJson('/api/v1/attendances/leave', $payload, [
            'Idempotency-Key' => $idempotencyKey
        ]);
        
        $response->assertStatus(201)
                 ->assertJson([
                     'status' => 'success',
                 ])
                 ->assertJsonStructure([
                     'data' => [
                         'leave_request' => [
                             'id',
                             'tipe',
                             'tanggal',
                             'alasan',
                             'status_approval',
                             'has_proof'
                         ]
                     ]
                 ]);

        $json = $response->json();
        
        // Assert specific fields
        $this->assertEquals('sakit', $json['data']['leave_request']['tipe']);
        $this->assertEquals('Sakit demam', $json['data']['leave_request']['alasan']);
        $this->assertEquals('pending', $json['data']['leave_request']['status_approval']);
        $this->assertTrue($json['data']['leave_request']['has_proof']);
        
        // Ensure sensitive fields are excluded
        $this->assertArrayNotHasKey('bukti_path', $json['data']['leave_request']);

        // Assert database idempotency log
        $this->assertDatabaseHas('api_idempotency_logs', [
            'idempotency_key' => $idempotencyKey,
            'participant_id' => $participant->id,
            'response_code' => 201,
        ]);

        // Verify leave request in db
        $this->assertDatabaseHas('leave_requests', [
            'participant_id' => $participant->id,
            'workcode_id' => $workcode->id,
            'tipe' => 'sakit',
            'status_approval' => 'pending',
        ]);
        
        // Assert file was stored
        $leave = LeaveRequest::first();
        Storage::disk('public')->assertExists($leave->bukti_path);
    }

    public function test_leave_submission_idempotency_replay_success()
    {
        Storage::fake('public');

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

        $idempotencyKey = Str::uuid()->toString();
        $file = UploadedFile::fake()->image('surat_dokter.jpg');
        
        $payload = [
            'tipe' => 'sakit',
            'alasan' => 'Sakit test replay',
            'bukti' => $file,
        ];

        // 1. Initial request
        $response1 = $this->postJson('/api/v1/attendances/leave', $payload, ['Idempotency-Key' => $idempotencyKey]);
        $response1->assertStatus(201);
        
        $initialLeaveId = $response1->json('data.leave_request.id');

        // 2. Same idempotency key and same payload
        $response2 = $this->postJson('/api/v1/attendances/leave', $payload, ['Idempotency-Key' => $idempotencyKey]);
        $response2->assertStatus(201);
        
        // Assert exact same response
        $this->assertEquals($initialLeaveId, $response2->json('data.leave_request.id'));
        
        // Assert only ONE leave request is in DB
        $this->assertEquals(1, LeaveRequest::count());
    }

    public function test_leave_submission_idempotency_conflict_when_payload_changes()
    {
        Storage::fake('public');

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

        $idempotencyKey = Str::uuid()->toString();
        $file1 = UploadedFile::fake()->image('surat_dokter1.jpg');
        $file2 = UploadedFile::fake()->image('surat_dokter2.jpg');
        
        $payload1 = [
            'tipe' => 'sakit',
            'alasan' => 'Sakit test 1',
            'bukti' => $file1,
        ];

        // 1. Initial request
        $this->postJson('/api/v1/attendances/leave', $payload1, ['Idempotency-Key' => $idempotencyKey])->assertStatus(201);
        
        // 2. Change payload but use SAME idempotency key
        $payload2 = [
            'tipe' => 'sakit',
            'alasan' => 'Sakit test 2',
            'bukti' => $file2,
        ];

        $response2 = $this->postJson('/api/v1/attendances/leave', $payload2, ['Idempotency-Key' => $idempotencyKey]);
        $response2->assertStatus(409)
                  ->assertJson([
                      'status' => 'error',
                      'message' => 'Konflik permintaan: Idempotency-Key sudah digunakan dengan payload yang berbeda.',
                  ]);
                  
        // Assert still ONE leave request
        $this->assertEquals(1, LeaveRequest::count());
    }
}
