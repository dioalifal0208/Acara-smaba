<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\LeaveRequest;
use App\Models\Participant;
use App\Models\User;
use App\Models\Workcode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Tests\TestCase;

/**
 * Laporan workcode harian: direkap per bulan (tanggal 1 s.d. akhir bulan) dan tanpa peserta GTT/PTT.
 */
class DailyReportPeriodTest extends TestCase
{
    use RefreshDatabase;

    public function test_daily_report_covers_current_month_and_excludes_gtt_ptt(): void
    {
        Carbon::setTestNow('2026-10-20 10:00:00');
        $workcode = $this->dailyWorkcode();
        $budi = $this->participant('Budi', 'PNS');
        $sari = $this->participant('Sari', 'PPPK');
        $this->participant('Guru Honorer', 'GTT');
        $this->participant('Pegawai Honorer', 'PTT');

        $this->row($workcode, $budi, '2026-10-05', 'alpha');
        $this->row($workcode, $budi, '2026-09-30', 'alpha'); // bulan lalu: tidak dihitung
        $this->row($workcode, $sari, '2026-10-06', 'lupa_absen');

        $this->actingAs($this->admin())
            ->get(route('report', ['workcode_id' => $workcode->id]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('period.month', '2026-10')
                ->where('period.start', '2026-10-01')
                ->where('period.end', '2026-10-31')
                ->where('period.label', '1 Oktober 2026 s.d. 31 Oktober 2026')
                ->where('stats.total', 2)
                ->has('attendances', 2)
                ->where('attendances.0.nama', 'Budi')
                ->where('attendances.0.total_alpha', 1)
                ->where('attendances.1.nama', 'Sari')
                ->where('attendances.1.total_lupa_absen', 1));
    }

    public function test_month_can_be_chosen_and_period_follows_month_length(): void
    {
        Carbon::setTestNow('2026-10-20 10:00:00');
        $workcode = $this->dailyWorkcode();
        $budi = $this->participant('Budi', 'PNS');
        $this->row($workcode, $budi, '2026-09-30', 'alpha');
        $admin = $this->admin();

        $this->actingAs($admin)
            ->get(route('report', ['workcode_id' => $workcode->id, 'bulan' => '2026-09']))
            ->assertInertia(fn (Assert $page) => $page
                ->where('period.end', '2026-09-30')
                ->where('attendances.0.total_alpha', 1));

        // Februari tahun kabisat: 29 hari. Nilai bulan yang tidak valid jatuh ke bulan berjalan.
        $this->actingAs($admin)
            ->get(route('report', ['workcode_id' => $workcode->id, 'bulan' => '2028-02']))
            ->assertInertia(fn (Assert $page) => $page->where('period.label', '1 Februari 2028 s.d. 29 Februari 2028'));
        $this->actingAs($admin)
            ->get(route('report', ['workcode_id' => $workcode->id, 'bulan' => '2026-13']))
            ->assertInertia(fn (Assert $page) => $page->where('period.month', '2026-10'));
    }

    public function test_leave_days_are_counted_once_and_sick_leave_as_sakit(): void
    {
        Carbon::setTestNow('2026-10-20 10:00:00');
        $workcode = $this->dailyWorkcode();
        $budi = $this->participant('Budi', 'PNS');

        // Izin 2 hari (sudah disetujui: satu baris izin per hari), izin sakit 1 hari, dan izin tidak
        // absen pulang (orangnya hadir). Dulu pengajuan izin dihitung lagi di atas baris presensinya.
        $cuti = $this->leave($workcode, $budi, '2026-10-07', '2026-10-08', 'izin_penuh', 'cuti');
        $this->row($workcode, $budi, '2026-10-07', 'izin', $cuti);
        $this->row($workcode, $budi, '2026-10-08', 'izin', $cuti);
        $sakit = $this->leave($workcode, $budi, '2026-10-09', null, 'izin_penuh', 'izin_sakit');
        $this->row($workcode, $budi, '2026-10-09', 'izin', $sakit);
        $pulang = $this->leave($workcode, $budi, '2026-10-12', null, 'tidak_absen_pulang', 'perjalanan_dinas_dalam_kota');
        $this->row($workcode, $budi, '2026-10-12', 'hadir', $pulang, '2026-10-12 07:10:00');

        $this->actingAs($this->admin())
            ->get(route('report', ['workcode_id' => $workcode->id]))
            ->assertInertia(fn (Assert $page) => $page
                ->where('attendances.0.total_izin', 2)
                ->where('attendances.0.total_sakit', 1)
                ->where('attendances.0.total_alpha', 0));
    }

    public function test_daily_export_uses_month_and_excludes_gtt_ptt(): void
    {
        Carbon::setTestNow('2026-10-20 10:00:00');
        $workcode = $this->dailyWorkcode();
        $budi = $this->participant('Budi', 'PNS');
        $this->participant('Guru Honorer', 'GTT');
        $this->row($workcode, $budi, '2026-09-30', 'alpha');

        $response = $this->actingAs($this->admin())
            ->get(route('workcodes.export', ['workcode' => $workcode, 'bulan' => '2026-09']))
            ->assertOk();

        $this->assertStringContainsString('2026-09', $response->headers->get('Content-Disposition'));

        $path = tempnam(sys_get_temp_dir(), 'export').'.xlsx';
        file_put_contents($path, $response->streamedContent());
        $rows = IOFactory::load($path)->getActiveSheet()->toArray(null, false, false);
        @unlink($path);

        $this->assertCount(2, $rows); // header + Budi
        $this->assertSame('Budi', $rows[1][1]);
        $this->assertSame(1, $rows[1][4]);
    }

    public function test_activity_report_still_lists_gtt_ptt(): void
    {
        $workcode = Workcode::create(['nama_workcode' => 'Upacara', 'kategori' => 'workcode', 'is_active' => true]);
        $this->participant('Budi', 'PNS');
        $this->participant('Guru Honorer', 'GTT');

        $this->actingAs($this->admin())
            ->get(route('report', ['workcode_id' => $workcode->id]))
            ->assertInertia(fn (Assert $page) => $page
                ->where('period', null)
                ->where('stats.total', 2));
    }

    private function dailyWorkcode(): Workcode
    {
        return Workcode::create([
            'nama_workcode' => '(JATIM) DINDIK 5 HARI_KERJA',
            'kategori' => 'harian',
            'is_active' => true,
            'hari_aktif' => [1, 2, 3, 4, 5],
            'jam_datang_mulai' => '06:00:00',
            'jam_datang_selesai' => '07:15:00',
            'jam_pulang_mulai' => '14:00:00',
            'jam_pulang_selesai' => '16:00:00',
        ]);
    }

    private function participant(string $name, string $status): Participant
    {
        return Participant::create([
            'nama' => $name,
            'nis_nip' => in_array($status, Participant::NON_PERMANENT_STATUSES, true) ? null : Str::uuid()->toString(),
            'status' => $status,
            'qr_token' => Str::uuid()->toString(),
        ]);
    }

    private function row(Workcode $workcode, Participant $participant, string $tanggal, string $status, ?LeaveRequest $leave = null, ?string $waktuHadir = null): Attendance
    {
        return Attendance::create([
            'workcode_id' => $workcode->id,
            'participant_id' => $participant->id,
            'tanggal' => $tanggal,
            'waktu_hadir' => $waktuHadir,
            'status' => $status,
            'leave_request_id' => $leave?->id,
        ]);
    }

    private function leave(Workcode $workcode, Participant $participant, string $from, ?string $to, string $tipeIzin, string $jenisIzin): LeaveRequest
    {
        return LeaveRequest::create([
            'participant_id' => $participant->id,
            'workcode_id' => $workcode->id,
            'tanggal' => $from,
            'tanggal_selesai' => $to,
            'tipe' => 'izin',
            'tipe_izin' => $tipeIzin,
            'jenis_izin' => $jenisIzin,
            'alasan' => 'Uji',
            'status_approval' => 'approved',
        ]);
    }

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }
}
