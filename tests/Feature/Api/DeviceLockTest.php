<?php

namespace Tests\Feature\Api;

use App\Models\Participant;
use App\Models\User;
use App\Services\FcmService;
use App\Support\DeviceLock;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Tests\TestCase;

class DeviceLockTest extends TestCase
{
    use RefreshDatabase;

    private const HP_LAMA = 'a1b2c3d4e5f60718';

    private const HP_BARU = 'ffee112233445566';

    protected function setUp(): void
    {
        parent::setUp();

        // Skenario di sini memang login berkali-kali; batas 5/menit diuji di tempat lain.
        RateLimiter::for('api-login', fn () => Limit::none());
    }

    public function test_first_login_locks_participant_to_that_device(): void
    {
        $user = $this->participantUser();

        $this->login($user, self::HP_LAMA, 'Samsung A12')->assertOk();

        $user->refresh();
        $this->assertSame(DeviceLock::hash(self::HP_LAMA), $user->device_id_hash);
        $this->assertSame('Samsung A12', $user->device_model);
        $this->assertNotNull($user->device_bound_at);
        $this->assertNotSame(self::HP_LAMA, $user->device_id_hash, 'ID asli tidak boleh tersimpan');

        // Login ulang di HP yang sama tetap boleh.
        $this->login($user, self::HP_LAMA)->assertOk();
        $this->assertCount(2, $user->tokens()->get());
    }

    public function test_first_binding_revokes_tokens_from_before_the_lock(): void
    {
        $user = $this->participantUser();
        $user->createToken('token-lama', ['role:participant']);

        $this->login($user, self::HP_LAMA)->assertOk();

        $this->assertCount(1, $user->tokens()->get());
    }

    public function test_login_from_another_device_is_rejected(): void
    {
        $user = $this->participantUser();
        $this->login($user, self::HP_LAMA, 'Samsung A12')->assertOk();

        $this->login($user, self::HP_BARU)
            ->assertForbidden()
            ->assertJsonPath('code', 'device_not_registered')
            ->assertJsonPath('data.registered_device_model', 'Samsung A12')
            ->assertJsonPath('message', 'Akun Anda sudah terdaftar di HP lain (Samsung A12). Minta admin mereset kunci perangkat agar bisa login di HP ini.');

        $this->assertCount(1, $user->tokens()->get());
    }

    public function test_wrong_password_never_reveals_device_information(): void
    {
        $user = $this->participantUser();
        $this->login($user, self::HP_LAMA)->assertOk();

        $this->postJson('/api/v1/auth/login', [
            'login' => $user->username,
            'password' => 'salah',
            'device_name' => 'Android',
            'device_id' => self::HP_BARU,
        ])->assertUnauthorized()->assertJsonMissingPath('code')->assertJsonMissingPath('data');
    }

    public function test_admin_accounts_are_not_locked(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'username' => 'admin1']);

        $this->login($admin, self::HP_LAMA)->assertOk();
        $this->login($admin, self::HP_BARU)->assertOk();

        $this->assertNull($admin->fresh()->device_id_hash);
    }

    public function test_old_app_without_device_id_is_allowed_only_during_transition(): void
    {
        $user = $this->participantUser();

        $this->login($user, null)->assertOk();
        $this->assertNull($user->fresh()->device_id_hash);

        config(['attendance.device_lock.require_device_id' => true]);

        $this->login($user, null)
            ->assertStatus(426)
            ->assertJsonPath('code', 'app_update_required');
    }

    public function test_admin_reset_releases_lock_and_next_login_binds_new_device(): void
    {
        $user = $this->participantUser();
        $this->login($user, self::HP_LAMA)->assertOk();
        // HP baru ditolak sampai admin mereset kunci.
        $this->login($user, self::HP_BARU)->assertForbidden();

        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin)
            ->post(route('admin.devices.reset', $user))
            ->assertSessionHas('success');

        $user->refresh();
        $this->assertNull($user->device_id_hash);
        $this->assertCount(0, $user->tokens()->get());

        $this->login($user, self::HP_BARU)->assertOk();
        $this->assertSame(DeviceLock::hash(self::HP_BARU), $user->fresh()->device_id_hash);
    }

    public function test_admin_can_reset_all_device_locks_at_once(): void
    {
        $pertama = $this->participantUser();
        $kedua = $this->participantUser();
        $belumLogin = $this->participantUser();
        $this->login($pertama, self::HP_LAMA)->assertOk();
        $this->login($kedua, self::HP_BARU)->assertOk();

        // Peserta biasa tidak boleh memicu reset massal.
        $this->actingAs($belumLogin)->post(route('admin.devices.reset-all'))->assertRedirect();
        $this->assertNotNull($pertama->fresh()->device_id_hash);

        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin)
            ->post(route('admin.devices.reset-all'))
            ->assertSessionHas('success');

        foreach ([$pertama, $kedua] as $user) {
            $user->refresh();
            $this->assertNull($user->device_id_hash);
            $this->assertNull($user->device_bound_at);
            $this->assertCount(0, $user->tokens()->get());
        }

        // Login berikutnya (mis. APK dengan kunci tanda tangan baru) langsung mendaftarkan HP.
        $this->login($pertama, 'ffff000011112222')->assertOk();
        $this->assertSame(DeviceLock::hash('ffff000011112222'), $pertama->fresh()->device_id_hash);

        // Tidak ada lagi yang terkunci: reset kedua memberi pesan, bukan sukses palsu.
        User::whereKey($pertama->id)->update(['device_id_hash' => null]);
        $this->actingAs($admin)->post(route('admin.devices.reset-all'))->assertSessionHas('error');
    }

    public function test_device_locked_to_one_account_rejects_login_from_another_account(): void
    {
        $pemilik = $this->participantUser();
        $lain = $this->participantUser();

        $this->login($pemilik, self::HP_LAMA)->assertOk();

        $this->login($lain, self::HP_LAMA)
            ->assertForbidden()
            ->assertJsonPath('code', 'device_in_use');

        $this->assertNull($lain->fresh()->device_id_hash, 'Akun lain tidak boleh ikut terikat ke HP ini');
        $this->assertCount(0, $lain->tokens()->get());

        // Pemilik tetap bisa login di HP-nya.
        $this->login($pemilik, self::HP_LAMA)->assertOk();
    }

    public function test_legacy_duplicate_binding_only_keeps_the_earliest_account(): void
    {
        $pemilik = $this->participantUser();
        $lain = $this->participantUser();
        $hash = DeviceLock::hash(self::HP_LAMA);
        $pemilik->forceFill(['device_id_hash' => $hash, 'device_bound_at' => now()->subDay()])->save();
        $lain->forceFill(['device_id_hash' => $hash, 'device_bound_at' => now()])->save();

        $this->login($pemilik, self::HP_LAMA)->assertOk();
        $this->login($lain, self::HP_LAMA)->assertForbidden()->assertJsonPath('code', 'device_in_use');
    }

    public function test_device_admin_page_is_admin_only_and_hides_device_hash(): void
    {
        $user = $this->participantUser();
        $this->login($user, self::HP_LAMA, 'Samsung A12')->assertOk();

        $this->actingAs($user)->get(route('admin.devices.index'))->assertRedirect();
        $this->actingAs($user)->post(route('admin.devices.reset', $user))->assertRedirect();
        $this->assertNotNull($user->fresh()->device_id_hash);

        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin)
            ->get(route('admin.devices.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Devices/Index')
                ->where('devices.0.device_model', 'Samsung A12')
                ->where('participantCount', 1)
                ->missing('devices.0.device_id_hash')
                ->missing('deviceRequests'));
    }

    public function test_device_change_request_endpoint_is_gone(): void
    {
        $user = $this->participantUser();

        $this->postJson('/api/v1/auth/device-change-requests', [
            'login' => $user->username,
            'password' => 'password',
            'device_id' => self::HP_BARU,
            'reason' => 'HP lama rusak',
        ])->assertNotFound();
    }

    public function test_old_device_is_pushed_to_sign_out_on_reset(): void
    {
        $user = $this->participantUser();
        $this->login($user, self::HP_LAMA, 'Samsung A12')->assertOk();
        $user->forceFill(['fcm_token' => 'fcm-hp-lama'])->save();

        $this->mock(FcmService::class)->shouldReceive('sendSessionRevoked')->once()->with('fcm-hp-lama', 'device_reset');

        $this->actingAs(User::factory()->create(['role' => 'admin']))
            ->post(route('admin.devices.reset', $user))
            ->assertSessionHas('success');
        $this->assertNull($user->fresh()->device_id_hash);
        $this->assertNull($user->fresh()->fcm_token);
    }

    private function login(User $user, ?string $deviceId, ?string $deviceModel = null)
    {
        return $this->postJson('/api/v1/auth/login', array_filter([
            'login' => $user->username ?? $user->email,
            'password' => 'password',
            'device_name' => 'Android App',
            'device_id' => $deviceId,
            'device_model' => $deviceModel,
        ]));
    }

    private function participantUser(): User
    {
        $participant = Participant::create([
            'nama' => 'Peserta Uji',
            'nis_nip' => Str::uuid()->toString(),
            'qr_token' => Str::uuid()->toString(),
        ]);

        return User::factory()->create([
            'role' => 'participant',
            'username' => 'peserta'.$participant->id,
            'participant_id' => $participant->id,
        ]);
    }
}
