<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class MakeAdminUserCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_creates_new_admin_with_interactive_password(): void
    {
        $this->artisan('user:make-admin', ['username' => 'operator1', '--name' => 'Operator TU'])
            ->expectsQuestion('Password', 'rahasia-kuat-123')
            ->expectsQuestion('Ulangi password', 'rahasia-kuat-123')
            ->assertSuccessful();

        $user = User::where('username', 'operator1')->firstOrFail();
        $this->assertSame('admin', $user->role);
        $this->assertSame('Operator TU', $user->name);
        $this->assertTrue(Hash::check('rahasia-kuat-123', $user->password));
    }

    public function test_promotes_existing_user_after_confirmation(): void
    {
        User::factory()->create(['username' => 'guru1', 'role' => 'participant']);

        $this->artisan('user:make-admin', ['username' => 'guru1'])
            ->expectsConfirmation("User 'guru1' sudah ada (role: participant). Jadikan admin dan ganti passwordnya?", 'yes')
            ->expectsQuestion('Password', 'rahasia-kuat-123')
            ->expectsQuestion('Ulangi password', 'rahasia-kuat-123')
            ->assertSuccessful();

        $this->assertSame('admin', User::where('username', 'guru1')->value('role'));
    }

    public function test_rejects_mismatched_or_short_password(): void
    {
        $this->artisan('user:make-admin', ['username' => 'operator2'])
            ->expectsQuestion('Password', 'rahasia-kuat-123')
            ->expectsQuestion('Ulangi password', 'beda')
            ->assertFailed();

        $this->artisan('user:make-admin', ['username' => 'operator3'])
            ->expectsQuestion('Password', 'pendek')
            ->expectsQuestion('Ulangi password', 'pendek')
            ->assertFailed();

        $this->assertSame(0, User::count());
    }
}
