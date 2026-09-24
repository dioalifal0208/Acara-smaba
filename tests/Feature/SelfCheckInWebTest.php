<?php

namespace Tests\Feature;

use App\Models\Participant;
use App\Models\Workcode;
use App\Models\Attendance;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Tests\TestCase;

class SelfCheckInWebTest extends TestCase
{
    use RefreshDatabase;

    private $token;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->token = Str::random(16);
        Cache::put('active_workcode_token', $this->token, now()->endOfDay());
    }

    public function test_fails_if_no_active_workcode()
    {
        $response = $this->postJson("/self-checkin/{$this->token}", [
            'nis_nip' => '12345',
        ]);

        $response->assertStatus(400)
                 ->assertJson(['message' => 'Belum ada Workcode yang aktif. Presensi mandiri saat ini ditutup.']);
    }

    public function test_fails_if_workcode_is_harian()
    {
        Workcode::create([
            'nama_workcode' => 'Test',
            'kategori' => 'harian',
            'is_active' => true,
        ]);

        $response = $this->postJson("/self-checkin/{$this->token}", [
            'nis_nip' => '12345',
        ]);

        $response->assertStatus(403)
                 ->assertJson(['message' => 'Presensi harian hanya dapat dilakukan melalui scan QR Code Pribadi oleh petugas/admin.']);
    }

    public function test_successful_check_in()
    {
        Workcode::create([
            'nama_workcode' => 'Acara Umum',
            'kategori' => 'workcode',
            'is_active' => true,
        ]);

        $participant = Participant::create([
            'nama' => 'John Doe',
            'nis_nip' => '12345',
            'qr_token' => Str::uuid(),
        ]);

        $response = $this->postJson("/self-checkin/{$this->token}", [
            'nis_nip' => '12345',
            'device_id' => 'dev1',
            'device_timestamp' => now()->timestamp * 1000,
        ], ['User-Agent' => 'TestAgent']);

        $response->assertStatus(200)
                 ->assertJson(['status' => 'success']);

        $this->assertDatabaseHas('attendances', [
            'participant_id' => $participant->id,
        ]);
    }

    public function test_duplicate_attendance_returns_already_status()
    {
        $workcode = Workcode::create([
            'nama_workcode' => 'Acara Umum',
            'kategori' => 'workcode',
            'is_active' => true,
        ]);

        $participant = Participant::create([
            'nama' => 'John Doe',
            'nis_nip' => '12345',
            'qr_token' => Str::uuid(),
        ]);

        // First attendance
        Attendance::create([
            'workcode_id' => $workcode->id,
            'participant_id' => $participant->id,
            'waktu_hadir' => now(),
            'device_hash' => hash('sha256', 'dev1|TestAgent'),
            'ip_address' => '127.0.0.1',
        ]);

        $response = $this->postJson("/self-checkin/{$this->token}", [
            'nis_nip' => '12345',
            'device_id' => 'dev2', // different device to bypass device lock
            'device_timestamp' => now()->timestamp * 1000,
        ], ['User-Agent' => 'TestAgent2']);

        $response->assertStatus(200)
                 ->assertJson(['status' => 'already']);
    }

    public function test_device_locked_for_another_user()
    {
        $workcode = Workcode::create([
            'nama_workcode' => 'Acara Umum',
            'kategori' => 'workcode',
            'is_active' => true,
        ]);

        $p1 = Participant::create(['nama' => 'User 1', 'nis_nip' => '111', 'qr_token' => Str::uuid()]);
        $p2 = Participant::create(['nama' => 'User 2', 'nis_nip' => '222', 'qr_token' => Str::uuid()]);

        Attendance::create([
            'workcode_id' => $workcode->id,
            'participant_id' => $p1->id,
            'waktu_hadir' => now(),
            'device_hash' => hash('sha256', 'dev1|TestAgent'),
            'ip_address' => '127.0.0.1',
        ]);

        $response = $this->postJson("/self-checkin/{$this->token}", [
            'nis_nip' => '222',
            'device_id' => 'dev1',
            'device_timestamp' => now()->timestamp * 1000,
        ], ['User-Agent' => 'TestAgent']);

        $response->assertStatus(403)
                 ->assertJson(['status' => 'device_locked']);
    }

    public function test_mock_location_is_rejected()
    {
        Workcode::create([
            'nama_workcode' => 'Acara',
            'kategori' => 'workcode',
            'is_active' => true,
        ]);

        $response = $this->postJson("/self-checkin/{$this->token}", [
            'nis_nip' => '12345',
            'accuracy' => 0,
        ]);

        $response->assertStatus(403)
                 ->assertJson(['message' => 'Peringatan Keamanan: Terdeteksi manipulasi lokasi (Mock Location). Matikan aplikasi Fake GPS pada perangkat Anda.']);
    }

    public function test_low_accuracy_is_rejected()
    {
        Workcode::create([
            'nama_workcode' => 'Acara',
            'kategori' => 'workcode',
            'is_active' => true,
        ]);

        $response = $this->postJson("/self-checkin/{$this->token}", [
            'nis_nip' => '12345',
            'accuracy' => 121,
        ]);

        $response->assertStatus(400)
                 ->assertJson(['message' => 'Akurasi sinyal GPS perangkat Anda terlalu rendah (±121m). Pastikan fitur Lokasi Akurasi Tinggi diaktifkan dan Anda berada di area terbuka.']);
    }

    public function test_clock_skew_is_rejected()
    {
        Workcode::create([
            'nama_workcode' => 'Acara',
            'kategori' => 'workcode',
            'is_active' => true,
        ]);

        $response = $this->postJson("/self-checkin/{$this->token}", [
            'nis_nip' => '12345',
            'device_timestamp' => (now()->timestamp - 130) * 1000,
        ]);

        $response->assertStatus(400)
                 ->assertJson(['message' => 'Waktu pada perangkat Anda tidak sinkron dengan server (selisih > 2 menit). Mohon atur jam perangkat ke otomatis/WIB.']);
    }

    public function test_out_of_radius_is_rejected()
    {
        Workcode::create([
            'nama_workcode' => 'Acara',
            'kategori' => 'workcode',
            'is_active' => true,
            'latitude' => -6.200000,
            'longitude' => 106.816666,
            'radius_meters' => 100,
        ]);

        // Far away coordinate
        $response = $this->postJson("/self-checkin/{$this->token}", [
            'nis_nip' => '12345',
            'latitude' => -6.250000,
            'longitude' => 106.850000,
        ]);

        $response->assertStatus(403)
                 ->assertJsonFragment(['status' => 'error']);
        
        $this->assertStringContainsString('Anda berada di luar radius presensi', $response->json('message'));
    }
}
