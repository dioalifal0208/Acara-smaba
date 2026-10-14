# Fase 6 — Maintainability dan Dokumentasi

**Tujuan:** kode lebih mudah diubah dengan aman, dokumentasi satu pintu, repo bersih.
**Estimasi:** berkelanjutan (backlog; 1 controller per sprint kecil). **Branch:** `refactor/phase-6-*`.
**Prasyarat:** Fase 3 (CI) dan Fase 4 (service presensi). Jangan refactor tanpa test pengaman.

---

## 6.1 Kebersihan repo (kerjakan dulu, risiko rendah)

Verifikasi tidak dipakai (`grep -rn <nama>` + cek skrip deploy) lalu `git rm`:

| Artefak | Catatan |
|---|---|
| `resources/js/Pages/Workcodes/Index.jsx.bak` | backup source |
| `scratch/`, `scratch_*.php` di root | eksperimen; tambah `scratch_*.php` ke `.gitignore` |
| `test_hash.php` (modified, belum di-commit) | skrip diagnostik; pindah ke `scripts/` bila masih berguna |
| `deploy/.htaccess.bak`, `.htaccess.new`, `.htaccess.staging_prepend` | setelah Fase 5.6 |
| `deploy/test.ps1` | sudah dihapus di Fase 0 |
| `start_server.bat` | kosong, sudah di-ignore |
| `scripts/create_test_participant.php` | simpan hanya bila dibutuhkan dan tidak ikut ter-deploy ke docroot |

`public/build`: tetapkan kebijakan — tetap di-commit (shared hosting tanpa Node) dengan guard CI (Fase 3.4), atau bangun saat deploy. Dokumentasikan pilihannya di README.

## 6.2 Refactor controller besar

Pola target: **Route → FormRequest (validasi + otorisasi) → Action/Service → Resource**. Jangan ubah perilaku; setiap langkah dilindungi test.

| Controller | Pecahan yang disarankan |
|---|---|
| `AttendanceController` (web) | `ScannerController` (scan QR), `AttendanceReportController` (laporan, rekap), `AttendanceExportController` (ekspor), `ManualAttendanceController` (CRUD admin), `SignatureQrController` |
| `ParticipantController` | `ParticipantController` (CRUD), `ParticipantImportController` (preview/confirm/template), `ParticipantQrController`, `ParticipantLookupController`; sinkronisasi akun → `SyncParticipantAccountAction` |
| `FaceRecognitionController` | `FaceRegistrationController`, `FaceApprovalController`, `FaceMatchController` (tipis, memanggil `RecordAttendanceAction`) |
| `Api/V1/*` | `FormRequest` per endpoint + `JsonResource` konsisten (sebagian sudah: `UserResource`, `PhotoChangeRequestResource`) |

Aturan: controller ≤ ~150 baris, tanpa query kompleks (pindah ke query object/scope), tanpa file I/O langsung (pindah ke `PrivateFileStorage` service dari Fase 1), tanpa `Auth` check manual (pakai Policy).

**Policy** (`app/Policies/`): `LeaveRequestPolicy`, `ParticipantPolicy`, `PhotoChangeRequestPolicy`, `WorkcodePolicy`; daftarkan dan gunakan `$this->authorize()`/`can:` di route, gantikan pengecekan `role` manual yang tersebar. `AdminMiddleware`/`RoleMiddleware` tetap sebagai lapis pertama.

**Frontend:** pecah halaman besar (`Workcodes/Index`, `Participants/Index`, `Report/*`) menjadi komponen + hook (`useWorkcodeForm`, `useParticipantImport`); bungkus `fetch/axios` ke `resources/js/lib/api.js` (CSRF, error 419/422/429 seragam); hindari menyimpan data sensitif di state global/Inertia shared props (cek `HandleInertiaRequests`).

## 6.3 Kualitas kode otomatis

- Pint sudah di CI (Fase 3). Tambah **Larastan/PHPStan** level 5 (baseline untuk kode lama, naikkan bertahap) dan ESLint + Prettier untuk `resources/js`.
- Coverage minimum untuk direktori baru (`app/Services/Attendance`, Policies): ≥ 80% (pcov di CI).
- `composer.json` scripts: `composer lint`, `composer analyse`, `composer test`.

## 6.4 Dokumentasi

Struktur:
```
docs/
  architecture/PROJECT_DOCUMENTATION.md   (pindah dari root; indeks arsitektur)
  api/API_CONTRACT.md
  audits/{audit_report,business_logic_audit,face_recognition_analysis}.md
  ux/walkthrough.md
  implementation/ (rencana ini)
  runbook.md       (deploy, rollback, restore, rotasi kredensial, insiden)
  security.md      (kebijakan biometrik, retensi, pelaporan celah)
CONTRIBUTING.md
```
- Perbarui `API_CONTRACT.md`: field `code` alasan penolakan, nonce face match, URL file privat, kedaluwarsa token.
- `PROJECT_DOCUMENTATION.md` §13 (risiko) → ubah menjadi tabel status (selesai/belum) merujuk fase ini; perbarui saat schema/route/role berubah.
- `README.md`: perbarui instalasi, cron, kebijakan `public/build`, cara membuat admin (`user:make-admin`), tanpa kredensial default.
- `CONTRIBUTING.md`: alur branch/PR, wajib test, **larangan** log biometrik/secret, checklist migration, format commit.
- `runbook.md`: langkah rotasi password/SSH key/APP_KEY, restore backup, respons insiden kebocoran data (siapa dihubungi, kapan melapor, dasar UU PDP).

## 6.5 Gap fitur (opsional, setelah stabil — butuh konfirmasi prioritas)

| Fitur | Nilai | Catatan |
|---|---|---|
| Notifikasi hasil izin ke peserta (FCM + in-app) | Tinggi | memanfaatkan FcmService + queue Fase 5 |
| Log audit perubahan attendance manual/approval | Tinggi (akuntabilitas) | tabel `audit_logs` (user, aksi, sebelum/sesudah), tanpa data biometrik |
| Soft delete peserta + arsip | Sedang | cegah kehilangan riwayat presensi |
| Ekspor PDF laporan | Sedang | sudah ada tanda tangan QR |
| Dashboard statistik kehadiran peserta | Rendah | |
| 2FA untuk admin | Sedang | mengurangi dampak password admin bocor |
| Paginasi/indeks laporan besar | Sedang | uji performa workcode harian × peserta; tambah index `(workcode_id, tanggal)` |

---

## Definition of Done Fase 6

- [ ] Artefak usang terhapus; `.gitignore` mencegah kembali.
- [ ] Tiap controller target ≤ ~150 baris, memakai FormRequest + Policy + Resource; test tetap hijau.
- [ ] PHPStan/ESLint berjalan di CI.
- [ ] Dokumentasi terstruktur di `docs/`; `CONTRIBUTING.md`, `runbook.md`, `security.md` tersedia.
- [ ] Backlog fitur (6.5) diprioritaskan bersama pemilik proyek.
