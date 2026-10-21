<?php

namespace Tests\Feature\Api;

use App\Models\Attendance;
use App\Models\LocationIntegrityViolation;
use App\Models\Participant;
use App\Models\User;
use App\Models\Workcode;
use App\Support\FaceDescriptor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AntiFakeGpsTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $participant = Participant::create([
            'nama' => 'Peserta Lokasi',
            'nis_nip' => 'gps-'.Str::random(6),
            'qr_token' => Str::uuid(),
            'face_descriptor' => $this->vector(),
            'face_status' => 'approved',
        ]);
        $this->user = User::factory()->create(['role' => 'participant', 'participant_id' => $participant->id, 'device_model' => 'Realme RMX2061']);
        Sanctum::actingAs($this->user, ['role:participant']);
        Workcode::create(['nama_workcode' => 'Kegiatan GPS', 'kategori' => 'workcode', 'is_active' => true]);
    }

    public function test_clean_device_can_attend(): void
    {
        $this->submit(['is_mock' => false, 'mock_app_active' => false, 'fake_apps' => [], 'rooted' => false, 'hooking' => false, 'developer_options' => false])
            ->assertCreated()
            ->assertJsonPath('status', 'success');

        $this->assertDatabaseCount('location_integrity_violations', 0);
    }

    public function test_developer_options_is_logged_once_a_day_without_blocking(): void
    {
        $signals = ['developer_options' => true, 'device_model' => 'Realme RMX2061'];

        $this->postJson('/api/v1/attendance/precheck', ['accuracy' => 8, 'location_integrity' => $signals])->assertOk();
        $this->submit($signals)->assertCreated();

        $log = LocationIntegrityViolation::sole();
        $this->assertFalse($log->blocked);
        $this->assertSame(['developer_options'], $log->reasons);
        $this->assertSame('Realme RMX2061', $log->device_model);
    }

    public function test_blocked_entry_also_notes_developer_options(): void
    {
        $this->submit(['is_mock' => true, 'developer_options' => true])
            ->assertForbidden()
            ->assertJsonPath('reasons', ['mock_location']);

        $log = LocationIntegrityViolation::sole();
        $this->assertTrue($log->blocked);
        $this->assertSame(['mock_location', 'developer_options'], $log->reasons);
    }

    public function test_admin_log_page_lists_user_device_and_reasons(): void
    {
        $this->submit(['fake_apps' => ['GPS Emulator'], 'device_model' => 'Realme RMX2061'])->assertForbidden();
        $other = User::factory()->create(['role' => 'participant', 'participant_id' => Participant::create([
            'nama' => 'Peserta Lain', 'nis_nip' => 'gps-lain', 'qr_token' => Str::uuid(),
        ])->id]);
        LocationIntegrityViolation::create(['user_id' => $other->id, 'participant_id' => $other->participant_id,
            'reasons' => ['developer_options'], 'blocked' => false, 'device_model' => 'Samsung A12']);

        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin)->get(route('admin.fake-gps.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('FakeGps/Index')
                ->has('logs.data', 2)
                ->where('stats.blocked_today', 1)
                ->where('stats.logged_today', 1));

        $this->actingAs($admin)->get(route('admin.fake-gps.index', ['status' => 'blocked']))
            ->assertInertia(fn ($page) => $page->has('logs.data', 1)
                ->where('logs.data.0.device_model', 'Realme RMX2061')
                ->where('logs.data.0.fake_apps', ['GPS Emulator'])
                ->where('logs.data.0.reasons.0.label', 'App fake GPS terpasang')
                ->where('logs.data.0.participant_name', 'Peserta Lokasi'));

        $this->actingAs($admin)->get(route('dashboard'))
            ->assertInertia(fn ($page) => $page->where('fakeGpsBlockedToday', 1));

        // Middleware admin mengalihkan non-admin (sama seperti halaman Perangkat).
        $this->actingAs($this->user)->get(route('admin.fake-gps.index'))->assertRedirect();
    }

    public function test_every_fake_gps_signal_is_rejected_and_logged(): void
    {
        foreach ([
            [['is_mock' => true], 'mock_location'],
            [['mock_app_active' => true], 'mock_app_active'],
            [['fake_apps' => ['Fake GPS Location']], 'fake_app_installed'],
            [['hooking' => true], 'hooking_framework'],
            [['rooted' => true], 'rooted'],
        ] as [$signals, $reason]) {
            $response = $this->submit($signals)
                ->assertForbidden()
                ->assertJsonPath('status', 'fake_gps_detected')
                ->assertJsonPath('reasons', [$reason]);
            $this->assertStringStartsWith('Presensi diblokir.', $response->json('message'));
        }

        $this->assertSame(0, Attendance::count());
        $this->assertSame(5, LocationIntegrityViolation::count());

        $violation = LocationIntegrityViolation::where('reasons', 'like', '%fake_app_installed%')->sole();
        $this->assertSame($this->user->id, $violation->user_id);
        $this->assertSame('Realme RMX2061', $violation->device_model);
        $this->assertSame(['Fake GPS Location'], $violation->signals['fake_apps']);
        $this->assertNotNull($violation->workcode_id);
    }

    public function test_installed_fake_app_is_named_in_message(): void
    {
        $this->submit(['fake_apps' => ['Fake GPS Location', 'GPS JoyStick']])
            ->assertForbidden()
            ->assertJsonPath('message', fn ($message) => str_contains($message, 'Fake GPS Location, GPS JoyStick'));
    }

    public function test_zero_accuracy_counts_as_mock_even_without_signals(): void
    {
        $this->submit(null, accuracy: 0)
            ->assertForbidden()
            ->assertJsonPath('reasons', ['mock_location']);
    }

    public function test_policy_can_relax_root_but_never_mock_location(): void
    {
        config(['attendance.location_integrity.block_root' => false]);

        $this->submit(['rooted' => true])->assertCreated();
        Attendance::query()->delete();

        $this->submit(['rooted' => true, 'is_mock' => true])
            ->assertForbidden()
            ->assertJsonPath('reasons', ['mock_location']);
    }

    public function test_old_app_without_signals_is_rejected_once_required(): void
    {
        config(['attendance.location_integrity.require_signals' => true]);

        $this->submit(null)
            ->assertStatus(426)
            ->assertJsonPath('status', 'app_update_required');
    }

    public function test_precheck_blocks_and_logs_before_face_scan(): void
    {
        $this->postJson('/api/v1/attendance/precheck', ['accuracy' => 8, 'location_integrity' => ['is_mock' => false, 'fake_apps' => []]])
            ->assertOk()
            ->assertJsonPath('status', 'ok');

        $this->postJson('/api/v1/attendance/precheck', ['accuracy' => 8, 'location_integrity' => ['mock_app_active' => true]])
            ->assertForbidden()
            ->assertJsonPath('status', 'fake_gps_detected')
            ->assertJsonPath('reasons', ['mock_app_active']);

        $this->assertSame(1, LocationIntegrityViolation::count());
        $this->assertSame(0, Attendance::count());
    }

    private function submit(?array $signals, float $accuracy = 10)
    {
        return $this->postJson('/api/v1/attendance', array_filter([
            'latitude' => -7.1121,
            'longitude' => 112.1643,
            'accuracy' => $accuracy,
            'device_timestamp' => now()->toIso8601String(),
            'installation_id' => Str::uuid()->toString(),
            'face_descriptor' => $this->vector(),
            'face_model' => 'faceapi-resnet34-128',
            'location_integrity' => $signals,
        ], fn ($value) => $value !== null), ['Idempotency-Key' => Str::uuid()->toString()]);
    }

    private function vector(): array
    {
        return array_pad([1.3], FaceDescriptor::DIMENSIONS, 0.0);
    }
}
