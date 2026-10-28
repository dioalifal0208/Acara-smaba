<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminRoleTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_email_alone_does_not_grant_admin(): void
    {
        $participant = User::factory()->create([
            'role' => 'participant',
            'username' => '198811052015041003',
            'email' => 'admin@smaba.sch.id',
        ]);

        $this->assertFalse($participant->isAdmin());
        $this->actingAs($participant)->get('/dashboard')->assertRedirect('/');
    }

    public function test_participant_cannot_become_admin_by_changing_email(): void
    {
        $participant = User::factory()->create(['role' => 'participant', 'username' => '197508242005012008']);

        $this->actingAs($participant)->patch('/profile', [
            'name' => $participant->name,
            'email' => 'admin@smaba.sch.id',
        ]);

        $this->assertFalse($participant->fresh()->isAdmin());
        $this->actingAs($participant->fresh())->get('/dashboard')->assertRedirect('/');
    }

    public function test_admin_role_grants_admin(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'username' => 'operator1']);

        $this->assertTrue($admin->isAdmin());
        $this->actingAs($admin)->get('/dashboard')->assertOk();
    }
}
