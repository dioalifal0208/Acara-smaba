<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_is_not_available(): void
    {
        $this->get('/register')->assertNotFound();
    }

    public function test_public_registration_cannot_create_users(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertNotFound();
        $this->assertGuest();
        $this->assertSame(0, User::count());
    }

    public function test_new_users_default_to_participant_role(): void
    {
        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        $this->assertSame('participant', $user->fresh()->role);
    }

    public function test_role_cannot_be_mass_assigned(): void
    {
        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'role' => 'admin',
        ]);

        $this->assertSame('participant', $user->fresh()->role);
    }

    public function test_profile_update_cannot_change_role(): void
    {
        $user = User::factory()->create(['role' => 'participant']);

        $this->actingAs($user)->patch('/profile', [
            'name' => 'Nama Baru',
            'email' => $user->email,
            'role' => 'admin',
        ]);

        $this->assertSame('participant', $user->fresh()->role);
    }
}
