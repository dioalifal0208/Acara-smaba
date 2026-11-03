<?php

namespace Tests\Feature;

use App\Models\Participant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/** Peserta yang masih memakai password awal (NIS/NIP) wajib menggantinya sebelum memakai website. */
class DefaultPasswordChangeTest extends TestCase
{
    use RefreshDatabase;

    private const NIP = '198811052015041003';

    public function test_participant_with_default_password_is_sent_to_profile_after_login(): void
    {
        $user = $this->participant(self::NIP);

        $this->post('/login', ['login' => self::NIP, 'password' => self::NIP])
            ->assertRedirect(route('participant.dashboard', absolute: false));

        $this->get(route('participant.dashboard'))->assertRedirect(route('profile.edit'));
        // QR pribadi (bisa dipakai titip absen lewat Scanner) dan pengajuan izin ikut tertutup.
        $this->get(route('participants.qr', $user->participant_id))->assertRedirect(route('profile.edit'));
        $this->post(route('leave.store'))->assertRedirect(route('profile.edit'));

        $this->get(route('profile.edit'))->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('mustChangePassword', true));
    }

    public function test_new_password_cannot_be_the_nis_nip_and_unlocks_the_site(): void
    {
        $user = $this->participant(self::NIP);
        $this->actingAs($user);

        $this->from(route('profile.edit'))->put(route('password.update'), [
            'current_password' => self::NIP,
            'password' => self::NIP,
            'password_confirmation' => self::NIP,
        ])->assertSessionHasErrors('password');

        $this->put(route('password.update'), [
            'current_password' => self::NIP,
            'password' => 'rahasia-baru-123',
            'password_confirmation' => 'rahasia-baru-123',
        ])->assertRedirect(route('participant.dashboard'));

        $this->get(route('participant.dashboard'))->assertOk();
        $this->get(route('profile.edit'))
            ->assertInertia(fn (Assert $page) => $page->where('mustChangePassword', false));
    }

    public function test_admin_reset_to_nis_nip_locks_the_open_session_again(): void
    {
        $user = $this->participant('rahasia-lama-123');
        $this->actingAs($user)->get(route('participant.dashboard'))->assertOk();

        $user->forceFill(['password' => Hash::make(self::NIP)])->save();

        $this->get(route('participant.dashboard'))->assertRedirect(route('profile.edit'));
    }

    public function test_admin_and_changed_passwords_are_not_affected(): void
    {
        $this->actingAs($this->participant('rahasia-lama-123'))
            ->get(route('participant.dashboard'))->assertOk();

        // Admin tidak punya NIS/NIP, jadi tidak pernah diminta.
        $admin = User::factory()->create(['role' => 'admin', 'username' => 'admin-uji', 'password' => Hash::make('admin')]);
        $this->actingAs($admin)->get(route('dashboard'))->assertOk();
    }

    public function test_json_requests_get_403_instead_of_a_redirect(): void
    {
        $user = $this->participant(self::NIP);

        $this->actingAs($user)
            ->getJson(route('participants.qr', $user->participant_id))
            ->assertForbidden();
    }

    private function participant(string $password): User
    {
        $participant = Participant::create(['nama' => 'Budi', 'nis_nip' => self::NIP, 'status' => 'PNS', 'qr_token' => Str::uuid()->toString()]);

        // Participant::saving bisa sudah membuat akun; pakai akun itu bila ada.
        $user = User::where('participant_id', $participant->id)->first()
            ?? User::factory()->create(['role' => 'participant', 'username' => self::NIP, 'participant_id' => $participant->id]);
        $user->forceFill(['password' => Hash::make($password)])->save();

        return $user;
    }
}
