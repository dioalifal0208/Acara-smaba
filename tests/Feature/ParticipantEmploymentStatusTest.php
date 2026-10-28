<?php

namespace Tests\Feature;

use App\Models\Participant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Tests\TestCase;

/**
 * GTT/PTT tidak punya NIP: mereka mendapat ID khusus 18 digit berformat NIP
 * (tanggal lahir + TMT 2026 + bulan didaftarkan + kode jenis kelamin + nomor urut) untuk login.
 */
class ParticipantEmploymentStatusTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Carbon::setTestNow('2026-10-26 09:00:00');
    }

    public function test_gtt_and_ptt_get_a_nip_formatted_staff_id_and_their_own_login(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->post(route('participants.store'), [
            'nama' => 'Guru Tidak Tetap',
            'nis_nip' => 'akan-diabaikan',
            'status' => 'GTT',
            'tanggal_lahir' => '1995-04-12',
            'jenis_kelamin' => 'L',
        ])->assertRedirect(route('participants.index'))
            ->assertSessionHasNoErrors();

        $this->actingAs($admin)->post(route('participants.store'), [
            'nama' => 'Pegawai Tidak Tetap',
            'nis_nip' => '-',
            'status' => 'PTT',
            'tanggal_lahir' => '1998-11-03',
            'jenis_kelamin' => 'P',
        ])->assertSessionHasNoErrors();

        // 19950412 (lahir) + 2026 (TMT) + 10 (bulan didaftarkan) + 1 (laki-laki) + 001 (nomor urut)
        $this->assertSame('199504122026101001', Participant::where('nama', 'Guru Tidak Tetap')->value('nis_nip'));
        $this->assertSame('199811032026102001', Participant::where('nama', 'Pegawai Tidak Tetap')->value('nis_nip'));

        foreach (['199504122026101001', '199811032026102001'] as $id) {
            $account = User::where('username', $id)->firstOrFail();
            $this->assertSame('participant', $account->role);
            $this->assertTrue(Hash::check($id, $account->password));
        }

        // GTT/PTT bisa login dengan ID tersebut.
        auth()->logout();
        $this->post('/login', ['login' => '199504122026101001', 'password' => '199504122026101001'])
            ->assertRedirect(route('participant.dashboard', absolute: false));
    }

    public function test_gtt_requires_birth_date_and_gender(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->post(route('participants.store'), [
            'nama' => 'Guru Tanpa Data',
            'nis_nip' => '-',
            'status' => 'GTT',
        ])->assertSessionHasErrors(['tanggal_lahir', 'jenis_kelamin']);

        $this->actingAs($admin)->post(route('participants.store'), [
            'nama' => 'Guru Data Salah',
            'status' => 'GTT',
            'tanggal_lahir' => '2030-01-01',
            'jenis_kelamin' => 'X',
        ])->assertSessionHasErrors(['tanggal_lahir', 'jenis_kelamin']);

        // Pegawai tetap tidak wajib mengisi data lahir.
        $this->actingAs($admin)->post(route('participants.store'), [
            'nama' => 'Guru PNS',
            'nis_nip' => '198001012000011001',
            'status' => 'PNS',
        ])->assertSessionHasNoErrors();

        $this->assertDatabaseCount('participants', 1);
    }

    public function test_sequence_number_skips_ids_already_used_including_real_nips(): void
    {
        // NIP asli kebetulan sama awalannya (lahir 12 Apr 1995, TMT Oktober 2026, laki-laki).
        Participant::create(['nama' => 'CPNS Baru', 'nis_nip' => '199504122026101001', 'status' => 'PNS']);

        $first = Participant::create(['nama' => 'Guru A', 'status' => 'GTT', 'tanggal_lahir' => '1995-04-12', 'jenis_kelamin' => 'L']);
        $second = Participant::create(['nama' => 'Guru B', 'status' => 'PTT', 'tanggal_lahir' => '1995-04-12', 'jenis_kelamin' => 'L']);
        $female = Participant::create(['nama' => 'Guru C', 'status' => 'GTT', 'tanggal_lahir' => '1995-04-12', 'jenis_kelamin' => 'P']);

        $this->assertSame('199504122026101002', $first->nis_nip);
        $this->assertSame('199504122026101003', $second->nis_nip);
        $this->assertSame('199504122026102001', $female->nis_nip);

        // Disimpan ulang tanpa perubahan data lahir: nomor urut tidak berubah.
        $first->update(['nama' => 'Guru A Baru', 'nis_nip' => null]);
        $this->assertSame('199504122026101002', $first->fresh()->nis_nip);
    }

    public function test_changing_to_gtt_creates_staff_id_and_keeps_the_login(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'username' => null]);
        $participant = Participant::create(['nama' => 'Guru Lama', 'nis_nip' => '198001012000011001', 'status' => 'PNS']);
        $participantUser = User::factory()->create([
            'name' => $participant->nama,
            'email' => null,
            'username' => $participant->nis_nip,
            'password' => Hash::make($participant->nis_nip),
            'role' => 'participant',
            'participant_id' => $participant->id,
        ]);

        $this->actingAs($admin)->put(route('participants.update', $participant), [
            'nama' => 'Guru Lama',
            'nis_nip' => '-',
            'status' => 'GTT',
            'tanggal_lahir' => '1980-01-01',
            'jenis_kelamin' => 'L',
        ])->assertRedirect(route('participants.show', $participant))
            ->assertSessionHasNoErrors();

        // Bulan TMT = bulan didaftarkan (created_at: Oktober 2026).
        $this->assertSame('198001012026101001', $participant->fresh()->nis_nip);
        // Akun yang sama tetap dipakai (HP terkunci, riwayat): username pindah ke ID, password tidak berubah.
        $this->assertSame('198001012026101001', $participantUser->fresh()->username);
        $this->assertTrue(Hash::check('198001012000011001', $participantUser->fresh()->password));

        // Koreksi tanggal lahir: ID dan username ikut berubah.
        $this->actingAs($admin)->put(route('participants.update', $participant), [
            'nama' => 'Guru Lama',
            'nis_nip' => '-',
            'status' => 'GTT',
            'tanggal_lahir' => '1980-02-01',
            'jenis_kelamin' => 'L',
        ])->assertSessionHasNoErrors();

        $this->assertSame('198002012026101001', $participant->fresh()->nis_nip);
        $this->assertSame('198002012026101001', $participantUser->fresh()->username);
    }

    public function test_legacy_gtt_gets_staff_id_once_birth_data_is_completed(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        // GTT lama: tanpa NIP, tanpa data lahir, tanpa akun (didaftarkan Agustus 2026).
        $id = DB::table('participants')->insertGetId([
            'nama' => 'Guru Lama', 'nis_nip' => null, 'status' => 'GTT', 'qr_token' => 'qr-lama',
            'created_at' => '2026-08-13 08:00:00', 'updated_at' => '2026-08-13 08:00:00',
        ]);
        $participant = Participant::findOrFail($id);

        $this->actingAs($admin)->get(route('participants.show', $participant))
            ->assertInertia(fn (Assert $page) => $page
                ->where('participant.nis_nip', '-')
                ->where('participant.account', null)
                ->where('participant.tanggal_lahir', null));

        $this->actingAs($admin)->put(route('participants.update', $participant), [
            'nama' => 'Guru Lama',
            'nis_nip' => '-',
            'status' => 'GTT',
            'tanggal_lahir' => '1990-07-23',
            'jenis_kelamin' => 'P',
        ])->assertSessionHasNoErrors();

        $this->assertSame('199007232026082001', $participant->fresh()->nis_nip);
        $this->assertTrue(Hash::check('199007232026082001', User::where('participant_id', $id)->value('password')));

        $this->actingAs($admin)->get(route('participants.show', $participant))
            ->assertInertia(fn (Assert $page) => $page
                ->where('participant.tanggal_lahir', '1990-07-23')
                ->where('participant.jenis_kelamin', 'P')
                ->where('participant.account.username', '199007232026082001'));
    }

    public function test_import_changing_to_gtt_without_birth_data_keeps_the_account(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $participant = Participant::create(['nama' => 'Guru Pindah', 'nis_nip' => '198001012000011001', 'status' => 'PNS']);
        $account = User::factory()->create(['username' => '198001012000011001', 'role' => 'participant', 'participant_id' => $participant->id]);

        // Konflik impor diselesaikan "update": status jadi GTT, tanpa kolom tanggal lahir/jenis kelamin.
        $this->actingAs($admin)->post(route('participants.import.confirm'), [
            'clean_data' => [],
            'resolved_conflicts' => [[
                'resolution' => 'update',
                'existing' => ['id' => $participant->id],
                'new' => ['nama' => 'Guru Pindah', 'nis_nip' => '-', 'status' => 'GTT'],
            ]],
        ])->assertSessionHasNoErrors();

        $this->assertNull($participant->fresh()->nis_nip);
        $this->assertNotNull($account->fresh()); // akun (kunci HP, riwayat) tidak dihapus

        // Setelah data lahir dilengkapi, akun yang sama pindah ke ID pengganti NIP.
        $this->actingAs($admin)->put(route('participants.update', $participant), [
            'nama' => 'Guru Pindah', 'status' => 'GTT', 'tanggal_lahir' => '1980-01-01', 'jenis_kelamin' => 'L',
        ])->assertSessionHasNoErrors();

        $this->assertSame('198001012026101001', $account->fresh()->username);
        $this->assertSame(1, User::where('participant_id', $participant->id)->count());
    }

    public function test_permanent_staff_cannot_keep_the_staff_id_as_nip(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $participant = Participant::create(['nama' => 'Guru Honorer', 'status' => 'GTT', 'tanggal_lahir' => '1990-01-01', 'jenis_kelamin' => 'L']);
        $staffId = $participant->nis_nip;

        // Status diubah ke PNS tetapi isian NIP masih ID lama.
        $this->actingAs($admin)->put(route('participants.update', $participant), [
            'nama' => 'Guru Honorer',
            'nis_nip' => $staffId,
            'status' => 'PNS',
        ])->assertSessionHasErrors('nis_nip');

        $this->actingAs($admin)->put(route('participants.update', $participant), [
            'nama' => 'Guru Honorer',
            'nis_nip' => '199001012020011001',
            'status' => 'PNS',
        ])->assertSessionHasNoErrors();

        $this->assertSame('199001012020011001', $participant->fresh()->nis_nip);
    }

    public function test_participant_list_displays_staff_id_or_dash(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Participant::create(['nama' => 'Pegawai Honorer', 'status' => 'PTT', 'tanggal_lahir' => '1990-01-01', 'jenis_kelamin' => 'P']);
        Participant::create(['nama' => 'Pegawai Belum Lengkap', 'status' => 'PTT']);

        $participants = collect($this->actingAs($admin)
            ->get(route('participants.index'))
            ->assertOk()
            ->viewData('page')['props']['participants'])
            ->keyBy('nama');

        $this->assertSame('199001012026102001', $participants['Pegawai Honorer']['nis_nip']);
        $this->assertSame('-', $participants['Pegawai Belum Lengkap']['nis_nip']);
    }

    public function test_participant_detail_page_shows_the_participant_and_login_account(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $participant = Participant::create([
            'nama' => 'Guru Detail',
            'nis_nip' => '198001012000011009',
            'status' => 'PNS',
        ]);
        User::factory()->create([
            'username' => $participant->nis_nip,
            'role' => 'participant',
            'participant_id' => $participant->id,
        ]);

        $this->actingAs($admin)
            ->get(route('participants.show', $participant))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Participants/Show')
                ->where('participant.id', $participant->id)
                ->where('participant.attendances_count', 0)
                ->where('participant.account.username', '198001012000011009'));
    }

    public function test_import_reads_birth_date_and_gender_columns_for_gtt_ptt(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $file = UploadedFile::fake()->createWithContent(
            'peserta.csv',
            "Nama,NIP,Status,Tanggal Lahir,Jenis Kelamin\n"
            ."Guru Impor,-,GTT,12/04/1995,Laki-laki\n"
            ."Pegawai Impor,,PTT,1998-11-03,P\n"
            ."Honorer Belum Lengkap,-,PTT,,\n"
        );

        $this->actingAs($admin)
            ->post(route('participants.import.preview'), ['file' => $file], ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJson(['status' => 'success', 'has_conflicts' => false]);

        $this->assertSame('199504122026101001', Participant::where('nama', 'Guru Impor')->value('nis_nip'));
        $this->assertSame('199811032026102001', Participant::where('nama', 'Pegawai Impor')->value('nis_nip'));
        // Tanpa data lahir: tersimpan tanpa ID dan tanpa akun, dilengkapi admin kemudian.
        $this->assertNull(Participant::where('nama', 'Honorer Belum Lengkap')->value('nis_nip'));
        $this->assertDatabaseCount('users', 3);
    }

    public function test_import_template_has_birth_date_and_gender_columns(): void
    {
        $response = $this->actingAs(User::factory()->create(['role' => 'admin']))
            ->get(route('participants.template'))
            ->assertOk();

        $path = tempnam(sys_get_temp_dir(), 'template').'.xlsx';
        file_put_contents($path, $response->streamedContent());
        $rows = IOFactory::load($path)->getActiveSheet()->toArray(null, false, false);
        @unlink($path);

        $this->assertSame(['Nama', 'NIP', 'Status', 'Tanggal Lahir', 'Jenis Kelamin'], $rows[0]);
        $this->assertSame(['GTT', '1995-04-12', 'L'], array_slice($rows[4], 2, 3));
    }

    public function test_official_nip_remains_required_and_unique_for_permanent_statuses(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Participant::create([
            'nama' => 'Pegawai Pertama',
            'nis_nip' => '198001012000011001',
            'status' => 'PNS',
        ]);

        $this->actingAs($admin)->post(route('participants.store'), [
            'nama' => 'Pegawai Tanpa NIP',
            'nis_nip' => '',
            'status' => 'PPPK',
        ])->assertSessionHasErrors('nis_nip');

        $this->actingAs($admin)->post(route('participants.store'), [
            'nama' => 'Pegawai Duplikat',
            'nis_nip' => '198001012000011001',
            'status' => 'PPPK',
        ])->assertSessionHasErrors('nis_nip');

        $this->assertDatabaseCount('participants', 1);
    }
}
