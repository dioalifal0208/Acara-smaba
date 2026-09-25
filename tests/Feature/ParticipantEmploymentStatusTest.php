<?php

namespace Tests\Feature;

use App\Models\Participant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ParticipantEmploymentStatusTest extends TestCase
{
    use RefreshDatabase;

    public function test_gtt_and_ptt_participants_are_saved_without_a_nip_or_shared_login_account(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->post(route('participants.store'), [
            'nama' => 'Guru Tidak Tetap',
            'nis_nip' => 'akan-diabaikan',
            'status' => 'GTT',
        ])->assertRedirect(route('participants.index'))
            ->assertSessionHasNoErrors();

        $this->actingAs($admin)->post(route('participants.store'), [
            'nama' => 'Pegawai Tidak Tetap',
            'nis_nip' => '-',
            'status' => 'PTT',
        ])->assertRedirect(route('participants.index'))
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('participants', [
            'nama' => 'Guru Tidak Tetap',
            'nis_nip' => null,
            'status' => 'GTT',
        ]);
        $this->assertDatabaseHas('participants', [
            'nama' => 'Pegawai Tidak Tetap',
            'nis_nip' => null,
            'status' => 'PTT',
        ]);
        $this->assertDatabaseCount('users', 1);
    }

    public function test_changing_a_participant_to_gtt_clears_nip_and_only_removes_the_linked_login(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'username' => null,
        ]);
        $participant = Participant::create([
            'nama' => 'Guru Lama',
            'nis_nip' => '198001012000011001',
            'status' => 'PNS',
        ]);
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
        ])->assertRedirect(route('participants.index'))
            ->assertSessionHasNoErrors();

        $participant->refresh();

        $this->assertNull($participant->nis_nip);
        $this->assertSame('GTT', $participant->status);
        $this->assertDatabaseMissing('users', ['id' => $participantUser->id]);
        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    }

    public function test_participant_list_displays_a_dash_for_gtt_or_ptt_without_a_nip(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Participant::create([
            'nama' => 'Pegawai Honorer',
            'nis_nip' => null,
            'status' => 'PTT',
        ]);

        $this->actingAs($admin)
            ->get(route('participants.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Participants/Index')
                ->has('participants', 1)
                ->where('participants.0.nis_nip', '-')
                ->where('participants.0.status', 'PTT'));
    }

    public function test_import_accepts_multiple_gtt_and_ptt_rows_with_dash_or_blank_nip(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $file = UploadedFile::fake()->createWithContent(
            'peserta.csv',
            "Nama,NIP,Status\nGuru Impor,-,GTT\nPegawai Impor,,PTT\n"
        );

        $this->actingAs($admin)
            ->post(route('participants.import.preview'), ['file' => $file], ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJson([
                'status' => 'success',
                'has_conflicts' => false,
            ]);

        $this->assertDatabaseHas('participants', [
            'nama' => 'Guru Impor',
            'nis_nip' => null,
            'status' => 'GTT',
        ]);
        $this->assertDatabaseHas('participants', [
            'nama' => 'Pegawai Impor',
            'nis_nip' => null,
            'status' => 'PTT',
        ]);
        $this->assertDatabaseCount('users', 1);
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
