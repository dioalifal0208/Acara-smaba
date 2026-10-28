<?php

namespace Tests\Feature;

use App\Models\Participant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Tests\TestCase;

/** Admin mengganti / mereset password akun peserta dari halaman Detail Peserta. */
class ParticipantPasswordTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_reset_password_to_nis_nip(): void
    {
        [$participant, $user] = $this->participantWithAccount();

        $this->actingAs($this->admin())
            ->put(route('participants.password.update', $participant), ['mode' => 'reset'])
            ->assertSessionHasNoErrors()
            ->assertSessionHas('success');

        $this->assertTrue(Hash::check('198811052015041003', $user->fresh()->password));
    }

    public function test_admin_can_set_a_new_password(): void
    {
        [$participant, $user] = $this->participantWithAccount();

        $this->actingAs($this->admin())
            ->put(route('participants.password.update', $participant), [
                'mode' => 'custom',
                'password' => 'rahasia-baru-123',
                'password_confirmation' => 'rahasia-baru-123',
            ])
            ->assertSessionHasNoErrors();

        $this->assertTrue(Hash::check('rahasia-baru-123', $user->fresh()->password));

        // Peserta bisa login web dengan password baru.
        auth()->logout();
        $this->post('/login', ['login' => '198811052015041003', 'password' => 'rahasia-baru-123'])
            ->assertRedirect(route('participant.dashboard', absolute: false));
    }

    public function test_new_password_must_be_confirmed_and_long_enough(): void
    {
        [$participant, $user] = $this->participantWithAccount();
        $admin = $this->admin();

        $this->actingAs($admin)
            ->put(route('participants.password.update', $participant), [
                'mode' => 'custom', 'password' => 'rahasia-baru-123', 'password_confirmation' => 'lain-sekali-123',
            ])
            ->assertSessionHasErrors('password');

        $this->actingAs($admin)
            ->put(route('participants.password.update', $participant), [
                'mode' => 'custom', 'password' => 'pendek', 'password_confirmation' => 'pendek',
            ])
            ->assertSessionHasErrors('password');

        $this->assertTrue(Hash::check('lama-sekali-123', $user->fresh()->password));
    }

    public function test_logout_sessions_revokes_android_tokens_only_when_requested(): void
    {
        [$participant, $user] = $this->participantWithAccount();
        $user->createToken('HP Peserta', ['role:participant']);
        $admin = $this->admin();

        $this->actingAs($admin)
            ->put(route('participants.password.update', $participant), ['mode' => 'reset'])
            ->assertSessionHas('success');
        $this->assertSame(1, $user->tokens()->count());

        $this->actingAs($admin)
            ->put(route('participants.password.update', $participant), ['mode' => 'reset', 'logout_sessions' => true])
            ->assertSessionHas('success');
        $this->assertSame(0, $user->tokens()->count());
    }

    public function test_participant_without_account_shows_error(): void
    {
        $participant = Participant::create(['nama' => 'Guru GTT', 'nis_nip' => '-', 'status' => 'GTT', 'qr_token' => Str::uuid()->toString()]);

        $this->actingAs($this->admin())
            ->put(route('participants.password.update', $participant), ['mode' => 'reset'])
            ->assertSessionHas('error');
    }

    public function test_only_admin_can_change_participant_password(): void
    {
        [$participant, $user] = $this->participantWithAccount();
        [, $otherUser] = $this->participantWithAccount('197508242005012008');

        $this->actingAs($otherUser)
            ->put(route('participants.password.update', $participant), ['mode' => 'reset'])
            ->assertRedirect('/');

        $this->assertTrue(Hash::check('lama-sekali-123', $user->fresh()->password));
    }

    private function participantWithAccount(string $nip = '198811052015041003'): array
    {
        $participant = Participant::create(['nama' => 'Budi', 'nis_nip' => $nip, 'status' => 'PNS', 'qr_token' => Str::uuid()->toString()]);
        $user = User::factory()->create([
            'role' => 'participant',
            'username' => $nip,
            'participant_id' => $participant->id,
            'password' => Hash::make('lama-sekali-123'),
        ]);

        return [$participant, $user];
    }

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin', 'username' => 'admin-uji']);
    }
}
