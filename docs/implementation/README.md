# Rencana Implementasi Detail — Fase 0 s.d. 6

Turunan dari [implementation_plan.md](implementation_plan.md). Setiap fase punya file sendiri berisi: tujuan, prasyarat, task bernomor (file/baris yang disentuh), test, verifikasi, rollback, dan Definition of Done.

| Fase | File | Fokus | Estimasi |
|---|---|---|---|
| 0 | [phase-0-emergency.md](phase-0-emergency.md) | Tutup admin-takeover, rotasi kredensial, audit akun | 0,5–1 hari |
| 1 | [phase-1-privacy.md](phase-1-privacy.md) | Log biometrik, disk privat, otorisasi file | 2–3 hari |
| 2 | [phase-2-public-endpoints.md](phase-2-public-endpoints.md) | Face match, lookup, QR, proxy, token | 3–4 hari |
| 3 | [phase-3-baseline-ci.md](phase-3-baseline-ci.md) | PHP lokal, baseline test, CI | 1–2 hari |
| 4 | [phase-4-attendance-consolidation.md](phase-4-attendance-consolidation.md) | Satu service presensi, enum, foto | 4–6 hari |
| 5 | [phase-5-data-ops.md](phase-5-data-ops.md) | Aktivasi atomik, pruning, queue, backup | 2–3 hari |
| 6 | [phase-6-maintainability.md](phase-6-maintainability.md) | Refactor, docs, cleanup | berkelanjutan |

## Urutan dan dependensi

```
Fase 0 ──► Fase 1 ──► Fase 2 ──┐
   └─────► Fase 3 (paralel dgn 1–2 setelah 0) ──► Fase 4 ──► Fase 5 ──► Fase 6
```

- Fase 0 wajib selesai sebelum yang lain; selebihnya berjalan hanya setelah baseline test (Fase 3.1) bisa dijalankan.
- Fase 3.1 (memperbaiki PHP CLI) sebaiknya dikerjakan **di awal Fase 1**, supaya setiap perubahan Fase 1–2 langsung bisa diuji.
- Fase 2 dan Fase 4 sama-sama mengubah `FaceRecognitionController::match`; kerjakan Fase 2 dulu (hardening minimal), lalu Fase 4 memindahkan logikanya ke service.

## Konvensi kerja

- Satu fase = satu branch (`fix/phase-N-...`) dengan PR kecil per task; commit tidak boleh mencampur fase.
- Setiap task bug/keamanan: tulis test yang gagal dulu, baru perbaiki.
- Migration: ikuti aturan di `PROJECT_DOCUMENTATION.md` §15 (audit → backfill → constraint). Backup DB produksi sebelum `migrate --force`.
- Perubahan kontrak API wajib dikoordinasikan dengan rilis Android; tambahkan, jangan hapus field, selama masa transisi.
- Jangan pernah menaruh secret, descriptor wajah, atau dokumen izin di log, commit, maupun chat.

## Fakta terverifikasi di kode (13–14 Okt 2026)

- `routes/auth.php:15-18` membuka `register`; `RegisteredUserController@store` tidak mengisi role; migration `2026_08_16_150859` men-default `role='admin'`.
- `app/Models/User.php:26` memasukkan `role` ke `$fillable` (`ProfileUpdateRequest` hanya memvalidasi `name`/`email`, jadi eksploitasi lewat profil belum terlihat).
- `deploy/test.ps1` berisi `$SSH_PASS` plaintext dan sudah ada di history (`a2bcfc3`).
- `Api/V1/AttendanceController.php:250` mencatat seluruh descriptor ke log; `:282` log jarak; `:287` pesan error menampilkan jarak; threshold `0.85` di `:280`.
- `FaceRecognitionController::match` (`:226`) publik, threshold ≈0.58 (`:314`), response mengembalikan `distance` (`:437`).
- Penyimpanan di disk `public`: `LeaveRequestController:78`, `Api/V1/LeaveRequestController:184`, `Api/V1/PhotoController:105`, `FaceRecognitionController:104,153`, plus penghapusan di `PhotoChangeRequestController`, `ParticipantController:268,295`; dibaca di `UserResource:38`, `PhotoChangeRequestResource:21`.
- Aktivasi workcode tanpa transaksi: `WorkcodeController:62,99-100,113`, `AutoActivateWorkcode:32-36`.
- `config/sanctum.php:53` → `expiration => null`. `config/logging.php` default `stack`, driver `daily` sudah ada (14 hari).
- Belum ada: `app/Policies/`, `.github/workflows/`, `docs/`.
