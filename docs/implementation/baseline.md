# Baseline Test dan CI (Fase 3)

Dicatat 15 Oktober 2026, setelah Fase 0–2.

## Hasil suite

| Item | Nilai |
|---|---|
| Jumlah test | 155 lulus, 0 gagal, 0 di-skip (891 assertion) |
| Durasi lokal | ± 7,5 detik (target < 2 menit) |
| PHP | 8.3 (lokal Laragon, CI, dan produksi Hostinger) |
| Database test | SQLite in-memory (`phpunit.xml`) |
| Cache/queue/session/mail | `array` / `sync` (tanpa layanan eksternal) |
| Firebase (FCM) | Distub global di `tests/TestCase.php` — test tidak pernah mengirim push |

Tidak ada test yang di-skip. Tidak ada kegagalan bawaan dari sebelum Fase 0–2: semua kegagalan yang muncul selama Fase 0–2 adalah test usang yang mengasumsikan perilaku lama (default role admin, disk publik, endpoint publik) dan sudah diperbarui bersama perubahannya.

## Temuan saat menyusun baseline

1. **Test mengirim push notification sungguhan.** Kredensial Firebase asli ada di laptop developer dan `FcmService` tidak di-mock secara global, sehingga setiap `php artisan test` mengirim notifikasi sinkronisasi workcode palsu ke topic produksi `workcode-updates` (log lokal: 80 kali). Diperbaiki dengan stub `Messaging` di `tests/TestCase.php`.
2. **Dependency PHP rentan:** `guzzlehttp/guzzle`, `league/commonmark`, `league/flysystem`, `laravel/framework` (12.62 → 12.70) diperbarui; `composer audit` bersih.
3. **Dependency JS rentan:** `axios` dan `concurrently` diperbarui; `node-fetch` (lewat `face-api.js` → `tfjs-core`) dipaksa ke 2.7.0 lewat `overrides`; `axios` dipindah ke `dependencies` karena ikut terkirim ke browser. Sisa: celah *high* di rantai **Tailwind CSS 3** (`braces`, `chokidar`, `micromatch`, …) — hanya tool build, tidak terkirim ke browser; selesai saat migrasi ke Tailwind 4.
4. **Rahasia di riwayat Git:** gitleaks + aturan khusus `.gitleaks.toml` menemukan password SSH Hostinger di dua commit lama (`a2bcfc3` `deploy/test.ps1`, dan `3f7376d` `deploy/deploy.ps1` — yang kedua sebelumnya tidak tercatat). Sudah tidak ada di kode; tidak dirotasi atas keputusan pemilik. Temuan lama tercatat di `.gitleaksignore`.

## Pemetaan test keamanan (§3.3)

| Area | File test |
|---|---|
| Registrasi ditutup, role default | `tests/Feature/Auth/RegistrationTest.php` |
| Mass assignment `role` | `tests/Feature/Auth/RegistrationTest.php` (`test_role_cannot_be_mass_assigned`, `test_profile_update_cannot_change_role`) |
| Redaksi log biometrik | `tests/Feature/PrivateFilesTest.php` (`test_log_redaction_removes_sensitive_values`) + guard CI |
| File privat, traversal, upload berbahaya | `tests/Feature/PrivateFilesTest.php` |
| Face match 1:1, wajib login, kunci gagal, throttle | `tests/Feature/PublicEndpointsHardeningTest.php`, `tests/Feature/FaceRegistrationAndMatchTest.php` |
| Enumerasi lookup/search/QR, self check-in minimal | `tests/Feature/PublicEndpointsHardeningTest.php` |
| Header keamanan | `tests/Feature/PublicEndpointsHardeningTest.php` (`test_security_headers_are_sent`) |
| Token Sanctum kedaluwarsa & dibatasi | `tests/Feature/PublicEndpointsHardeningTest.php` (`test_api_tokens_expire_and_do_not_pile_up`) |
| Kontrak API presensi/izin/foto | `tests/Feature/Api/*` |

Test "XFF dari non-proxy diabaikan" tidak dibuat: `trustProxies('*')` sengaja dipertahankan (situs di belakang CDN Hostinger; lihat `phase-2-public-endpoints.md`).

## CI (`.github/workflows/ci.yml`)

Berjalan pada setiap push dan pull request ke `main`:

| Job | Isi |
|---|---|
| PHP | `composer install`, Pint `--test`, `php artisan test`, `composer audit` (PHP 8.3) |
| Frontend | `npm ci`, `npm run build`, cek manifest build yang di-commit, `npm audit` (runtime: high; semua: critical) |
| Pindai rahasia | gitleaks seluruh riwayat dengan `.gitleaks.toml` + `.gitleaksignore` |
| Aturan privasi | gagal bila ada log descriptor/jarak, penyimpanan data pribadi ke disk publik, atau URL `/storage` untuk file pribadi |

Pemeriksaan "bundle build identik byte-per-byte" sengaja tidak dipakai: versi Node/OS berbeda antara laptop dan CI bisa menghasilkan hash berbeda tanpa ada masalah nyata.
