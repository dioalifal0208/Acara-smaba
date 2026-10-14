# Implementation Plan — Perbaikan, Keamanan, dan Kelanjutan Presensi SMABA

> Sumber: `PROJECT_DOCUMENTATION.md` (13 Okt 2026) + verifikasi langsung ke source pada 13 Okt 2026.
> Tanda **[Terverifikasi]** = sudah dicek di kode; **[Dari dokumentasi]** = belum dicek ulang, verifikasi dulu sebelum dikerjakan.

---

## 0. Ringkasan Prioritas

| Fase | Fokus | Estimasi | Gate keluar |
|---|---|---|---|
| 0 | Darurat: tutup admin-takeover, rotasi kredensial | 0,5–1 hari | Registrasi tertutup, password SSH dirotasi, user admin diaudit |
| 1 | Privasi data biometrik & dokumen | 2–3 hari | Tidak ada descriptor di log; dokumen izin privat |
| 2 | Hardening endpoint publik | 3–4 hari | Face match/lookup/QR terlindungi + rate limit |
| 3 | Baseline test & CI | 1–2 hari | `php artisan test` hijau, CI jalan |
| 4 | Konsolidasi logika presensi | 4–6 hari | Satu service transaksional dipakai web + API |
| 5 | Integritas data & operasional | 2–3 hari | Aktivasi workcode atomik, pruning, backup |
| 6 | Maintainability & dokumentasi | berkelanjutan | Controller ramping, docs terkonsolidasi |

Urutan wajib: **Fase 0 → 1 → 2 → 3**. Fase 4–6 boleh paralel setelah baseline test hijau.

---

## 1. Audit Keamanan

### 1.1 Kritis

| # | Temuan | Status | Bukti |
|---|---|---|---|
| S1 | **Registrasi publik membuat akun admin.** `User::create` tidak mengisi `role`; migration `2026_08_16_150859_add_role_and_participant_to_users_table.php:15` men-default `role` ke `admin`. Route `/register` terbuka untuk guest. Siapa pun bisa jadi admin penuh (hapus peserta, ubah presensi, lihat semua data). | **[Terverifikasi]** | `RegisteredUserController.php:40-44`, migration baris 15 |
| S2 | **Password SSH plaintext di `deploy/test.ps1`** (`$SSH_PASS`, host `45.90.229.210`, port 65002). File **tidak di-gitignore** dan sudah pernah di-commit (`a2bcfc3`) ke repo GitHub `dioalifal0208/Acara-smaba`. Perlakukan sebagai bocor permanen. | **[Terverifikasi]** | `deploy/test.ps1`, `git log -- deploy/test.ps1` |

### 1.2 Tinggi

| # | Temuan | Status |
|---|---|---|
| S3 | **Log biometrik.** `Api/V1/AttendanceController.php:250` meng-encode seluruh `$incomingDescriptor` ke log (`array_android_lengkap`); baris 282 mencatat `[FACE-DEBUG]` jarak. Descriptor di log = data biometrik di file log yang sering dibaca banyak orang/di-backup. | **[Terverifikasi]** |
| S4 | **Dokumen izin di disk `public`** (`storage/app/public/dokumen_izin`), dilayani oleh `/storage/{path}` (`web.php:199`) tanpa auth dan dengan `Cache-Control: public, max-age=31536000`. Dokumen sakit/medis dapat diakses siapa pun yang tahu/menebak path. | **[Terverifikasi]** (route); path dari dokumentasi |
| S5 | **`POST /api/face/match` publik** (`web.php:196`): pencarian 1:N ke seluruh peserta approved dan dapat membuat attendance. Tanpa nonce sesi, tanpa liveness server-side, tanpa rate limit khusus. | **[Terverifikasi]** (route publik) |
| S6 | **`/api/participants/lookup`, `/api/participants/search`, `/participants/{participant}/qr` publik** (`web.php:66-68, 188`). Memungkinkan enumerasi peserta/NIS-NIP, dan unduh QR pribadi (token presensi) peserta mana pun → bisa dipakai membuat presensi atas nama orang lain lewat scanner. | **[Terverifikasi]** (route) |
| S7 | **Fallback `/storage/{path}` melayani seluruh disk public** termasuk foto wajah peserta (`photo_path`). Foto wajah = data biometrik; akses lewat tebakan/URL bocor. | **[Terverifikasi]** (route) |

### 1.3 Menengah

| # | Temuan | Status |
|---|---|---|
| S8 | `trustProxies(at: '*')` (`bootstrap/app.php:26`) → `X-Forwarded-For/Proto` bisa dipalsukan bila app diakses langsung; mempengaruhi IP di attendance & rate limiter. | **[Terverifikasi]** |
| S9 | Registrasi foto mandiri lama langsung menimpa `Participant.photo_path` sebelum approval (bertolak belakang dengan alur candidate di API). | [Dari dokumentasi] |
| S10 | Threshold wajah berbeda (web ≈0.58, mobile 0.85) dan 0.85 tergolong longgar untuk face-api.js 128-d → risiko false accept. | [Dari dokumentasi] — validasi dengan data nyata |
| S11 | Device-lock berbasis `installation_id`/device hash dikirim client → mudah dipalsukan; mock-location hanya deteksi dari sisi client. Terima sebagai risiko residual, catat di dokumen. | [Dari dokumentasi] |
| S12 | `Setting`, `Workcode` token Master QR: pastikan token acak panjang, ada kedaluwarsa/rotasi terjadwal. | Perlu dicek |

### 1.4 Checklist tambahan yang perlu diaudit (belum diverifikasi)

- [ ] `User` model: apakah `role` ada di `$fillable`? (mass-assignment dari `ProfileController::update`)
- [ ] Upload: validasi MIME/ukuran/ekstensi pada dokumen izin & foto; nama file diacak.
- [ ] Rate limit pada `/login` web, `/forgot-password`, `/self-checkin/{token}` POST.
- [ ] Sanctum: `expiration` token di `config/sanctum.php` (default `null` = tidak pernah kedaluwarsa).
- [ ] CORS (`config/cors.php`) dan header keamanan (CSP, X-Frame-Options, HSTS).
- [ ] `.env.production` / `.env` tidak ter-commit (`git log --all -- .env*`); `APP_DEBUG=false` di produksi.
- [ ] Seeder: akun admin default tidak dijalankan di produksi.
- [ ] Hapus/kendalikan `scratch_*.php`, `test_hash.php`, `scripts/create_test_participant.php` dari server produksi (jangan sampai bisa diakses via web).
- [ ] `composer audit` dan `npm audit`.

---

## 2. Audit Fitur

| Area | Status | Catatan / Gap |
|---|---|---|
| Workcode (CRUD, 3 kategori, aktivasi, jadwal) | Berfungsi | Aktivasi "satu aktif" tidak atomik (F-1). Nama kategori tidak konsisten `workcode` vs `kegiatan` (F-2). |
| Scanner QR admin | Berfungsi | Logika duplikat dengan jalur lain (F-3). GPS opsional bila scanner tak kirim koordinat → bisa bypass radius. |
| Self check-in via Master QR | Berfungsi | Peserta dipilih manual dari daftar publik (terkait S6). Perlu binding sesi/nonce. |
| Face recognition | Berfungsi | Threshold & format descriptor berbeda web vs mobile (S10). Liveness hanya client (`Utils/liveness.js`). |
| Izin (cuti/sakit/dll) | Berfungsi | Dokumen publik (S4). Tidak ada notifikasi ke peserta saat approve/reject (belum ada di dokumentasi). |
| Laporan & ekspor | Berfungsi | Perlu uji performa untuk workcode harian dengan banyak peserta × hari. |
| API mobile + idempotency | Berfungsi | Tidak ada pruning (F-4). Token Sanctum tak kedaluwarsa (cek). |
| FCM | Berfungsi | Best-effort, tanpa queue → memperlambat request admin bila Firebase lambat. |
| Scheduler | Perlu dipantau | Tidak ada monitoring; jika cron mati, alpha tidak terhitung & workcode tidak teraktivasi. |
| Test suite | **Belum teruji** | PHP CLI di mesin ini salah `extension_dir` (F-5). |
| Deployment | Berfungsi | Ada kredensial bocor (S2), tanpa rollback, tanpa health check pasca-deploy. |

Gap fitur yang disarankan (opsional, Fase 6): notifikasi hasil izin ke peserta, log audit perubahan attendance manual, ekspor ke PDF, dashboard peserta dengan statistik kehadiran, soft-delete peserta.

---

## 3. Rencana Implementasi per Fase

### Fase 0 — Darurat (hari ini)

**0.1 Tutup registrasi publik (S1)**
- Hapus route `register` dari `routes/auth.php` (GET + POST) dan link "Register" di `Pages/Auth/Login.jsx` dan `Welcome.jsx`.
- Ubah default kolom `role` ke `participant` lewat migration baru (jangan edit migration lama). Pastikan `User::create` lain (seeder, sync peserta) mengisi role eksplisit.
- Migration data: **jangan** otomatis menurunkan role. Audit manual dulu (0.3).
- Test: `GET/POST /register` → 404; test registrasi lama dihapus/diganti.

**0.2 Rotasi kredensial (S2)**
- Ganti password SSH Hostinger sekarang, lalu pindah ke autentikasi SSH key saja (nonaktifkan password login bila hosting mengizinkan).
- Hapus `deploy/test.ps1` dari working tree; pastikan `deploy.ps1` hanya membaca `deploy/.env.deploy` (sudah gitignored).
- Tambah `deploy/*.ps1` yang berisi secret ke `.gitignore` bila perlu, dan pasang secret scanner (gitleaks) di pre-commit/CI.
- Bersihkan history (`git filter-repo --path deploy/test.ps1 --invert-paths`) lalu force-push — **butuh persetujuan eksplisit pemilik repo** karena merombak history. Jika repo publik, anggap kredensial sudah terambil; rotasi tetap wajib walau history dibersihkan.
- Rotasi juga: `APP_KEY` (hanya bila diduga bocor; akan meng-invalidasi sesi), password DB, kredensial Firebase bila pernah ada di repo.

**0.3 Audit akun existing**
```sql
SELECT id, name, email, username, role, participant_id, created_at
FROM users WHERE role='admin' ORDER BY created_at;
```
- Akun admin tanpa `participant_id` dan bukan milik pengelola → hapus/turunkan role, cabut token (`personal_access_tokens`), paksa reset password.
- Cek `attendances`/`participants`/`leave_requests` untuk perubahan mencurigakan sejak registrasi terbuka (bandingkan `updated_at` dengan jam normal).

**Gate**: S1 & S2 selesai, daftar admin sah dikonfirmasi pemilik.

### Fase 1 — Privasi biometrik & dokumen

**1.1 Hentikan logging descriptor (S3)**
- `Api/V1/AttendanceController.php`: hapus `array_android_lengkap` (baris ~250) dan log `[FACE-DEBUG]` atau turunkan ke `Log::debug` tanpa data sensitif (cukup `participant_id`, `distance` dibulatkan, `threshold`).
- Purge log lama: `storage/logs/*.log` di server (produksi) setelah backup terenkripsi bila perlu; batasi retensi log (`LOG_CHANNEL=daily`, `days=14`).
- Tambah test/grep CI yang gagal bila `face_descriptor` muncul di argumen `Log::`.

**1.2 Pindahkan dokumen izin & foto wajah ke disk privat (S4, S7)**
- Buat disk `private` (`storage/app/private`, tanpa `url`) di `config/filesystems.php`.
- Migration + command `files:migrate-private`: pindahkan `dokumen_izin/*` dan foto wajah, update path di DB, verifikasi file ada sebelum menghapus yang lama (idempoten, dry-run dulu).
- Endpoint terotorisasi:
  - `GET /leave-requests/{id}/document` → admin atau pemilik izin (Policy `LeaveRequestPolicy@viewDocument`).
  - `GET /participants/{id}/photo` dan API `GET /me/photo` → admin/pemilik.
  - Header: `Cache-Control: private, no-store`, `X-Content-Type-Options: nosniff`.
- Perketat fallback `/storage/{path}`: whitelist direktori non-sensitif saja (mis. logo/aset), tolak `..`, tolak `dokumen_izin/` dan `faces/`. Idealnya hapus dan pakai `storage:link` yang benar di deploy script.
- Update frontend (`LeaveApprovals`, `Participants`, modal approve) agar memakai URL baru.

**1.3 Kebijakan data biometrik**
- Dokumentasikan retensi & dasar persetujuan (UU PDP). Tambah opsi hapus wajah peserta (sudah ada `destroy`), pastikan menghapus file + descriptor + candidate `PhotoChangeRequest`.
- Pertimbangkan enkripsi kolom `face_descriptor` (Eloquent `encrypted:array`) — evaluasi dampak performa pada match 1:N sebelum diterapkan.

### Fase 2 — Hardening endpoint publik

**2.1 Face match (S5)**
- Ubah alur: peserta dipilih/diverifikasi dulu → pencocokan **1:1** terhadap descriptor peserta itu saja. Hapus 1:N di endpoint publik.
- Wajibkan `attempt token` dari server: saat membuka `/self-checkin/{token}` terbitkan nonce sekali pakai (cache, TTL 2–5 menit, terikat IP+UA+participant); `face/match` menolak tanpa nonce valid.
- Rate limit: `throttle:face-match` (mis. 10/menit/IP, 5/menit/participant) + lockout sementara setelah N kegagalan.
- Jangan kembalikan distance/skor mentah, daftar kandidat, atau data peserta lain.
- Samakan service pencocokan dengan mobile (lihat 4.1) dan tetapkan threshold dari data kalibrasi (S10).

**2.2 Lookup/search/QR publik (S6)**
- `participants/search` & `lookup`: butuh `auth` ATAU token self-checkin valid; minimal 3 karakter; batasi 10 hasil; kembalikan hanya `id`, nama tersamar/nama + kelas; **jangan** NIS/NIP, `qr_token`, status wajah.
- `participants/{participant}/qr`: pindahkan ke grup `auth` (admin atau pemilik via `Policy`). Untuk berbagi, gunakan `URL::temporarySignedRoute` (TTL pendek).
- Pertimbangkan rotasi `qr_token` peserta (aksi admin) bila diduga bocor.
- `throttle` di semua route publik; tambah `throttle` di login web dan forgot-password.

**2.3 Proxy & header (S8)**
- `trustProxies(at: [...IP/CIDR proxy Hostinger])` via env `TRUSTED_PROXIES`; fallback tidak mempercayai siapa pun.
- Middleware header keamanan: `X-Frame-Options: DENY`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` (izinkan `camera`, `geolocation` untuk self), HSTS, CSP bertahap (report-only dulu).

**2.4 Sanctum & mass-assignment**
- `config/sanctum.php`: `expiration` (mis. 30 hari) + pencabutan token lama saat login baru dari perangkat berbeda (opsional).
- Pastikan `role` tidak di `$fillable` pada `User`; set lewat atribut eksplisit.

### Fase 3 — Baseline test & CI

**3.1 Perbaiki PHP CLI lokal (F-5)**
- Cek `php --ini` dan `php -m`; arahkan `extension_dir` ke `ext` instalasi PHP di `F:` atau gunakan PHP Laragon (`C:\laragon\bin\php\...`) lewat PATH. Aktifkan: `mbstring, pdo_sqlite, sqlite3, xml, dom, xmlwriter, fileinfo, curl, zip, gd, openssl`.
- Jalankan `php artisan test`; catat hasil. **Jangan lanjut ke Fase 4 sebelum baseline hijau** atau kegagalan lama terdokumentasi.

**3.2 Test baru untuk perbaikan keamanan**
- Registrasi tertutup; user baru tidak pernah admin.
- Dokumen izin: peserta lain → 403, admin & pemilik → 200, guest → 401/302.
- `/storage/{path}`: tolak path privat dan traversal.
- face match: tanpa nonce → 4xx; rate limit; 1:1 only.
- search/lookup/QR: guest → ditolak/terbatas; field sensitif tidak bocor.
- Log: tidak ada descriptor (assert via `Log::spy`).

**3.3 CI (GitHub Actions)**
- Job: `composer install` → `pint --test` → `php artisan test` → `composer audit` → `npm ci` → `npm run build` → `npm audit --audit-level=high` → gitleaks.
- Verifikasi `public/build` tidak stale: build di CI, `git diff --exit-code public/build` (atau hash manifest).

### Fase 4 — Konsolidasi logika presensi

**4.1 `RecordAttendanceAction` / `AttendanceService` tunggal**
- Input DTO: `workcode`, `participant`, `source` (`qr_admin|self|face_web|mobile`), `gps`, `device`, `faceDistance?`, `now` (waktu server).
- Satu transaksi: `lockForUpdate` pada baris attendance `(workcode, participant, tanggal)` → validasi (aktif, waktu, device, GPS, duplikat, izin) → create/update datang/pulang → keluaran hasil bertipe (`recorded|already|rejected(reason)`).
- Migrasi bertahap, satu jalur per PR dengan test regresi: (1) API mobile, (2) self check-in, (3) face match, (4) scanner admin.
- Satukan `FaceMatcher` service (normalisasi descriptor, threshold di `config/attendance.php`, mendukung single & multi-vector).
- Aturan GPS konsisten: jika workcode punya koordinat, GPS **wajib** kecuali sumber `qr_admin` yang eksplisit dikecualikan oleh konfigurasi.

**4.2 Enum kategori (F-2)**
- `WorkcodeCategory` backed enum (`workcode|harian|24_jam`) + cast di model; ganti semua string literal `kegiatan`. Tambah test yang memastikan tidak ada nilai di luar enum.

**4.3 Satukan alur foto (S9)**
- Registrasi mandiri web ikut skema candidate (`PhotoChangeRequest`); foto aktif hanya berubah setelah approval. Hapus jalur lama setelah migrasi data.

### Fase 5 — Integritas data & operasional

- **F-1 Aktivasi atomik**: bungkus `DB::transaction` + `lockForUpdate` di semua jalur aktivasi (`WorkcodeController`, `workcode:auto-activate`). Opsi hard guard: kolom generated/unique partial (`active_flag`) bila DB mendukung; di MySQL pakai kolom `active_unique` nullable (`1` bila aktif, `NULL` bila tidak) + unique index.
- **F-4 Pruning idempotency**: command `idempotency:prune` (hapus > 7 hari), jadwalkan harian; tambah index `created_at`.
- **FCM via queue**: dispatch job `BroadcastWorkcodeUpdate` (retry/backoff) agar request admin tidak menunggu Firebase; pastikan worker/cron `queue:work --stop-when-empty` di shared hosting.
- **Monitoring scheduler**: heartbeat (`schedule:run` menulis timestamp ke cache/DB) + endpoint/halaman admin "scheduler terakhir jalan"; alert (email/WhatsApp) bila > 10 menit.
- **Backup**: dump DB harian terenkripsi + retensi 14 hari; uji restore minimal sekali.
- **Deploy**: tambah langkah backup DB sebelum `migrate --force`, health check (`/up`) setelah deploy, dan rollback (simpan release sebelumnya / `git reset` ke tag).
- **Migration policy**: ikuti panduan §15 dokumentasi (audit → backfill → constraint). Jalankan `scripts/pre_migration_audit.php` sebelum migration yang menambah constraint.

### Fase 6 — Maintainability & dokumentasi

- Pecah controller besar (`ParticipantController`, `AttendanceController`, `FaceRecognitionController`) menjadi Form Request + Action + Policy + API Resource.
- Pindahkan `API_CONTRACT.md`, `audit_report.md`, `business_logic_audit.md`, `face_recognition_analysis.md`, `walkthrough.md` ke `docs/`; jadikan `PROJECT_DOCUMENTATION.md` indeks arsitektur.
- Bersihkan artefak: `resources/js/Pages/Workcodes/Index.jsx.bak`, `scratch/`, `scratch_*.php`, `test_hash.php`, `deploy/.htaccess.bak|.new|.staging_prepend` (setelah dipastikan tidak dipakai), dan tambahkan pola ke `.gitignore`.
- `CONTRIBUTING.md` singkat: aturan "jangan log biometrik/secret", PR wajib test, format Pint.
- Perbarui `API_CONTRACT.md` sesuai perubahan (nonce face match, URL dokumen baru, token expiration) dan beri tahu tim Android lebih dulu — **perubahan kontrak API butuh koordinasi rilis aplikasi**.

---

## 4. Risiko & Kompatibilitas

| Risiko | Mitigasi |
|---|---|
| Aplikasi Android lama rusak setelah URL foto/dokumen berubah atau token kedaluwarsa | Pertahankan field lama selama masa transisi; versi API (`X-App-Version`) + pesan upgrade yang sudah ada; rilis Android dulu. |
| Memindahkan file privat merusak path lama | Command idempoten dengan dry-run, simpan path lama di log migrasi, hapus file lama baru setelah verifikasi. |
| Force-push pembersihan history | Hanya atas persetujuan pemilik; koordinasi semua klon; tetap anggap kredensial lama bocor. |
| Perubahan threshold wajah memicu false reject massal | Kalibrasi dengan data nyata (log jarak anonim 1–2 minggu), rilis bertahap, sediakan fallback scan QR admin. |
| Rate limit menghambat acara ramai (satu IP sekolah) | Throttle per participant + IP, bukan hanya IP; nilai dapat diatur via env. |
| Migration constraint gagal pada data kotor | Jalankan audit pra-migration, backfill dahulu. |

## 5. Definition of Done (keseluruhan)

- [ ] `/register` tidak dapat diakses; semua akun admin terverifikasi sah.
- [ ] Tidak ada kredensial di working tree maupun history aktif; kredensial lama sudah dirotasi.
- [ ] Tidak ada descriptor/token/dokumen di log; log lama dibersihkan.
- [ ] Dokumen izin & foto wajah tidak dapat diakses tanpa otorisasi (uji manual + otomatis).
- [ ] Endpoint publik punya rate limit; face match 1:1 dengan nonce; lookup tidak membocorkan NIS/NIP/QR.
- [ ] `php artisan test` hijau di lokal dan CI; `composer audit`/`npm audit` tanpa temuan high.
- [ ] Satu service presensi dipakai web + API; test regresi lintas jalur lulus.
- [ ] Aktivasi workcode atomik; pruning, backup, dan monitoring scheduler aktif.
- [ ] Dokumentasi diperbarui dan artefak dibersihkan.

## 6. Keputusan yang Perlu dari Pemilik Proyek

1. Apakah repo GitHub publik? (menentukan urgensi pembersihan history; kredensial tetap dirotasi.)
2. Setujui force-push untuk membersihkan `deploy/test.ps1` dari history?
3. Apakah siapa pun selain pengelola sah boleh punya akun admin? (untuk audit 0.3)
4. Bolehkah peserta tanpa akun melakukan self check-in, atau wajib login? (menentukan desain nonce/1:1 di Fase 2)
5. Kebijakan retensi data wajah (berapa lama setelah peserta tidak aktif)?
6. Jadwal rilis aplikasi Android agar perubahan API tersinkron.
