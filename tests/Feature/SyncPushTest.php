<?php

namespace Tests\Feature;

use App\Http\Controllers\SyncController;
use App\Models\User;
use App\Services\FcmService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class SyncPushTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_sync_pushes_full_sync_to_android_and_records_last_sync(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'name' => 'Admin Sekolah']);
        User::factory()->create(['role' => 'participant', 'fcm_token' => 'token-hp']);
        $this->mock(FcmService::class)->shouldReceive('sendFullSync')->once()->andReturnTrue();

        $this->actingAs($admin)
            ->postJson(route('sync.push'))
            ->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('last_sync.by', 'Admin Sekolah')
            ->assertJsonPath('last_sync.devices', 1);

        $this->assertSame('Admin Sekolah', Cache::get(SyncController::LAST_SYNC_KEY)['by']);

        // Jeda antar-sinkronisasi: push kedua langsung ditolak tanpa mengirim FCM lagi.
        $this->actingAs($admin)
            ->postJson(route('sync.push'))
            ->assertStatus(429)
            ->assertJsonStructure(['retry_after_seconds']);
    }

    public function test_failed_push_reports_error_and_can_be_retried(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->mock(FcmService::class)->shouldReceive('sendFullSync')->twice()->andReturnFalse();

        $this->actingAs($admin)->postJson(route('sync.push'))->assertStatus(502);
        $this->actingAs($admin)->postJson(route('sync.push'))->assertStatus(502);
        $this->assertNull(Cache::get(SyncController::LAST_SYNC_KEY));
    }

    public function test_participant_cannot_trigger_sync(): void
    {
        $this->mock(FcmService::class)->shouldNotReceive('sendFullSync');

        $this->actingAs(User::factory()->create(['role' => 'participant']))
            ->postJson(route('sync.push'))
            ->assertForbidden();
    }
}
