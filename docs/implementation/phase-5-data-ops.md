# Fase 5 — Integritas Data dan Operasional

**Tujuan:** data tetap konsisten saat ada request bersamaan, tabel tidak membengkak, dan kegagalan (cron, Firebase, deploy) terdeteksi.
**Estimasi:** 2–3 hari. **Branch:** `chore/phase-5-data-ops`.
**Prasyarat:** Fase 3 (test + CI). Bisa paralel dengan Fase 4.

---

## 5.1 Aktivasi workcode atomik

**Masalah:** pola `Workcode::query()->update(['is_active'=>false])` lalu `update(['is_active'=>true])` tanpa transaksi di `WorkcodeController:62`, `:99-100`, `:113` dan `Console/Commands/AutoActivateWorkcode:32-36`.

**Langkah**
1. Buat `Workcode::activate(Workcode $w): void` (atau `ActivateWorkcodeAction`) yang menjalankan:
   ```php
   DB::transaction(function () use ($w) {
       Workcode::query()->lockForUpdate()->where('is_active', true)->update(['is_active' => false]);
       $w->forceFill(['is_active' => true])->save();
   });
   ```
   Panggil dari `store`, `activate`, dan `AutoActivateWorkcode`. Kirim FCM **setelah commit** (`DB::afterCommit`).
2. Guard di tingkat database: kolom `active_marker` (tinyint nullable, `1` bila aktif, `NULL` bila tidak) dengan unique index → dua workcode aktif tidak mungkin. Isi dengan observer/`saving` hook dari `is_active`. Migration: tambah kolom nullable → backfill → tambah unique index. **Sebelum itu** audit `SELECT COUNT(*) FROM workcodes WHERE is_active = 1` (harus ≤ 1; bila lebih, tentukan yang dipertahankan).
3. `Workcode::getActive()` (`app/Models/Workcode.php:51`) — tambah `orderByDesc('updated_at')` sebagai pengaman hingga constraint terpasang.

**Test:** aktivasi berurutan → tepat satu aktif; simulasi gagal di tengah (exception setelah nonaktifkan) → rollback, workcode lama tetap aktif; command auto-activate idempoten bila dijalankan dua kali.

## 5.2 Pruning data yang tumbuh terus

| Tabel | Kebijakan | Implementasi |
|---|---|---|
| `api_idempotency_logs` | hapus > 7 hari | `php artisan idempotency:prune` harian + index `created_at` |
| `personal_access_tokens` | hapus kedaluwarsa | `sanctum:prune-expired --hours=24` (Fase 2.5) |
| `sessions` | bawaan (lifetime) — pastikan `SESSION_DRIVER=database` terpangkas | `session:prune` custom atau lottery |
| `failed_jobs`, `job_batches` | hapus > 30 hari | `queue:prune-failed --hours=720`, `queue:prune-batches` |
| `face_match_metrics` (Fase 4.3) | 30 hari | masuk command prune |
| log file | 14 hari | `LOG_DAILY_DAYS=14` |

Daftarkan semuanya di `routes/console.php` (saat ini hanya `attendance:calculate-alpha` tiap 5 menit dan `workcode:auto-activate` harian 00:01) dengan `->daily()->withoutOverlapping()`.

## 5.3 FCM lewat queue

- Buat job `App\Jobs\BroadcastWorkcodeUpdate` (`tries=3`, `backoff=[10,60,300]`, `afterCommit`), dipanggil dari `FcmService`/controller menggantikan pemanggilan sinkron; kegagalan tetap hanya di-log.
- Shared hosting tanpa supervisor: cron `* * * * * php artisan queue:work --stop-when-empty --max-time=55` atau `schedule:run` dengan `Schedule::command('queue:work --stop-when-empty')->everyMinute()->withoutOverlapping()`. `QUEUE_CONNECTION=database` di produksi.
- Test: `Queue::fake()` memastikan job dikirim; FCM gagal tidak menggagalkan aktivasi workcode.

## 5.4 Monitoring scheduler dan kesehatan

- Heartbeat: di akhir `attendance:calculate-alpha` tulis `Cache::put('scheduler:last_run', now())` (atau tabel `settings`). Tampilkan di dashboard admin: "Scheduler terakhir jalan: X menit lalu" dengan peringatan merah bila > 10 menit.
- Alert: command `health:check` (jalan tiap 15 menit) mengirim email/WhatsApp ke pengelola bila heartbeat basi, queue macet (`jobs` > N), `failed_jobs` bertambah, atau disk hampir penuh. Gunakan layanan eksternal gratis (mis. Healthchecks.io ping dari `schedule:run`) bila tidak ingin membangun sendiri.
- Endpoint `/up` bawaan Laravel 12 (cek `bootstrap/app.php` `health:`) dipakai skrip deploy; tambahkan cek DB ringan.
- Jaga `attendance:calculate-alpha`: pastikan hanya memproses workcode `harian` aktif (`CalculateAttendanceStatus:23`) — tinjau apakah workcode `workcode`/`24_jam` yang berakhir juga perlu alpha; catat sebagai keputusan bisnis, bukan bug sampai dikonfirmasi.

## 5.5 Backup dan pemulihan

1. Dump DB harian: `mysqldump --single-transaction` via cron hosting → `gzip` → enkripsi (`age`/`gpg`) → simpan di luar server (Google Drive/S3) + retensi 14 hari.
2. Backup `storage/app/private` (dokumen & foto wajah) mingguan, terenkripsi.
3. **Uji restore** minimal sekali ke staging dan catat prosedur di `docs/runbook.md` (RTO/RPO yang disepakati).
4. Backup otomatis sebelum setiap `migrate --force` di skrip deploy.

## 5.6 Perbaikan skrip deploy

File: `deploy/deploy.ps1`, `deploy/deploy-server.sh`, `deploy/setup_public_html.sh`.
- Tambah di server: `mysqldump` sebelum migrate; `php artisan down --retry=60` selama migrasi; `php artisan up` sesudahnya.
- Health check `curl -fsS https://<domain>/up` pasca-deploy; bila gagal → rollback otomatis (`git reset --hard <sha_sebelumnya>`, `composer install`, `artisan up`) dan beri exit code ≠ 0.
- Simpan SHA release sebelumnya di `storage/app/last_release`.
- Pastikan `setup_public_html.sh` tidak menyalin file sensitif ke `public_html` (`.env`, `storage`, `deploy`, `scratch_*.php`, `test_hash.php`, `*.bak`, `*.new`); tambahkan `.htaccess` yang menolak akses ke dotfile dan ekstensi `.bak|.new|.sh|.ps1|.log|.sql`.
- Hapus `deploy/.htaccess.bak|.new|.staging_prepend` setelah dipastikan tidak dipakai.
- Audit `deploy/staging_index.php`: staging tidak boleh bisa dijangkau publik tanpa Basic Auth/IP allowlist dan tidak memakai DB produksi.

## 5.7 Pedoman migration (berlaku mulai fase ini)

`scripts/pre_migration_audit.php` dijalankan sebelum migration yang menambah constraint; urutan wajib audit → backfill → constraint; `down()` realistis; uji pada salinan data produksi.

---

## Definition of Done Fase 5

- [ ] Aktivasi workcode atomik + unique guard; test konkurensi/rollback lulus.
- [ ] Semua tabel pertumbuhan punya pruning terjadwal.
- [ ] FCM via queue dengan retry; kegagalan tidak memblokir request.
- [ ] Heartbeat scheduler + alert aktif.
- [ ] Backup harian terenkripsi di luar server dan **restore pernah diuji**.
- [ ] Deploy punya backup, maintenance mode, health check, dan rollback; tidak ada file sensitif di docroot.
