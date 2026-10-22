<?php

namespace Tests\Feature;

use App\Models\Participant;
use App\Models\User;
use App\Support\WebSync;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class WebSyncTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::store('file')->flush();
    }

    public function test_android_pull_to_refresh_bumps_the_signal_polled_by_the_web(): void
    {
        $before = $this->getJson('/sync/signal')
            ->assertOk()
            ->assertHeader('Cache-Control', 'max-age=0, no-store, private')
            ->json('v');

        Sanctum::actingAs($this->participantUser(), ['role:participant']);
        $this->postJson('/api/v1/sync')->assertOk()->assertJsonPath('status', 'success');

        $this->assertGreaterThan($before, $this->getJson('/sync/signal')->json('v'));
    }

    public function test_signal_endpoint_does_not_start_a_session(): void
    {
        $this->get('/sync/signal')->assertOk()->assertCookieMissing(config('session.cookie'));
    }

    public function test_successful_android_writes_bump_the_signal_but_reads_and_failures_do_not(): void
    {
        Sanctum::actingAs($this->participantUser(), ['role:participant']);

        $this->getJson('/api/v1/me/state')->assertOk();
        $this->assertSame(0, WebSync::current()['v'], 'GET tidak boleh menaikkan sinyal');

        $this->postJson('/api/v1/attendance', [])->assertClientError();
        $this->assertSame(0, WebSync::current()['v'], 'Request gagal tidak boleh menaikkan sinyal');

        $this->postJson('/api/v1/sync')->assertOk();
        $this->assertGreaterThan(0, WebSync::current()['v']);
    }

    public function test_only_participant_tokens_can_trigger(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']), ['role:admin']);

        $this->postJson('/api/v1/sync')->assertForbidden();
    }

    private function participantUser(): User
    {
        $participant = Participant::create([
            'nama' => 'Peserta Sync',
            'nis_nip' => 'sync-'.Str::random(8),
            'qr_token' => Str::uuid(),
        ]);

        return User::factory()->create(['role' => 'participant', 'participant_id' => $participant->id]);
    }
}
