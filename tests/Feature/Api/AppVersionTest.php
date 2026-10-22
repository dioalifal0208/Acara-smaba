<?php

namespace Tests\Feature\Api;

use App\Models\Participant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AppVersionTest extends TestCase
{
    use RefreshDatabase;

    public function test_no_minimum_version_lets_every_app_through(): void
    {
        $this->actingAsParticipant();

        $this->getJson('/api/v1/me/state')->assertOk();
    }

    public function test_outdated_or_unversioned_app_must_update(): void
    {
        config([
            'attendance.android_app.min_version_code' => 2,
            'attendance.android_app.update_url' => 'https://example.test/presensi.apk',
        ]);
        $this->actingAsParticipant();

        foreach ([[], ['X-App-Version-Code' => '1']] as $headers) {
            $this->getJson('/api/v1/me/state', $headers)
                ->assertStatus(426)
                ->assertJsonPath('code', 'app_update_required')
                ->assertJsonPath('data.min_version_code', 2)
                ->assertJsonPath('data.update_url', 'https://example.test/presensi.apk');
        }

        // Login juga diblok, jadi APK lama tidak bisa masuk sama sekali.
        $this->postJson('/api/v1/auth/login', ['login' => 'x', 'password' => 'y', 'device_name' => 'z'])
            ->assertStatus(426);

        $this->getJson('/api/v1/me/state', ['X-App-Version-Code' => '2'])->assertOk();
    }

    public function test_participant_app_version_is_recorded(): void
    {
        $user = $this->actingAsParticipant();

        $this->getJson('/api/v1/me/state', ['X-App-Version-Code' => '3', 'X-App-Version-Name' => '1.2.0'])->assertOk();

        $user->refresh();
        $this->assertSame(3, $user->app_version_code);
        $this->assertSame('1.2.0', $user->app_version_name);
    }

    private function actingAsParticipant(): User
    {
        $participant = Participant::create([
            'nama' => 'Peserta Versi',
            'nis_nip' => 'ver-'.Str::random(8),
            'qr_token' => Str::uuid(),
        ]);
        $user = User::factory()->create(['role' => 'participant', 'participant_id' => $participant->id]);
        Sanctum::actingAs($user, ['role:participant']);

        return $user;
    }
}
