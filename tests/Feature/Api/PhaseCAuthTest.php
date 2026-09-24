<?php

namespace Tests\Feature\Api;

use App\Models\Participant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PhaseCAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_api_login_successful()
    {
        $user = User::factory()->create([
            'username' => 'testuser',
            'email' => 'test@example.com',
            'role' => 'participant',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'login' => 'testuser',
            'password' => 'password',
            'device_name' => 'Android App',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure(['status', 'data' => ['token']]);
        
        $this->assertEquals('success', $response->json('status'));
        $this->assertCount(1, $user->tokens);
        $this->assertTrue($user->tokens->first()->can('role:participant'));
    }

    public function test_api_login_successful_with_email()
    {
        $user = User::factory()->create([
            'email' => 'test2@example.com',
            'role' => 'admin',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'login' => 'test2@example.com',
            'password' => 'password',
            'device_name' => 'Android App',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure(['status', 'data' => ['token']]);
        
        $this->assertTrue($user->tokens->first()->can('role:admin'));
    }

    public function test_api_login_fails_with_invalid_credentials()
    {
        $user = User::factory()->create([
            'username' => 'testuser',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'login' => 'testuser',
            'password' => 'wrongpassword',
            'device_name' => 'Android',
        ]);

        $response->assertStatus(401)
                 ->assertJson([
                     'status' => 'error',
                     'message' => __('auth.failed')
                 ]);
        
        $this->assertCount(0, $user->tokens);
    }

    public function test_api_logout_revokes_token()
    {
        $user = User::factory()->create();

        // First we need to have a token to revoke
        $token = $user->createToken('test')->plainTextToken;

        // Login using the token directly (Sanctum::actingAs doesn't set a real PersonalAccessToken in the DB for the current request sometimes, but we can just use the token in header)
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/v1/auth/logout');

        $response->assertStatus(200)
                 ->assertJson(['status' => 'success', 'message' => 'Berhasil logout.']);

        $this->assertCount(0, $user->tokens);
    }

    public function test_api_me_returns_unauthenticated_without_token()
    {
        $response = $this->getJson('/api/v1/me');
        $response->assertStatus(401);
    }

    public function test_api_me_returns_profile_without_sensitive_data()
    {
        $user = User::factory()->create([
            'username' => 'testuser',
            'name' => 'Test Name',
            'email' => 'test@test.com',
            'role' => 'participant'
        ]);

        $participant = Participant::create([
            'nama' => 'Test Name',
            'nis_nip' => '12345',
            'qr_token' => Str::uuid(),
            'face_descriptor' => '{"some":"data"}',
            'face_status' => 'approved',
        ]);
        
        $user->participant_id = $participant->id;
        $user->save();

        Sanctum::actingAs($user, ['role:participant']);

        $response = $this->getJson('/api/v1/me');

        $response->assertStatus(200)
                 ->assertJson([
                     'status' => 'success',
                     'data' => [
                         'user' => [
                             'id' => $user->id,
                             'username' => 'testuser',
                             'email' => 'test@test.com',
                             'role' => 'participant',
                             'name' => 'Test Name',
                             'participant' => [
                                 'nis_nip' => '12345',
                                 'nama' => 'Test Name',
                                 'face_status' => 'approved',
                                 'photo_url' => null, // Assuming no file actually exists in storage for this test
                             ]
                         ]
                     ]
                 ]);

        // Ensure sensitive data is not returned
        $json = $response->json();
        $this->assertArrayNotHasKey('face_descriptor', $json['data']['user']['participant'] ?? []);
        $this->assertArrayNotHasKey('qr_token', $json['data']['user']['participant'] ?? []);
        $this->assertArrayNotHasKey('password', $json['data']['user'] ?? []);
        $this->assertArrayNotHasKey('remember_token', $json['data']['user'] ?? []);
    }
}
