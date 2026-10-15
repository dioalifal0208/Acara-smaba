<?php

namespace Tests\Feature;

use App\Models\Participant;
use App\Models\Workcode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkcodeParticipantSelectionTest extends TestCase
{
    use RefreshDatabase;

    public function test_participant_only_receives_the_active_workcode_selected_for_them(): void
    {
        $firstParticipant = $this->createParticipant('Peserta Pertama', '1001');
        $secondParticipant = $this->createParticipant('Peserta Kedua', '1002');

        $firstWorkcode = $this->createWorkcode('Workcode Pertama');
        $secondWorkcode = $this->createWorkcode('Workcode Kedua');
        $firstWorkcode->participants()->attach($firstParticipant);
        $secondWorkcode->participants()->attach($secondParticipant);

        $this->assertTrue($firstWorkcode->isAvailableFor($firstParticipant));
        $this->assertFalse($firstWorkcode->isAvailableFor($secondParticipant));
        $this->assertSame($firstWorkcode->id, Workcode::getActive($firstParticipant)?->id);
        $this->assertSame($secondWorkcode->id, Workcode::getActive($secondParticipant)?->id);
    }

    public function test_unrestricted_workcode_remains_available_for_every_participant(): void
    {
        $participant = $this->createParticipant('Peserta Terbuka', '1003');
        $workcode = $this->createWorkcode('Workcode Terbuka');

        $this->assertTrue($workcode->isAvailableFor($participant));
    }

    private function createParticipant(string $nama, string $nip): Participant
    {
        return Participant::create([
            'nama' => $nama,
            'nis_nip' => $nip,
            'status' => 'Peserta',
        ]);
    }

    private function createWorkcode(string $nama): Workcode
    {
        return Workcode::create([
            'nama_workcode' => $nama,
            'kategori' => 'harian',
            'is_active' => true,
        ]);
    }
}
