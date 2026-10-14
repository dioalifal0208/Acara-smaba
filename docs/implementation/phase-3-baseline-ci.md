# Fase 3 — Baseline Test dan CI

**Tujuan:** test suite bisa dijalankan dan menjadi penjaga untuk semua perubahan berikutnya.
**Estimasi:** 1–2 hari. **Branch:** `chore/phase-3-baseline-ci`.
**Catatan jadwal:** kerjakan **3.1 sebelum Fase 1** supaya perubahan Fase 1–2 langsung teruji.

Kondisi saat ini: ada ±22 file test di `tests/Feature` (Auth, Profile, Workcode, Attendance, SelfCheckIn, Leave, PhotoChangeRequest, dan `Api/Phase{A..H}*`). Belum ada `.github/workflows/`, belum ada Policy test.

---

## 3.1 Perbaiki PHP CLI lokal

Gejala (dari analisis 13 Okt): binary PHP di `F:` memakai `php.ini` dengan `extension_dir` ke `C:/laragon/...` → ekstensi gagal dimuat → PHPUnit berhenti karena `mbstring` hilang.

Langkah:
1. `where php` dan `php --ini` → catat binary dan `php.ini` aktif.
2. Pilih satu: (a) pakai PHP Laragon (`C:\laragon\bin\php\php-8.x\`) dan taruh di depan `PATH`; atau (b) edit `php.ini` aktif: `extension_dir = "F:/.../ext"`.
3. Aktifkan: `mbstring, openssl, pdo_sqlite, sqlite3, pdo_mysql, xml, dom, xmlwriter, fileinfo, curl, zip, gd, intl`.
4. Verifikasi: `php -v` (≥ 8.2), `php -m | findstr /i "mbstring sqlite pdo xml curl zip gd fileinfo"`.
5. `composer install`, `php artisan test --compact`.

## 3.2 Baseline

1. Jalankan seluruh suite, simpan ringkasan (jumlah pass/fail/skip) di `docs/implementation/baseline.md`.
2. Kegagalan yang sudah ada **sebelum** Fase 0–2: kategorikan (bug aplikasi / test usang / lingkungan). Perbaiki test usang; bug aplikasi dicatat sebagai task atau diperbaiki bila kecil. Jangan men-skip tanpa catatan.
3. `.env.testing` (atau `phpunit.xml`): `DB_CONNECTION=sqlite`, `DB_DATABASE=:memory:`, `CACHE_STORE=array`, `QUEUE_CONNECTION=sync`, `SESSION_DRIVER=array`, `MAIL_MAILER=array`; stub FCM supaya tidak menyentuh jaringan.
4. Cek kompatibilitas migration pada SQLite (`->change()`, enum, JSON). Perbaiki dengan guard bila perlu.
5. Ukur durasi suite; target < 2 menit.

## 3.3 Test baru untuk perbaikan keamanan

Dibuat bersama task-nya di Fase 0–2; Fase ini memastikan semuanya ada dan terdaftar.

| Area | File test | Isi minimum |
|---|---|---|
| Registrasi | `Auth/RegistrationClosedTest` | 404, jumlah user tetap, role default participant |
| Mass assignment | `Security/UserRoleTest` | PATCH profil dengan `role` tidak mengubah role |
| Log | `Security/BiometricLogTest` | `Log::spy`, tidak ada descriptor/jarak |
| File privat | `Security/PrivateFilesTest` | matriks guest/peserta lain/pemilik/admin × dokumen & foto; traversal `/storage/..` |
| Face match | `Security/FaceMatchHardeningTest` | nonce, 1:1, lockout, throttle, tanpa `distance` |
| Enumerasi | `Security/PublicEndpointsTest` | field sensitif tidak bocor, QR signed |
| Proxy/header | `Security/HeadersTest` | header terpasang, XFF dari non-proxy diabaikan |
| Sanctum | `Api/TokenExpiryTest` | token kedaluwarsa ditolak |

Tambahkan juga test kontrak untuk `API_CONTRACT.md` pada endpoint yang berubah.

## 3.4 CI — GitHub Actions

`.github/workflows/ci.yml` (trigger: `push`, `pull_request` ke `main`):

```yaml
jobs:
  php:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: shivammathur/setup-php@v2
        with: { php-version: '8.2', extensions: 'mbstring, sqlite3, pdo_sqlite, gd, zip, intl, xml' }
      - run: composer install --no-interaction --prefer-dist
      - run: cp .env.example .env && php artisan key:generate
      - run: vendor/bin/pint --test
      - run: php artisan test --compact
      - run: composer audit
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run build
      - run: git diff --exit-code public/build   # bundel yang di-commit harus sama dengan source
      - run: npm audit --audit-level=high
  secrets:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: gitleaks/gitleaks-action@v2
  guards:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: '! grep -rnE "Log::[a-z]+\(.*(descriptor|face_descriptor)" app'
      - run: '! grep -rn "Storage::disk(.public.)" app/Http/Controllers | grep -iE "dokumen|photo|face"'
```

Catatan:
- Pint belum tentu sudah dipasang (`laravel/pint` ada di default Laravel; cek `composer.json`). Jalankan `vendor/bin/pint` sekali dan commit format sebagai PR terpisah agar diff fitur bersih.
- Langkah `git diff --exit-code public/build` bisa gagal karena perbedaan versi Node/hash; bila terlalu berisik, ganti dengan memeriksa `public/build/manifest.json` mengacu ke file yang ada, atau hentikan commit `public/build` dan bangun di server/CI saat deploy.
- Aktifkan branch protection `main`: wajib CI hijau sebelum merge.
- Jangan menyimpan secret di workflow; gunakan GitHub Secrets bila nanti ada deploy otomatis.

## 3.5 Pre-commit lokal (opsional)

`.githooks/pre-commit`: `gitleaks protect --staged`, `vendor/bin/pint --dirty`. Aktifkan dengan `git config core.hooksPath .githooks`. Jangan memakai `--no-verify`.

---

## Definition of Done Fase 3

- [ ] `php artisan test` jalan di lokal dan CI; hasil baseline terdokumentasi.
- [ ] Seluruh test keamanan di §3.3 ada dan lulus.
- [ ] CI menjalankan test, Pint, audit dependensi, build frontend, dan secret scan; `main` terproteksi.
- [ ] Tidak ada test yang di-skip tanpa catatan alasan.
