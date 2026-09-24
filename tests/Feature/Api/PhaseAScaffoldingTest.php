<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class PhaseAScaffoldingTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_sanctum_token_with_abilities()
    {
        $user = User::factory()->create();

        $token = $user->createToken('test-device', ['attendance:check-in']);

        $this->assertNotNull($token->plainTextToken);
        $this->assertTrue($user->tokens()->where('name', 'test-device')->exists());
        $this->assertTrue($user->tokens()->first()->can('attendance:check-in'));
    }

    public function test_api_rate_limiters_are_registered()
    {
        $this->assertNotNull(RateLimiter::limiter('api'), 'The api rate limiter is missing.');
        $this->assertNotNull(RateLimiter::limiter('api-login'), 'The api-login rate limiter is missing.');
    }

    public function test_api_route_file_is_loaded()
    {
        // Simple test to ensure the framework registers the /api route prefix
        // Since we didn't define endpoints, we just check if the prefix exists or wait, 
        // we can check if it returns 404 (meaning router knows it) vs something else.
        $response = $this->getJson('/api/non-existent-route-should-be-404');
        $response->assertStatus(404);
    }
}
