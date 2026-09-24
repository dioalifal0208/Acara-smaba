<?php

namespace Tests\Feature\Api;

use App\Models\Attendance;
use App\Models\LeaveRequest;
use App\Models\Participant;
use App\Models\User;
use App\Models\Workcode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;
use Illuminate\Support\Str;

class PhaseDParticipantTest extends TestCase
{
    use RefreshDatabase;

    public function test_active_workcode_returns_401_if_unauthenticated()
    {
        $response = $this->getJson('/api/v1/workcodes/active');
        $response->assertStatus(401);
    }

    public function test_attendance_history_returns_401_if_unauthenticated()
    {
        $response = $this->getJson('/api/v1/attendance-history');
        $response->assertStatus(401);
    }

    public function test_endpoints_return_403_for_non_participant()
    {
        $user = User::factory()->create([
            'role' => 'admin',
        ]);
        
        Sanctum::actingAs($user, ['role:admin']);

        $response1 = $this->getJson('/api/v1/workcodes/active');
        $response1->assertStatus(403)
                  ->assertJson(['status' => 'error', 'message' => 'Akses ditolak. Endpoint ini khusus untuk peserta.']);

        $response2 = $this->getJson('/api/v1/attendance-history');
        $response2->assertStatus(403)
                  ->assertJson(['status' => 'error']);
    }

    public function test_active_workcode_returns_null_when_none_active()
    {
        $user = User::factory()->create(['role' => 'participant']);
        $participant = Participant::create([
            'nama' => 'Test', 'nis_nip' => '123', 'qr_token' => Str::uuid()
        ]);
        $user->participant_id = $participant->id;
        $user->save();

        Sanctum::actingAs($user, ['role:participant']);

        // Pastikan tidak ada yang aktif
        Workcode::where('is_active', true)->update(['is_active' => false]);

        $response = $this->getJson('/api/v1/workcodes/active');

        $response->assertStatus(200)
                 ->assertJson([
                     'status' => 'success',
                     'data' => null,
                 ]);
    }

    public function test_active_workcode_returns_safe_fields_only()
    {
        $user = User::factory()->create(['role' => 'participant']);
        $participant = Participant::create([
            'nama' => 'Test', 'nis_nip' => '123', 'qr_token' => Str::uuid()
        ]);
        $user->participant_id = $participant->id;
        $user->save();

        Sanctum::actingAs($user, ['role:participant']);

        Workcode::create([
            'nama_workcode' => 'Acara Pagi',
            'deskripsi' => 'Secret Admin Notes',
            'kategori' => 'workcode',
            'is_active' => true,
            'latitude' => -6.1234,
            'longitude' => 106.1234,
            'radius_meters' => 150,
        ]);

        $response = $this->getJson('/api/v1/workcodes/active');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'status',
                     'data' => [
                         'id',
                         'nama_workcode',
                         'kategori',
                         'tanggal',
                         'latitude',
                         'longitude',
                         'radius_meters',
                         'jadwal_per_hari',
                     ]
                 ]);

        $json = $response->json();
        $this->assertArrayNotHasKey('deskripsi', $json['data']);
        $this->assertArrayNotHasKey('is_active', $json['data']);
        $this->assertEquals(-6.1234, $json['data']['latitude']);
    }

    public function test_attendance_history_pagination_and_safe_fields()
    {
        $user = User::factory()->create(['role' => 'participant']);
        $participant = Participant::create([
            'nama' => 'Test', 'nis_nip' => '123', 'qr_token' => Str::uuid()
        ]);
        $user->participant_id = $participant->id;
        $user->save();

        Sanctum::actingAs($user, ['role:participant']);

        $workcode = Workcode::create([
            'nama_workcode' => 'Acara 1',
            'kategori' => 'workcode',
            'is_active' => false,
        ]);

        $leave = LeaveRequest::create([
            'workcode_id' => $workcode->id,
            'participant_id' => $participant->id,
            'tipe' => 'sakit',
            'status_approval' => 'approved',
            'tanggal' => now(),
            'alasan' => 'Sakit test',
        ]);

        // Create 20 attendances
        for ($i = 0; $i < 20; $i++) {
            $att = Attendance::create([
                'workcode_id' => $workcode->id,
                'participant_id' => $participant->id,
                'waktu_hadir' => now()->subDays($i),
                'device_hash' => 'secret_hash_' . $i,
                'ip_address' => '192.168.1.1',
                'status' => 'hadir',
                'leave_request_id' => $i === 0 ? $leave->id : null,
            ]);
            $att->created_at = now()->subDays($i);
            $att->save(['timestamps' => false]);
        }

        // Test default pagination (15 items)
        $response = $this->getJson('/api/v1/attendance-history');
        
        $response->assertStatus(200)
                 ->assertJsonCount(15, 'data')
                 ->assertJsonStructure([
                     'status',
                     'data' => [
                         '*' => [
                             'id',
                             'workcode' => ['id', 'nama_workcode', 'kategori'],
                             'status',
                             'waktu_hadir',
                             'waktu_pulang',
                             'created_at',
                             'leave_request',
                         ]
                     ],
                     'meta' => ['current_page', 'last_page', 'per_page', 'total', 'path']
                 ]);
        
        $json = $response->json();
        
        // Ensure sensitive fields are missing
        $firstItem = $json['data'][0];
        $this->assertArrayNotHasKey('device_hash', $firstItem);
        $this->assertArrayNotHasKey('ip_address', $firstItem);
        $this->assertArrayNotHasKey('participant_id', $firstItem);
        
        // Check leave request relation
        $this->assertNotNull($firstItem['leave_request']);
        $this->assertEquals('sakit', $firstItem['leave_request']['tipe']);
        $this->assertEquals('approved', $firstItem['leave_request']['status_approval']);
        $this->assertArrayNotHasKey('bukti_path', $firstItem['leave_request']);

        // Check newest first
        $secondItem = $json['data'][1];
        $this->assertTrue(strtotime($firstItem['created_at']) > strtotime($secondItem['created_at']));

        // Test max pagination
        $response2 = $this->getJson('/api/v1/attendance-history?per_page=50');
        $response2->assertStatus(200)
                  ->assertJsonCount(20, 'data'); // Total is 20
                  
        // Test invalid pagination
        $response3 = $this->getJson('/api/v1/attendance-history?per_page=51');
        $response3->assertStatus(422)
                  ->assertJson(['status' => 'error']);
    }
}
