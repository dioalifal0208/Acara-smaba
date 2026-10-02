<?php

namespace Tests\Feature\Api;

use App\Models\LeaveRequest;
use App\Models\Participant;
use App\Models\User;
use App\Models\Workcode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PhaseFLeaveRequestTest extends TestCase
{
    use RefreshDatabase;

    public function test_leave_submission_returns_401_if_unauthenticated()
    {
        $response = $this->postJson('/api/v1/attendances/leave', [], [
            'Idempotency-Key' => Str::uuid()->toString(),
        ]);
        $response->assertStatus(401);
    }

    public function test_participant_history_only_returns_the_authenticated_participants_requests(): void
    {
        $participant = Participant::create(['nama' => 'Peserta API', 'nis_nip' => '1001']);
        $otherParticipant = Participant::create(['nama' => 'Peserta Lain', 'nis_nip' => '1002']);
        $user = User::factory()->create(['role' => 'participant', 'participant_id' => $participant->id]);
        $workcode = Workcode::create(['nama_workcode' => 'Acara Pagi', 'kategori' => 'workcode']);
        $ownRequest = $this->createHistoryRequest($participant, $workcode, 'pending');
        $this->createHistoryRequest($otherParticipant, $workcode, 'approved');

        Sanctum::actingAs($user, ['role:participant']);

        $this->getJson('/api/v1/leave-requests')
            ->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.id', $ownRequest->id)
            ->assertJsonPath('data.0.status_approval', 'pending')
            ->assertJsonPath('data.0.workcode.nama_workcode', 'Acara Pagi')
            ->assertJsonMissing(['nama' => 'Peserta Lain']);
    }

    public function test_admin_history_can_filter_requests_by_approval_status(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $participant = Participant::create(['nama' => 'Peserta API', 'nis_nip' => '1001']);
        $workcode = Workcode::create(['nama_workcode' => 'Acara Pagi', 'kategori' => 'workcode']);
        $approved = $this->createHistoryRequest($participant, $workcode, 'approved');
        $this->createHistoryRequest($participant, $workcode, 'pending');

        Sanctum::actingAs($admin, ['role:admin']);

        $this->getJson('/api/v1/leave-requests?status_approval=approved')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.id', $approved->id)
            ->assertJsonPath('data.0.participant.nama', 'Peserta API');
    }

    public function test_leave_submission_returns_403_for_non_participant()
    {
        $user = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($user, ['role:admin']);

        $response = $this->postJson('/api/v1/attendances/leave', [], [
            'Idempotency-Key' => Str::uuid()->toString(),
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
            'tipe_izin' => 'izin_penuh',
            'jenis_izin' => 'cuti',
            'keterangan' => 'Cuti test',
            'tanggal' => now()->toDateString(),
        ]);

        $response->assertStatus(400)
            ->assertJson(['status' => 'error', 'message' => 'Header Idempotency-Key tidak valid atau tidak ditemukan.']);
    }

    public function test_leave_request_requires_all_five_form_fields()
    {
        $user = User::factory()->create(['role' => 'participant']);
        $participant = Participant::create(['nama' => 'Test', 'nis_nip' => '123', 'qr_token' => Str::uuid()]);
        $user->participant_id = $participant->id;
        $user->save();
        Sanctum::actingAs($user, ['role:participant']);

        $response = $this->postJson('/api/v1/leave-requests', [], [
            'Idempotency-Key' => Str::uuid()->toString(),
        ]);

        $response->assertStatus(422)
            ->assertJson(['status' => 'error']);
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
            'tipe_izin' => 'izin_penuh',
            'jenis_izin' => 'cuti',
            'keterangan' => 'Cuti keluarga',
            'tanggal' => now()->addDays(2)->toDateString(),
            'izin_lebih_dari_satu_hari' => true,
            'tanggal_selesai' => now()->addDays(4)->toDateString(),
            'dokumen' => $file,
        ];

        $response = $this->postJson('/api/v1/leave-requests', $payload, [
            'Idempotency-Key' => $idempotencyKey,
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'status' => 'success',
            ])
            ->assertJsonStructure([
                'data' => [
                    'leave_request' => [
                        'id',
                        'kategori',
                        'tipe_izin',
                        'jenis_izin',
                        'tanggal',
                        'izin_lebih_dari_satu_hari',
                        'tanggal_selesai',
                        'keterangan',
                        'status_approval',
                        'has_dokumen',
                    ],
                ],
            ]);

        $json = $response->json();

        // Assert specific fields
        $this->assertEquals('izin', $json['data']['leave_request']['kategori']);
        $this->assertEquals('izin_penuh', $json['data']['leave_request']['tipe_izin']);
        $this->assertEquals('cuti', $json['data']['leave_request']['jenis_izin']);
        $this->assertTrue($json['data']['leave_request']['izin_lebih_dari_satu_hari']);
        $this->assertEquals(now()->addDays(4)->toDateString(), $json['data']['leave_request']['tanggal_selesai']);
        $this->assertEquals('Cuti keluarga', $json['data']['leave_request']['keterangan']);
        $this->assertEquals('pending', $json['data']['leave_request']['status_approval']);
        $this->assertTrue($json['data']['leave_request']['has_dokumen']);

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
            'tipe' => 'izin',
            'tipe_izin' => 'izin_penuh',
            'jenis_izin' => 'cuti',
            'keterangan' => 'Cuti keluarga',
            'status_approval' => 'pending',
        ]);

        // Assert file was stored
        $leave = LeaveRequest::first();
        $this->assertSame(now()->addDays(4)->toDateString(), $leave->tanggal_selesai->toDateString());
        Storage::disk('public')->assertExists($leave->bukti_path);
    }

    public function test_leave_submission_accepts_a_pdf_document(): void
    {
        Storage::fake('public');

        $user = User::factory()->create(['role' => 'participant']);
        $participant = Participant::create(['nama' => 'Test', 'nis_nip' => '124', 'qr_token' => Str::uuid()]);
        $user->participant_id = $participant->id;
        $user->save();
        Sanctum::actingAs($user, ['role:participant']);

        Workcode::create([
            'nama_workcode' => 'Acara Pagi',
            'kategori' => 'workcode',
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/v1/leave-requests', [
            'tipe_izin' => 'izin_penuh',
            'jenis_izin' => 'izin_sakit',
            'keterangan' => 'Sedang sakit dan tidak dapat masuk kerja.',
            'tanggal' => now()->toDateString(),
            'dokumen' => UploadedFile::fake()->create('surat_keterangan.pdf', 100, 'application/pdf'),
        ], [
            'Idempotency-Key' => Str::uuid()->toString(),
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.leave_request.has_dokumen', true);
    }

    public function test_multi_day_leave_requires_an_end_date_after_the_start_date(): void
    {
        Storage::fake('public');

        $user = User::factory()->create(['role' => 'participant']);
        $participant = Participant::create(['nama' => 'Test', 'nis_nip' => '125', 'qr_token' => Str::uuid()]);
        $user->participant_id = $participant->id;
        $user->save();
        Sanctum::actingAs($user, ['role:participant']);

        $response = $this->postJson('/api/v1/leave-requests', [
            'tipe_izin' => 'izin_penuh',
            'jenis_izin' => 'cuti',
            'keterangan' => 'Cuti keluarga.',
            'tanggal' => now()->addDay()->toDateString(),
            'izin_lebih_dari_satu_hari' => true,
            'dokumen' => UploadedFile::fake()->image('surat.jpg'),
        ], [
            'Idempotency-Key' => Str::uuid()->toString(),
        ]);

        $response->assertStatus(422)
            ->assertJson(['status' => 'error']);
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
            'tipe_izin' => 'tidak_absen_datang',
            'jenis_izin' => 'perjalanan_dinas_dalam_kota',
            'keterangan' => 'Tugas dinas di kecamatan.',
            'tanggal' => now()->toDateString(),
            'dokumen' => $file,
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
            'tipe_izin' => 'tidak_absen_pulang',
            'jenis_izin' => 'diklat_dan_pelatihan',
            'keterangan' => 'Pelatihan kompetensi.',
            'tanggal' => now()->toDateString(),
            'dokumen' => $file1,
        ];

        // 1. Initial request
        $this->postJson('/api/v1/attendances/leave', $payload1, ['Idempotency-Key' => $idempotencyKey])->assertStatus(201);

        // 2. Change payload but use SAME idempotency key
        $payload2 = [
            'tipe_izin' => 'tidak_absen_pulang',
            'jenis_izin' => 'diklat_dan_pelatihan',
            'keterangan' => 'Pelatihan kompetensi berbeda.',
            'tanggal' => now()->toDateString(),
            'dokumen' => $file2,
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

    private function createHistoryRequest(Participant $participant, Workcode $workcode, string $status): LeaveRequest
    {
        return LeaveRequest::create([
            'participant_id' => $participant->id,
            'workcode_id' => $workcode->id,
            'tanggal' => '2026-10-01',
            'tipe' => 'izin',
            'tipe_izin' => 'izin_penuh',
            'jenis_izin' => 'cuti',
            'keterangan' => 'Keperluan keluarga.',
            'alasan' => 'Keperluan keluarga.',
            'status_approval' => $status,
        ]);
    }
}
