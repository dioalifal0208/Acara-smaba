<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/login');

        $response->assertRedirect('/');
    }

    public function test_password_reset_by_email_is_not_available(): void
    {
        // Akun dibuat & diubah admin; email tidak dikonfigurasi, jadi tidak ada reset mandiri.
        foreach (['password.request', 'password.email', 'password.reset', 'password.store'] as $name) {
            $this->assertFalse(Route::has($name), $name);
        }

        $this->get('/forgot-password')->assertNotFound();
        $this->post('/forgot-password', ['email' => 'admin@smaba.sch.id'])->assertNotFound();
        $this->post('/reset-password', ['token' => 'x'])->assertNotFound();
    }

    public function test_users_can_authenticate_using_the_login_screen(): void
    {
        $user = User::factory()->create(['role' => 'admin']);

        $response = $this->post('/login', [
            'login' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_users_can_not_authenticate_with_invalid_password(): void
    {
        $user = User::factory()->create();

        $this->post('/login', [
            'login' => $user->email,
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
    }

    public function test_users_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/');
    }
}
