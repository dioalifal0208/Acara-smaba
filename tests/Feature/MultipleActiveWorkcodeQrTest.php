<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\Participant;
use App\Models\User;
use App\Models\Workcode;
use App\Services\SelfCheckInTokenService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MultipleActiveWorkcodeQrTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('private');
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    public function test_master_qr_generates_a_separate_qr_for_each_active_workcode(): void
    {
        $first = $this->workcode('Rapat Guru');
        $second = $this->workcode('Rapat Wali Murid');
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->get(route('admin.master-qr'))->assertOk();

        $page = $response->viewData('page')['props'];
        $this->assertSame('Admin/MasterQr', $response->viewData('page')['component']);
        $this->assertCount(2, $page['workcodeQrs']);
        $urls = collect($page['workcodeQrs'])->pluck('checkInUrl', 'workcode.id');
        $this->assertNotSame($urls[$first->id], $urls[$second->id]);
        $this->assertNotEmpty(collect($page['workcodeQrs'])->first()['qrCodeSvg']);

        // Scan QR tiap workcode tercatat ke workcode milik QR tersebut.
        $participant = Participant::create(['nama' => 'Budi', 'nis_nip' => '1001']);
        $this->submit($this->tokenFromUrl($urls[$second->id]), $participant, 'dev-a')->assertOk()->assertJsonPath('status', 'success');
        $this->submit($this->tokenFromUrl($urls[$first->id]), $participant, 'dev-b')->assertOk()->assertJsonPath('status', 'success');

        $this->assertEqualsCanonicalizing(
            [$first->id, $second->id],
            Attendance::where('participant_id', $participant->id)->pluck('workcode_id')->all()
        );
    }

    public function test_open_workcode_is_closed_while_another_active_workcode_has_selected_participants(): void
    {
        $restricted = $this->workcode('Workcode Terpilih');
        $open = $this->workcode('Workcode Belum Diatur');
        $selected = Participant::create(['nama' => 'Peserta Terpilih', 'nis_nip' => '2001']);
        $other = Participant::create(['nama' => 'Peserta Lain', 'nis_nip' => '2002']);
        $restricted->participants()->attach($selected);

        $this->assertSame([$restricted->id], Workcode::getActiveWorkcodes($selected)->pluck('id')->all());
        $this->assertTrue(Workcode::getActiveWorkcodes($other)->isEmpty());
        $this->assertFalse($open->isAvailableFor($selected));
        $this->assertFalse($open->isAvailableFor($other));

        $tokens = app(SelfCheckInTokenService::class);
        $this->submit($tokens->tokenFor($open), $selected, 'dev-1')->assertStatus(410)->assertJsonPath('reason', 'closed_by_selection');
        $this->submit($tokens->tokenFor($open), $other, 'dev-2')->assertStatus(410)->assertJsonPath('reason', 'closed_by_selection');
        $this->submit($tokens->tokenFor($restricted), $other, 'dev-3')->assertForbidden();
        $this->submit($tokens->tokenFor($restricted), $selected, 'dev-4')->assertOk()->assertJsonPath('status', 'success');

        $this->getJson(route('self-checkin.participants', ['token' => $tokens->tokenFor($open), 'query' => 'Peserta']))
            ->assertStatus(410)->assertJsonPath('reason', 'closed_by_selection');
        $this->getJson(route('self-checkin.participants', ['token' => $tokens->tokenFor($restricted), 'query' => 'Peserta']))
            ->assertOk()->assertJsonCount(0); // peserta terpilih sudah hadir, peserta lain tidak terpilih

        $admin = User::factory()->create(['role' => 'admin']);
        $qrs = collect($this->actingAs($admin)->get(route('admin.master-qr'))->viewData('page')['props']['workcodeQrs'])
            ->keyBy('workcode.id');
        $this->assertSame('closed_by_selection', $qrs[$open->id]['unavailable_reason']);
        $this->assertNull($qrs[$open->id]['qrCodeSvg']);
        $this->assertNull($qrs[$restricted->id]['unavailable_reason']);
    }

    public function test_self_checkin_form_shows_closed_for_open_workcode_closed_by_selection(): void
    {
        $open = $this->workcode('Workcode Belum Diatur');
        $token = app(SelfCheckInTokenService::class)->tokenFor($open);

        $this->get(route('self-checkin.show', $token))
            ->assertInertia(fn ($page) => $page->where('activeWorkcode.id', $open->id));

        $restricted = $this->workcode('Workcode Terpilih');
        $restricted->participants()->attach(Participant::create(['nama' => 'Terpilih', 'nis_nip' => '5001']));

        $this->get(route('self-checkin.show', $token))
            ->assertInertia(fn ($page) => $page->component('SelfCheckIn/Closed')->where('reason', 'closed_by_selection')->where('temporary', true));
    }

    public function test_daily_workcode_is_not_closed_by_event_with_selected_participants(): void
    {
        $harian = Workcode::create(['nama_workcode' => 'Presensi Harian', 'kategori' => 'harian', 'is_active' => true]);
        $event = $this->workcode('Kegiatan Terpilih');
        $selected = Participant::create(['nama' => 'Terpilih', 'nis_nip' => '6001']);
        $other = Participant::create(['nama' => 'Lain', 'nis_nip' => '6002']);
        $event->participants()->attach($selected);

        $this->assertSame([$harian->id], Workcode::getActiveWorkcodes($other)->pluck('id')->all());
        $this->assertEqualsCanonicalizing([$harian->id, $event->id], Workcode::getActiveWorkcodes($selected)->pluck('id')->all());
        $this->assertTrue($harian->isAvailableFor($other));
    }

    public function test_open_workcode_stays_available_when_no_active_workcode_has_selected_participants(): void
    {
        $open = $this->workcode('Workcode Terbuka');
        $participant = Participant::create(['nama' => 'Peserta', 'nis_nip' => '3001']);

        $this->assertTrue($open->isAvailableFor($participant));
        $this->submit(app(SelfCheckInTokenService::class)->tokenFor($open), $participant, 'dev-1')
            ->assertOk()->assertJsonPath('status', 'success');
    }

    public function test_sequential_workcodes_switch_qr_and_report_next_change(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-10-20 08:30:00', 'Asia/Jakarta'));
        $morning = $this->scheduledWorkcode('Sesi 1', '08:00:00', '09:00:00');
        $late = $this->scheduledWorkcode('Sesi 2', '09:00:00', '10:00:00');
        $admin = User::factory()->create(['role' => 'admin']);

        $props = $this->actingAs($admin)->get(route('admin.master-qr'))->viewData('page')['props'];
        $this->assertSame([$morning->id], collect($props['workcodeQrs'])->pluck('workcode.id')->all());
        $this->assertTrue(Carbon::parse($props['nextChangeAt'])->equalTo(Carbon::parse('2026-10-20 09:00:00', 'Asia/Jakarta')));
        $morningToken = $this->tokenFromUrl($props['workcodeQrs'][0]['checkInUrl']);

        Carbon::setTestNow(Carbon::parse('2026-10-20 09:00:05', 'Asia/Jakarta'));
        $props = $this->actingAs($admin)->get(route('admin.master-qr'))->viewData('page')['props'];
        $this->assertSame([$late->id], collect($props['workcodeQrs'])->pluck('workcode.id')->all());
        $this->assertTrue(Carbon::parse($props['nextChangeAt'])->equalTo(Carbon::parse('2026-10-20 10:00:00', 'Asia/Jakarta')));

        // QR sesi pertama yang masih terpasang tidak boleh mencatat ke sesi berikutnya.
        $participant = Participant::create(['nama' => 'Peserta', 'nis_nip' => '4001']);
        $this->submit($morningToken, $participant, 'dev-1')->assertStatus(410)->assertJsonPath('reason', 'ended');
        $this->assertDatabaseCount('attendances', 0);
    }

    public function test_expired_qr_shows_informative_page_with_workcode_schedule(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-10-20 08:30:00', 'Asia/Jakarta'));
        $session = $this->scheduledWorkcode('Sesi Pagi', '08:00:00', '09:00:00');
        $token = app(SelfCheckInTokenService::class)->tokenFor($session);
        $this->get(route('self-checkin.show', $token))->assertOk()
            ->assertInertia(fn ($page) => $page->component('SelfCheckIn/Form'));

        Carbon::setTestNow(Carbon::parse('2026-10-20 09:15:00', 'Asia/Jakarta'));
        $this->get(route('self-checkin.show', $token))
            ->assertStatus(410)
            ->assertInertia(fn ($page) => $page
                ->component('SelfCheckIn/Closed')
                ->where('reason', 'ended')
                ->where('temporary', false)
                ->where('workcode.nama_workcode', 'Sesi Pagi')
                ->where('workcode.jam_aktif_selesai', '09:00:00')
                ->missing('workcode.latitude'));
        $this->getJson(route('self-checkin.participants', ['token' => $token, 'query' => 'Peserta']))
            ->assertStatus(410)->assertJsonPath('reason', 'ended');

        // Hari berikutnya token sudah hilang sama sekali.
        Carbon::setTestNow(Carbon::parse('2026-10-21 08:30:00', 'Asia/Jakarta'));
        $this->get(route('self-checkin.show', $token))
            ->assertStatus(410)
            ->assertInertia(fn ($page) => $page->component('SelfCheckIn/Closed')->where('reason', 'invalid')->where('workcode', null));
    }

    public function test_token_is_disabled_while_workcode_inactive_and_works_again_when_reactivated(): void
    {
        $workcode = $this->workcode('Rapat Manual');
        $token = app(SelfCheckInTokenService::class)->tokenFor($workcode);
        $participant = Participant::create(['nama' => 'Peserta', 'nis_nip' => '7001']);

        $workcode->update(['is_active' => false]);
        $this->get(route('self-checkin.show', $token))->assertOk()
            ->assertInertia(fn ($page) => $page->component('SelfCheckIn/Closed')->where('reason', 'inactive')->where('temporary', true));
        $this->submit($token, $participant, 'dev-1')->assertStatus(410)->assertJsonPath('reason', 'inactive');

        $workcode->update(['is_active' => true]);
        $this->get(route('self-checkin.show', $token))->assertOk()
            ->assertInertia(fn ($page) => $page->component('SelfCheckIn/Form')->where('activeWorkcode.id', $workcode->id));
        $this->submit($token, $participant, 'dev-1')->assertOk()->assertJsonPath('status', 'success');
    }

    public function test_master_qr_lists_upcoming_workcodes_for_sequential_schedule(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-10-20 07:50:00', 'Asia/Jakarta'));
        $this->scheduledWorkcode('Sesi 1', '08:00:00', '09:00:00');
        $this->scheduledWorkcode('Sesi 2', '09:00:00', '10:00:00');
        $admin = User::factory()->create(['role' => 'admin']);

        $props = $this->actingAs($admin)->get(route('admin.master-qr'))->viewData('page')['props'];

        $this->assertSame([], $props['workcodeQrs']);
        $this->assertSame(['Sesi 1', 'Sesi 2'], collect($props['upcomingWorkcodes'])->pluck('nama_workcode')->all());
        $this->assertTrue(Carbon::parse($props['nextChangeAt'])->equalTo(Carbon::parse('2026-10-20 08:00:00', 'Asia/Jakarta')));
    }

    public function test_regenerating_one_workcode_token_keeps_other_tokens_valid(): void
    {
        $first = $this->workcode('Pertama');
        $second = $this->workcode('Kedua');
        $tokens = app(SelfCheckInTokenService::class);
        $firstToken = $tokens->tokenFor($first);
        $secondToken = $tokens->tokenFor($second);
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->post(route('admin.master-qr.regenerate'), ['workcode_id' => $first->id])->assertRedirect();

        $this->get(route('self-checkin.show', $firstToken))->assertStatus(410)->assertInertia(fn ($page) => $page->component('SelfCheckIn/Closed')->where('reason', 'invalid'));
        $this->get(route('self-checkin.show', $secondToken))->assertOk();
        $this->assertNotSame($firstToken, $tokens->tokenFor($first));
    }

    private function submit(string $token, Participant $participant, string $deviceId)
    {
        return $this->postJson("/self-checkin/{$token}", [
            'participant_id' => $participant->id,
            'device_id' => $deviceId,
            'signature' => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
        ], ['User-Agent' => 'Agent-'.$deviceId]);
    }

    private function tokenFromUrl(string $url): string
    {
        return basename(parse_url($url, PHP_URL_PATH));
    }

    private function workcode(string $nama): Workcode
    {
        return Workcode::create(['nama_workcode' => $nama, 'kategori' => 'workcode', 'is_active' => true]);
    }

    private function scheduledWorkcode(string $nama, string $mulai, string $selesai): Workcode
    {
        return Workcode::create([
            'nama_workcode' => $nama,
            'kategori' => 'workcode',
            'tanggal' => now()->toDateString(),
            'jam_aktif_mulai' => $mulai,
            'jam_aktif_selesai' => $selesai,
            'is_active' => false,
        ]);
    }
}
