<?php

namespace App\Console\Commands;

use App\Models\Participant;
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
     *   php artisan face:update-descriptor --id=5 --dry-run
     */
    protected $signature = 'face:update-descriptor
                            {--id=      : ID participant yang ingin di-update (opsional, bisa dipilih interaktif)}
                            {--list     : Tampilkan semua participant beserta status face_descriptor-nya}
                            {--dry-run  : Jalankan tanpa menyimpan ke database (preview saja)}';

    protected $description = 'Update kolom face_descriptor (128-D atau 512-D) pada tabel participants langsung dari terminal.';

    public function handle(): int
    {
        $this->newLine();
        $this->line('╔══════════════════════════════════════════════════════╗');
        $this->line('║       FACE DESCRIPTOR UPDATER  — Acara Smaba        ║');
        $this->line('╚══════════════════════════════════════════════════════╝');
        $this->newLine();

        // ── Opsi --list: tampilkan semua participant ───────────────────────
        if ($this->option('list')) {
            return $this->showParticipantList();
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

        // Info descriptor lama
        if ($participant->face_descriptor) {
            $oldDesc = is_array($participant->face_descriptor)
                ? $participant->face_descriptor
                : json_decode($participant->face_descriptor, true);
            $oldCount = is_array($oldDesc) ? count($oldDesc) : '?';
            $this->warn("⚠  Sudah ada face_descriptor ({$oldCount}-D) — akan ditimpa.");
        } else {
            $this->line('ℹ  Belum ada face_descriptor.');
        }

        $this->newLine();

        // ── Panduan input ─────────────────────────────────────────────────
        $this->line('Paste JSON array face_descriptor di bawah ini.');
        $this->line('Format  : [0.123, -0.045, 0.211, ...]');
        $this->line('Diterima: 128-D (model Web) atau 512-D (model Android)');
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

        if (! is_array($descriptor)) {
            $this->error('Input harus berupa JSON array (dimulai [ diakhiri ]), bukan objek atau nilai lain.');

            return self::FAILURE;
        }

        $size = count($descriptor);

        if (! in_array($size, [128, 512])) {
            $this->error("Ukuran array tidak valid: {$size} elemen.");
            $this->error('Yang diterima hanya: 128 (model Web) atau 512 (model Android).');

            return self::FAILURE;
        }

        $allNumeric = collect($descriptor)->every(fn ($v) => is_numeric($v));
        if (! $allNumeric) {
            $this->error('Array mengandung elemen non-numerik. Periksa kembali data Anda.');

            return self::FAILURE;
        }

        // Cast eksplisit ke float (cegah integer 0 → int bukan float)
        $descriptor = array_map('floatval', $descriptor);

        // ── Hitung L2 Norm ────────────────────────────────────────────────
        $l2norm = sqrt(array_sum(array_map(fn ($x) => $x * $x, $descriptor)));
        $isNormalized = abs($l2norm - 1.0) < 0.01;

        // ── Tampilkan preview ─────────────────────────────────────────────
        $this->newLine();
        $this->line('┌─────────────────────── PREVIEW DATA ───────────────────────┐');
        $this->line("  Participant      : [{$participant->id}] {$participant->nama}");
        $this->line("  Dimensi Array    : {$size}-D");
        $this->line('  5 Elemen Pertama : '.implode(', ', array_slice($descriptor, 0, 5)));
        $this->line('  5 Elemen Terakhir: '.implode(', ', array_slice($descriptor, -5)));
        $normLabel = number_format($l2norm, 6).($isNormalized ? '  ✅ Sudah normalized' : '  ⚠  BELUM normalized');
        $this->line("  L2 Norm          : {$normLabel}");
        $this->line('└────────────────────────────────────────────────────────────┘');
        $this->newLine();

        // ── Tawarkan auto-normalisasi jika belum ─────────────────────────
        if (! $isNormalized) {
            $this->warn('L2 Norm ≠ 1.0 — Array ini belum di-L2 Normalize.');
            $autoNorm = $this->confirm('Lakukan L2 Normalization otomatis sekarang?', true);

            if ($autoNorm) {
                $descriptor = array_map(fn ($x) => $x / $l2norm, $descriptor);
                $newNorm = sqrt(array_sum(array_map(fn ($x) => $x * $x, $descriptor)));
                $this->info('✅ L2 Normalization selesai. Norm baru: '.number_format($newNorm, 6));
                $this->newLine();
            }
        }

        // ── Dry-run mode ──────────────────────────────────────────────────
        if ($this->option('dry-run')) {
            $this->warn('[DRY-RUN] Mode preview — tidak ada perubahan yang disimpan ke database.');

            return self::SUCCESS;
        }

        // ── Konfirmasi ────────────────────────────────────────────────────
        if (! $this->confirm("Simpan face_descriptor ({$size}-D) untuk [{$participant->id}] {$participant->nama}?", true)) {
            $this->line('Dibatalkan.');

            return self::SUCCESS;
        }

        // ── Simpan ke database ────────────────────────────────────────────
        $participant->update([
            'face_descriptor' => $descriptor,
            'face_status' => 'approved',
        ]);

        Log::info("[face:update-descriptor] Descriptor participant [{$participant->id}] {$participant->nama} diperbarui via CLI.", [
            'dimensi' => $size,
            'l2_norm' => number_format($l2norm, 6),
            'normalized' => $isNormalized,
        ]);

        $this->newLine();
        $this->info('✅ face_descriptor berhasil disimpan!');
        $this->line("   Participant  : [{$participant->id}] {$participant->nama}");
        $this->line("   Dimensi      : {$size}-D");
        $this->line('   face_status  : approved');
        $this->newLine();

        return self::SUCCESS;
    }

    /**
     * Tampilkan daftar semua participant dengan detail descriptor.
     */
    private function showParticipantList(): int
    {
        $participants = Participant::orderBy('id')->get();

        if ($participants->isEmpty()) {
            $this->error('Tidak ada data participant.');

            return self::FAILURE;
        }

        $rows = $participants->map(function ($p) {
            $desc = $p->face_descriptor;
            $size = '-';
            $norm = '-';

            if ($desc) {
                $arr = is_array($desc) ? $desc : json_decode($desc, true);
                if (is_array($arr) && count($arr) > 0) {
                    $size = count($arr).'-D';
                    $n = sqrt(array_sum(array_map(fn ($x) => floatval($x) ** 2, $arr)));
                    $norm = number_format($n, 4).(abs($n - 1.0) < 0.01 ? ' ✅' : ' ⚠');
                }
            }

            return [
                $p->id,
                $p->nama,
                $p->nis_nip ?? '-',
                $p->face_status ?? 'none',
                $size,
                $norm,
            ];
        })->toArray();

        $this->table(
            ['ID', 'Nama', 'NIS/NIP', 'Face Status', 'Dimensi', 'L2 Norm'],
            $rows
        );

        return self::SUCCESS;
    }
}
