<?php

namespace Tests\Feature\Api;

use App\Models\DeviceChangeRequest;
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
            ->assertJsonPath('data.device_change_request', null);

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
        ])->assertUnauthorized()->assertJsonMissingPath('code');

        $this->postJson('/api/v1/auth/device-change-requests', [
            'login' => $user->username,
            'password' => 'salah',
            'device_id' => self::HP_BARU,
            'reason' => 'HP lama rusak',
        ])->assertUnauthorized();

        $this->assertSame(0, DeviceChangeRequest::count());
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

    public function test_device_change_request_flow_until_admin_approval(): void
    {
        $user = $this->participantUser();
        $this->login($user, self::HP_LAMA, 'Samsung A12')->assertOk();
        $oldToken = $user->tokens()->first();

        $this->requestChange($user, self::HP_BARU, 'Xiaomi Redmi 13', 'HP lama rusak')
            ->assertCreated()
            ->assertJsonPath('data.device_change_request.status', 'pending')
            ->assertJsonPath('data.device_change_request.device_model', 'Xiaomi Redmi 13')
            ->assertJsonMissingPath('data.device_change_request.device_id_hash');

        // Selama menunggu: login di HP baru masih ditolak dengan kode khusus.
        $this->login($user, self::HP_BARU)
            ->assertForbidden()
            ->assertJsonPath('code', 'device_change_pending')
            ->assertJsonPath('data.device_change_request.status', 'pending');

        // Tanpa batas jumlah, tetapi hanya satu yang menunggu: pengajuan baru menggantikannya.
        $this->requestChange($user, self::HP_BARU, 'Xiaomi Redmi 13', 'HP lama hilang')->assertOk();
        $this->assertSame(1, DeviceChangeRequest::where('status', 'pending')->count());

        $changeRequest = DeviceChangeRequest::sole();
        $this->assertSame('Samsung A12', $changeRequest->previous_device_model);
        $this->assertSame('HP lama hilang', $changeRequest->reason);

        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin)
            ->post(route('admin.device-change-requests.approve', $changeRequest))
            ->assertRedirect()
            ->assertSessionHas('success');

        $user->refresh();
        $this->assertSame(DeviceLock::hash(self::HP_BARU), $user->device_id_hash);
        $this->assertSame('Xiaomi Redmi 13', $user->device_model);
        $this->assertSame('approved', $changeRequest->fresh()->status);
        $this->assertSame($admin->id, $changeRequest->fresh()->reviewed_by);
        $this->assertDatabaseMissing('personal_access_tokens', ['id' => $oldToken->id]);

        // Diproses dua kali tidak mengubah apa-apa.
        $this->actingAs($admin)
            ->post(route('admin.device-change-requests.approve', $changeRequest))
            ->assertSessionHas('error');

        $this->login($user, self::HP_BARU)->assertOk();
        $this->login($user, self::HP_LAMA)->assertForbidden();
    }

    public function test_rejected_request_keeps_old_device_and_can_be_resubmitted(): void
    {
        $user = $this->participantUser();
        $this->login($user, self::HP_LAMA)->assertOk();
        $this->requestChange($user, self::HP_BARU, 'Oppo A5', 'Pinjam HP teman')->assertCreated();

        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin)
            ->post(route('admin.device-change-requests.reject', DeviceChangeRequest::sole()), [
                'rejection_reason' => 'Gunakan HP sendiri.',
            ])->assertSessionHas('success');

        $this->assertSame(DeviceLock::hash(self::HP_LAMA), $user->fresh()->device_id_hash);
        $this->login($user, self::HP_LAMA)->assertOk();

        $this->login($user, self::HP_BARU)
            ->assertForbidden()
            ->assertJsonPath('code', 'device_not_registered')
            ->assertJsonPath('data.device_change_request.status', 'rejected')
            ->assertJsonPath('data.device_change_request.rejection_reason', 'Gunakan HP sendiri.');

        $this->requestChange($user, self::HP_BARU, 'Oppo A5', 'Sekarang HP sendiri')->assertCreated();
        $this->assertSame(2, DeviceChangeRequest::count());
    }

    public function test_request_is_refused_when_device_is_already_allowed(): void
    {
        $user = $this->participantUser();

        // Belum terkunci: cukup login langsung.
        $this->requestChange($user, self::HP_BARU, null, 'HP baru saya')
            ->assertStatus(409)
            ->assertJsonPath('code', 'device_already_allowed');

        $this->login($user, self::HP_LAMA)->assertOk();
        $this->requestChange($user, self::HP_LAMA, null, 'HP yang sama')->assertStatus(409);
    }

    public function test_admin_reset_releases_lock_and_next_login_binds_new_device(): void
    {
        $user = $this->participantUser();
        $this->login($user, self::HP_LAMA)->assertOk();
        $this->requestChange($user, self::HP_BARU, null, 'HP hilang')->assertCreated();

        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin)
            ->post(route('admin.devices.reset', $user))
            ->assertSessionHas('success');

        $user->refresh();
        $this->assertNull($user->device_id_hash);
        $this->assertCount(0, $user->tokens()->get());
        $this->assertSame('rejected', DeviceChangeRequest::sole()->status);

        $this->login($user, self::HP_BARU)->assertOk();
        $this->assertSame(DeviceLock::hash(self::HP_BARU), $user->fresh()->device_id_hash);
    }

    public function test_device_admin_pages_are_admin_only(): void
    {
        $user = $this->participantUser();
        $this->login($user, self::HP_LAMA, 'Samsung A12')->assertOk();
        $this->requestChange($user, self::HP_BARU, 'Xiaomi', 'Ganti HP')->assertCreated();
        $changeRequest = DeviceChangeRequest::sole();

        $this->actingAs($user)->get(route('admin.devices.index'))->assertRedirect();
        $this->actingAs($user)->post(route('admin.device-change-requests.approve', $changeRequest))->assertRedirect();
        $this->assertSame('pending', $changeRequest->fresh()->status);

        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin)
            ->get(route('admin.devices.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Devices/Index')
                ->where('deviceRequests.0.device_model', 'Xiaomi')
                ->where('devices.0.device_model', 'Samsung A12')
                ->missing('deviceRequests.0.device_id_hash'));
    }

    public function test_old_device_is_pushed_to_sign_out_on_approval_and_reset(): void
    {
        $user = $this->participantUser();
        $this->login($user, self::HP_LAMA, 'Samsung A12')->assertOk();
        $user->forceFill(['fcm_token' => 'fcm-hp-lama'])->save();
        $this->requestChange($user, self::HP_BARU, 'Xiaomi Redmi 13', 'HP lama rusak')->assertCreated();

        $fcm = $this->mock(FcmService::class);
        // Token HP lama diambil sebelum kunci dipindah (bind() menghapus users.fcm_token).
        $fcm->shouldReceive('sendSessionRevoked')->once()->with('fcm-hp-lama', 'device_changed');
        $fcm->shouldReceive('sendSessionRevoked')->once()->with('fcm-hp-baru', 'device_reset');

        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin)
            ->post(route('admin.device-change-requests.approve', DeviceChangeRequest::sole()))
            ->assertSessionHas('success');
        $this->assertNull($user->fresh()->fcm_token);

        $user->forceFill(['fcm_token' => 'fcm-hp-baru'])->save();
        $this->actingAs($admin)
            ->post(route('admin.devices.reset', $user))
            ->assertSessionHas('success');
        $this->assertNull($user->fresh()->device_id_hash);
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

    public function test_cannot_request_or_approve_moving_to_a_device_owned_by_another_account(): void
    {
        $pemilik = $this->participantUser();
        $lain = $this->participantUser();
        $this->login($pemilik, self::HP_BARU)->assertOk();
        $this->login($lain, self::HP_LAMA)->assertOk();

        $this->requestChange($lain, self::HP_BARU, 'Pixel', 'HP lama rusak')
            ->assertForbidden()
            ->assertJsonPath('code', 'device_in_use');

        // Pengajuan yang terlanjur ada (mis. dibuat sebelum HP itu dipakai akun lain) tidak bisa disetujui.
        $changeRequest = $lain->deviceChangeRequests()->create([
            'device_id_hash' => DeviceLock::hash(self::HP_BARU),
            'reason' => 'HP lama rusak',
            'status' => 'pending',
        ]);
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin)
            ->post(route('admin.device-change-requests.approve', $changeRequest))
            ->assertSessionHas('error');

        $this->assertSame('pending', $changeRequest->fresh()->status);
        $this->assertSame(DeviceLock::hash(self::HP_LAMA), $lain->fresh()->device_id_hash);
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

    private function requestChange(User $user, string $deviceId, ?string $deviceModel, string $reason)
    {
        return $this->postJson('/api/v1/auth/device-change-requests', array_filter([
            'login' => $user->username,
            'password' => 'password',
            'device_id' => $deviceId,
            'device_model' => $deviceModel,
            'reason' => $reason,
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
