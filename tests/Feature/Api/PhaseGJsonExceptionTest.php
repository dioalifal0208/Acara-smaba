<?php

namespace Tests\Feature\Api;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PhaseGJsonExceptionTest extends TestCase
{
    use RefreshDatabase;

    public function test_api_v1_me_returns_json_401_without_accept_header()
    {
        $response = $this->get('/api/v1/me');

        $response->assertStatus(401);
        $this->assertStringContainsString('application/json', $response->headers->get('Content-Type'));
        $response->assertJsonStructure(['message']);
    }

    public function test_api_v1_login_validation_error_returns_json_422()
    {
        $response = $this->post('/api/v1/auth/login', []);

        $response->assertStatus(422);
        $this->assertStringContainsString('application/json', $response->headers->get('Content-Type'));
        $response->assertJsonStructure(['message', 'errors']);
    }

    public function test_web_protected_route_retains_redirect()
    {
        $response = $this->get('/dashboard');

        $response->assertStatus(302);
        $response->assertRedirect(route('login'));
    }
}
