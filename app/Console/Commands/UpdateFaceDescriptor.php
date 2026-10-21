<?php

namespace App\Console\Commands;

use App\Models\Participant;
use App\Services\FcmService;
use App\Support\FaceDescriptor;
use App\Support\FaceMatcher;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class UpdateFaceDescriptor extends Command
{
    /**
     * Nama dan signature command.
     *
     * Contoh penggunaan:
     *   php artisan face:update-descriptor
     *   php artisan face:update-descriptor --id=5
     *   php artisan face:update-descriptor --list
     *   php artisan face:update-descriptor --list --reenroll
     *   php artisan face:update-descriptor --id=5 --dry-run
     */
    protected $signature = 'face:update-descriptor
                            {--id=      : ID participant yang ingin di-update (opsional, bisa dipilih interaktif)}
                            {--list     : Tampilkan semua participant beserta status face_descriptor-nya}
                            {--reenroll : Bersama --list: hanya peserta yang harus mendaftar ulang wajah (data tidak kompatibel)}
                            {--dry-run  : Jalankan tanpa menyimpan ke database (preview saja)}';

    protected $description = 'Update face_descriptor 128-D (model '.FaceMatcher::MODEL_ID.') peserta dari terminal, atau daftar peserta yang perlu daftar ulang.';

    public function handle(): int
    {
        $this->newLine();
        $this->line('╔══════════════════════════════════════════════════════╗');
        $this->line('║       FACE DESCRIPTOR UPDATER  — Acara Smaba        ║');
        $this->line('╚══════════════════════════════════════════════════════╝');
        $this->newLine();

        // ── Opsi --list: tampilkan semua participant ───────────────────────
        if ($this->option('list')) {
            return $this->showParticipantList((bool) $this->option('reenroll'));
        }

        // ── Pilih participant ──────────────────────────────────────────────
        $participantId = $this->option('id');

        if (! $participantId) {
            $participants = Participant::orderBy('id')->get(['id', 'nama', 'nis_nip', 'face_status']);

            if ($participants->isEmpty()) {
                $this->error('Tidak ada data participant di database.');

                return self::FAILURE;
            }

            $rows = $participants->map(fn ($p) => [
                $p->id,
                $p->nama,
                $p->nis_nip ?? '-',
                $p->face_status ?? 'none',
            ])->toArray();

            $this->table(['ID', 'Nama', 'NIS/NIP', 'Face Status'], $rows);
            $this->newLine();

            $participantId = $this->ask('Masukkan ID participant yang ingin di-update');
        }

        // ── Validasi participant ───────────────────────────────────────────
        $participant = Participant::find($participantId);

        if (! $participant) {
            $this->error("Participant dengan ID [{$participantId}] tidak ditemukan.");

            return self::FAILURE;
        }

        $this->info("Participant ditemukan: [{$participant->id}] {$participant->nama}");

        // Info descriptor lama (ringkasan saja, tanpa isi vector)
        $oldVectors = FaceDescriptor::vectors($participant->face_descriptor);
        if ($oldVectors !== []) {
            $this->warn('⚠  Sudah ada face_descriptor ('.$this->describeVectors($oldVectors).') — akan ditimpa.');
        } else {
            $this->line('ℹ  Belum ada face_descriptor.');
        }

        $this->newLine();

        // ── Panduan input ─────────────────────────────────────────────────
        $this->line('Paste JSON face_descriptor di bawah ini.');
        $this->line('Format  : [0.123, -0.045, ...] (1 vector) atau [[...], [...], [...]] (3–10 sampel)');
        $this->line('Diterima: hanya 128-D dari model '.FaceMatcher::MODEL_ID.' (face-api.js web / TFLite Android).');
        $this->line('Tekan ENTER lalu ketik "DONE" dan ENTER lagi jika sudah selesai.');
        $this->newLine();

        // ── Baca input (multi-baris, diakhiri baris "DONE") ───────────────
        $rawLines = [];
        while (true) {
            $line = $this->ask('');
            if ($line === null || strtoupper(trim($line)) === 'DONE') {
                break;
            }
            $rawLines[] = trim($line);
        }

        $rawJson = implode('', $rawLines);

        if (empty($rawJson)) {
            $this->error('Input kosong. Command dibatalkan.');

            return self::FAILURE;
        }

        // ── Parse & Validasi JSON ─────────────────────────────────────────
        $descriptor = json_decode($rawJson, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->error('JSON tidak valid: '.json_last_error_msg());
            $this->line('Pastikan format dimulai dengan [ dan diakhiri dengan ]');

            return self::FAILURE;
        }

        // Aturan yang sama dengan pendaftaran web & Android (128-D, sampel konsisten).
        if ($error = FaceDescriptor::validateEnrollment($descriptor, requireMultiple: false)) {
            $this->error($error);
            $this->line('Hanya descriptor 128-D model '.FaceMatcher::MODEL_ID.' yang diterima. Vector 512-D dari aplikasi Android lama tidak kompatibel.');

            return self::FAILURE;
        }

        $vectors = FaceDescriptor::vectors($descriptor);

        // Descriptor disimpan mentah seperti pendaftaran web; normalisasi L2 dilakukan saat pencocokan.
        // Isi vector sengaja tidak ditampilkan karena termasuk data biometrik.
        $this->newLine();
        $this->line('┌─────────────────────── PREVIEW DATA ───────────────────────┐');
        $this->line("  Participant : [{$participant->id}] {$participant->nama}");
        $this->line('  Data        : '.$this->describeVectors($vectors));
        $this->line('  Model       : '.FaceMatcher::MODEL_ID);
        $this->line('└────────────────────────────────────────────────────────────┘');
        $this->newLine();

        // ── Dry-run mode ──────────────────────────────────────────────────
        if ($this->option('dry-run')) {
            $this->warn('[DRY-RUN] Mode preview — tidak ada perubahan yang disimpan ke database.');

            return self::SUCCESS;
        }

        // ── Konfirmasi ────────────────────────────────────────────────────
        if (! $this->confirm("Simpan face_descriptor untuk [{$participant->id}] {$participant->nama}?", true)) {
            $this->line('Dibatalkan.');

            return self::SUCCESS;
        }

        // ── Simpan ke database ────────────────────────────────────────────
        $participant->update([
            'face_descriptor' => $descriptor,
            'face_status' => 'approved',
        ]);

        // Aplikasi Android peserta menyegarkan status wajah tanpa harus dibuka ulang.
        app(FcmService::class)->sendStateChanged($participant, 'face');

        Log::info("[face:update-descriptor] Descriptor participant [{$participant->id}] diperbarui via CLI.", [
            'sampel' => count($vectors),
        ]);

        $this->newLine();
        $this->info('✅ face_descriptor berhasil disimpan!');
        $this->line("   Participant  : [{$participant->id}] {$participant->nama}");
        $this->line('   Data         : '.$this->describeVectors($vectors));
        $this->line('   face_status  : approved');
        $this->newLine();

        return self::SUCCESS;
    }

    /**
     * Tampilkan daftar participant dengan ringkasan descriptor (tanpa isi vector).
     */
    private function showParticipantList(bool $onlyReenroll): int
    {
        $participants = Participant::orderBy('id')->get();

        $rows = $participants->map(function ($p) {
            $vectors = FaceDescriptor::vectors($p->face_descriptor);
            $compatible = FaceMatcher::compatibleSampleCount($p->face_descriptor);
            $needsReenroll = $vectors !== [] && $compatible === 0;

            return [
                'row' => [
                    $p->id,
                    $p->nama,
                    $p->nis_nip ?? '-',
                    $p->face_status ?? 'none',
                    $vectors === [] ? '-' : $this->describeVectors($vectors),
                    $compatible,
                    $needsReenroll ? 'YA' : '-',
                ],
                'reenroll' => $needsReenroll,
            ];
        })
            ->when($onlyReenroll, fn ($rows) => $rows->where('reenroll', true))
            ->pluck('row')
            ->values()
            ->toArray();

        if ($rows === []) {
            $this->info($onlyReenroll ? 'Tidak ada peserta yang perlu daftar ulang wajah.' : 'Tidak ada data participant.');

            return self::SUCCESS;
        }

        $this->table(
            ['ID', 'Nama', 'NIS/NIP', 'Face Status', 'Data', 'Sampel 128-D', 'Daftar Ulang'],
            $rows
        );

        return self::SUCCESS;
    }

    /**
     * Ringkasan data wajah, mis. "3 sampel × 128-D" atau "1 sampel × 512-D".
     *
     * @param  list<list<float>>  $vectors
     */
    private function describeVectors(array $vectors): string
    {
        $dimensions = collect($vectors)->map(fn ($vector) => count($vector).'-D')->unique()->implode('/');

        return count($vectors).' sampel × '.$dimensions;
    }
}
