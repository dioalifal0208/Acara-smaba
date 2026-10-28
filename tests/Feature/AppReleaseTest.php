<?php

namespace Tests\Feature;

use App\Models\AppRelease;
use App\Models\Participant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AppReleaseTest extends TestCase
{
    use RefreshDatabase;

    private string $originalStoragePath;

    private string $storage;

    protected function setUp(): void
    {
        parent::setUp();

        $this->originalStoragePath = $this->app->storagePath();
        $this->storage = sys_get_temp_dir().DIRECTORY_SEPARATOR.'apk-test-'.Str::random(8);
        File::ensureDirectoryExists($this->storage.'/app/apk/incoming');
        $this->app->useStoragePath($this->storage);
    }

    protected function tearDown(): void
    {
        $this->app->useStoragePath($this->originalStoragePath);
        File::deleteDirectory($this->storage);

        parent::tearDown();
    }

    public function test_publish_registers_release_and_moves_the_file(): void
    {
        $file = $this->fakeApk('isi-1');

        $this->artisan('apk:publish', [
            'file' => $file, '--version-code' => 4, '--version-name' => '1.2.1', '--sha256' => hash_file('sha256', $file),
        ])->assertSuccessful();

        $release = AppRelease::sole();
        $this->assertSame('presensi-smaba-v1.2.1-4.apk', $release->file_name);
        $this->assertFileExists($release->path());
        $this->assertFileDoesNotExist($file);

        // Deploy diulang dengan APK yang sama: tidak ada rilis ganda.
        $again = $this->fakeApk('isi-1');
        $this->artisan('apk:publish', ['file' => $again, '--version-code' => 4, '--version-name' => '1.2.1'])->assertSuccessful();
        $this->assertSame(1, AppRelease::count());
    }

    public function test_publish_rejects_corrupt_upload_and_reused_version_code(): void
    {
        $file = $this->fakeApk('isi-1');
        $this->artisan('apk:publish', ['file' => $file, '--version-code' => 4, '--version-name' => '1.2.1', '--sha256' => str_repeat('0', 64)])
            ->assertFailed();

        $notApk = $this->storage.'/app/apk/incoming/bukan.apk';
        file_put_contents($notApk, 'bukan zip');
        $this->artisan('apk:publish', ['file' => $notApk, '--version-code' => 4, '--version-name' => '1.2.1'])->assertFailed();

        $this->publish(4, 'isi-1');
        $this->artisan('apk:publish', ['file' => $this->fakeApk('isi-lain'), '--version-code' => 4, '--version-name' => '1.2.1'])
            ->assertFailed();
        $this->assertSame(1, AppRelease::count());
    }

    public function test_only_the_last_three_releases_are_kept(): void
    {
        foreach ([1, 2, 3, 4] as $code) {
            $this->publish($code, "isi-{$code}");
        }

        $this->assertSame([4, 3, 2], AppRelease::orderByDesc('version_code')->pluck('version_code')->all());
        $this->assertFileDoesNotExist(AppRelease::directory().'/presensi-smaba-v1.0.1-1.apk');
    }

    public function test_download_serves_the_latest_apk_and_counts_downloads(): void
    {
        $this->get(route('apk.download'))->assertNotFound();
        $this->get('/')->assertInertia(fn (Assert $page) => $page->where('apkUrl', null));

        $this->publish(3, 'lama');
        $this->publish(4, 'baru');

        $response = $this->get(route('apk.download'))->assertOk()
            ->assertHeader('Content-Type', 'application/vnd.android.package-archive');
        $this->assertStringContainsString('Presensi-SMABA-v1.0.4.apk', $response->headers->get('Content-Disposition'));
        $this->assertSame(1, AppRelease::where('version_code', 4)->value('download_count'));

        $this->get('/')->assertInertia(fn (Assert $page) => $page->where('apkUrl', route('apk.download')));
    }

    public function test_minimum_version_slides_with_releases(): void
    {
        config(['attendance.android_app.min_version_lag' => 5, 'attendance.android_app.min_version_code' => 0]);

        $this->assertSame(0, AppRelease::minimumVersionCode());
        $this->publish(4, 'empat');
        $this->assertSame(0, AppRelease::minimumVersionCode());
        $this->publish(10, 'sepuluh');
        $this->assertSame(5, AppRelease::minimumVersionCode());

        // Batas bawah manual tetap berlaku untuk update darurat.
        config(['attendance.android_app.min_version_code' => 8]);
        $this->assertSame(8, AppRelease::minimumVersionCode());

        config(['attendance.android_app.min_version_code' => 0, 'attendance.android_app.min_version_lag' => 0]);
        $this->assertSame(0, AppRelease::minimumVersionCode());
    }

    public function test_outdated_app_is_sent_to_the_latest_apk(): void
    {
        config(['attendance.android_app.min_version_lag' => 5]);
        $this->publish(10, 'sepuluh');
        $participant = Participant::create(['nama' => 'Peserta Lama', 'nis_nip' => 'apk-'.Str::random(6), 'qr_token' => Str::uuid()]);
        Sanctum::actingAs(User::factory()->create(['role' => 'participant', 'participant_id' => $participant->id]), ['role:participant']);

        $this->getJson('/api/v1/me/state', ['X-App-Version-Code' => '4'])
            ->assertStatus(426)
            ->assertJsonPath('data.min_version_code', 5)
            ->assertJsonPath('data.update_url', route('apk.download'));

        $this->getJson('/api/v1/me/state', ['X-App-Version-Code' => '5'])->assertOk();
    }

    public function test_admin_settings_show_only_the_latest_release(): void
    {
        config(['attendance.android_app.min_version_lag' => 5]);
        $this->publish(5, 'lima');
        $this->publish(6, 'enam');
        User::factory()->create(['role' => 'participant', 'app_version_code' => 1]);
        User::factory()->create(['role' => 'participant', 'app_version_code' => 6]);

        $this->actingAs(User::factory()->create(['role' => 'admin']))
            ->get(route('admin.settings'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('androidApp.latest.version_code', 6)
                ->where('androidApp.min_version_code', 1)
                ->where('androidApp.next_min_version_code', 2)
                ->where('androidApp.outdated_next_release', 1));
    }

    private function publish(int $versionCode, string $content): void
    {
        $this->artisan('apk:publish', [
            'file' => $this->fakeApk($content), '--version-code' => $versionCode, '--version-name' => "1.0.{$versionCode}",
        ])->assertSuccessful();
    }

    private function fakeApk(string $content): string
    {
        $path = $this->storage.'/app/apk/incoming/'.Str::random(8).'.apk';
        file_put_contents($path, "PK\x03\x04".$content);

        return $path;
    }
}
