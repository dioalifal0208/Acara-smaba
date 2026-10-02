<?php

namespace Tests\Feature\Api;

use App\Models\Participant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PhaseHFcmTest extends TestCase
{
    use RefreshDatabase;

    public function test_fcm_token_register()
    {
        $user = User::factory()->create(['role' => 'participant']);
        $participant = Participant::create(['nama' => 'Test', 'nis_nip' => '123', 'qr_token' => Str::uuid()]);
        $user->participant_id = $participant->id;
        $user->save();
        Sanctum::actingAs($user, ['role:participant']);

        $response = $this->postJson('/api/v1/fcm/register', [
            'token' => 'dummy-fcm-token-12345',
        ]);

        $response->assertStatus(200)
            ->assertJson(['status' => 'success']);

        $user->refresh();
        $this->assertEquals('dummy-fcm-token-12345', $user->fcm_token);
    }

    public function test_fcm_token_unregister()
    {
        $user = User::factory()->create(['role' => 'participant', 'fcm_token' => 'old-token']);
        $participant = Participant::create(['nama' => 'Test', 'nis_nip' => '123', 'qr_token' => Str::uuid()]);
        $user->participant_id = $participant->id;
        $user->save();
        Sanctum::actingAs($user, ['role:participant']);

        $response = $this->deleteJson('/api/v1/fcm/unregister');

        $response->assertStatus(200)
            ->assertJson(['status' => 'success']);

        $user->refresh();
        $this->assertNull($user->fcm_token);
    }
}
