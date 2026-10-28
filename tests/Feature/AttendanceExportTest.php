<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\Participant;
use App\Models\User;
use App\Models\Workcode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\Cell\Cell;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Cell\StringValueBinder;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Tests\TestCase;

/** Tombol "Ekspor Excel (.xlsx)" di halaman Laporan harus menghasilkan file .xlsx sungguhan. */
class AttendanceExportTest extends TestCase
{
    use RefreshDatabase;

    public function test_activity_export_is_real_xlsx_with_nip_as_text(): void
    {
        Carbon::setTestNow('2026-10-20 10:00:00');
        $workcode = Workcode::create(['nama_workcode' => 'Rapat Dinas / Oktober', 'kategori' => 'workcode', 'is_active' => true]);
        $budi = $this->participant('Budi', '198811052015041003');
        $this->participant('Sari', '197508242005012008');

        Attendance::create([
            'workcode_id' => $workcode->id,
            'participant_id' => $budi->id,
            'tanggal' => '2026-10-20',
            'waktu_hadir' => '2026-10-20 08:05:00',
            'status' => 'hadir',
            'attendance_method' => 'tanda_tangan',
        ]);

        $response = $this->actingAs(User::factory()->create(['role' => 'admin']))
            ->get(route('workcodes.export', $workcode))
            ->assertOk()
            ->assertHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        $this->assertStringContainsString('.xlsx', $response->headers->get('Content-Disposition'));
        $this->assertStringNotContainsString('/', $response->headers->get('Content-Disposition'));

        $sheet = $this->sheet($response->streamedContent());

        $this->assertSame(['No', 'Nama', 'NIS/NIP', 'Status Pegawai', 'Waktu Presensi', 'Status', 'Metode Presensi'], $sheet[0]);
        // Status pegawai kosong: sel kosong dibaca kembali sebagai null.
        $this->assertSame([1, 'Budi', '198811052015041003', null, '08:05:00', 'hadir'], array_slice($sheet[1], 0, 6));
        $this->assertSame([2, 'Sari', '197508242005012008', null, '-', 'alpha', '-'], $sheet[2]);
    }

    public function test_daily_export_is_real_xlsx(): void
    {
        Carbon::setTestNow('2026-10-20 10:00:00');
        $workcode = Workcode::create(['nama_workcode' => 'Harian', 'kategori' => 'harian', 'is_active' => true]);
        $this->participant('Budi', '198811052015041003');

        $response = $this->actingAs(User::factory()->create(['role' => 'admin']))
            ->get(route('workcodes.export', $workcode))
            ->assertOk();

        $sheet = $this->sheet($response->streamedContent());

        $this->assertSame('Total Terlambat (Menit)', $sheet[0][8]);
        $this->assertSame('198811052015041003', $sheet[1][2]);
    }

    public function test_export_after_import_in_same_process_keeps_numbers_numeric(): void
    {
        // Dulu impor memasang StringValueBinder global dan tidak mengembalikannya, sehingga ekspor
        // berikutnya di proses yang sama menulis kolom No sebagai teks (gagal bila urutan test acak).
        $admin = User::factory()->create(['role' => 'admin']);
        $file = UploadedFile::fake()->createWithContent('peserta.csv', "Nama,NIP,Status\nBudi,198811052015041003,PNS\n");

        $this->actingAs($admin)
            ->post(route('participants.import.preview'), ['file' => $file], ['Accept' => 'application/json'])
            ->assertOk();

        $this->assertNotInstanceOf(StringValueBinder::class, Cell::getValueBinder());
        // Impor tetap membaca NIP 18 digit apa adanya (tanpa float/notasi ilmiah).
        $this->assertDatabaseHas('participants', ['nama' => 'Budi', 'nis_nip' => '198811052015041003']);

        $workcode = Workcode::create(['nama_workcode' => 'Rapat', 'kategori' => 'workcode', 'is_active' => true]);
        $sheet = $this->sheet($this->actingAs($admin)->get(route('workcodes.export', $workcode))->assertOk()->streamedContent());

        $this->assertSame(1, $sheet[1][0]);
        $this->assertSame('198811052015041003', $sheet[1][2]);
    }

    /** @return array<int, array<int, mixed>> */
    private function sheet(string $content): array
    {
        $path = tempnam(sys_get_temp_dir(), 'export').'.xlsx';
        file_put_contents($path, $content);

        try {
            $worksheet = IOFactory::load($path)->getActiveSheet();
            $this->assertSame(DataType::TYPE_STRING, $worksheet->getCell('C2')->getDataType());

            return $worksheet->toArray(null, false, false);
        } finally {
            @unlink($path);
        }
    }

    private function participant(string $name, string $nip): Participant
    {
        return Participant::create(['nama' => $name, 'nis_nip' => $nip, 'qr_token' => Str::uuid()->toString()]);
    }
}
