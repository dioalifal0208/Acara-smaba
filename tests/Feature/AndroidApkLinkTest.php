<?php

namespace Tests\Feature;

use App\Http\Controllers\SettingController;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AndroidApkLinkTest extends TestCase
{
    use RefreshDatabase;

    public function test_welcome_page_offers_the_default_apk_link(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Welcome')
                ->where('apkUrl', SettingController::DEFAULT_APK_URL));
    }

    public function test_admin_can_change_or_clear_the_apk_link(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->post(route('admin.settings.apk'), ['android_apk_url' => 'http://contoh.test/app.apk'])
            ->assertSessionHasErrors('android_apk_url');

        $this->actingAs($admin)
            ->post(route('admin.settings.apk'), ['android_apk_url' => 'https://drive.google.com/file/d/abc/view'])
            ->assertSessionHas('success');
        $this->get('/')->assertInertia(fn (Assert $page) => $page->where('apkUrl', 'https://drive.google.com/file/d/abc/view'));

        // Dikosongkan: tombol unduh disembunyikan.
        $this->actingAs($admin)->post(route('admin.settings.apk'), ['android_apk_url' => ''])->assertSessionHas('success');
        $this->assertSame('', Setting::get('android_apk_url'));
        $this->get('/')->assertInertia(fn (Assert $page) => $page->where('apkUrl', null));
    }

    public function test_participants_cannot_change_the_apk_link(): void
    {
        $user = User::factory()->create(['role' => 'participant']);

        $this->actingAs($user)
            ->post(route('admin.settings.apk'), ['android_apk_url' => 'https://contoh.test/app.apk'])
            ->assertRedirect('/');

        $this->assertNull(Setting::get('android_apk_url'));
    }
}
