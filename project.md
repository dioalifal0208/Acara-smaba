# E-Presensi SMABA — Dokumentasi Project

> Hasil analisis kode per **2 November 2026** (commit `66e78f3` + pembersihan 2 Nov di repo web, `a82e6a6` di repo Android; perubahan 2 Nov setelah `66e78f3` belum di-deploy).
> Analisis sebelumnya: 26 Oktober 2026. Perubahan sejak itu dirangkum di §0.
> Semua isi di bawah diambil dari kode yang ada. Bagian yang tidak bisa dipastikan ditandai **Belum jelas**, beserta file yang diperiksa.

Project ini terdiri dari **dua modul** di dua repository Git terpisah:

| Modul | Lokasi | Isi |
|---|---|---|
| **Web + API** | `c:\laragon\www\acara-smaba` (repo ini) | Laravel 12 + Inertia/React: panel admin, halaman peserta, self check-in publik, REST API `/api/v1` untuk Android |
| **Android** | `C:\Project\presensi_smaba_mobile` (repo terpisah) | Aplikasi Kotlin/Jetpack Compose "PRESENSI SMABA" untuk peserta: login, presensi wajah + GPS, izin, riwayat, profil |

---

## 0. Perubahan sejak analisis 26 Oktober 2026

Commit web `5808896` (deploy 28 Okt) s.d. `66939d4` (29 Okt), Android `6e20323` (v1.2.1) dan `b045009` (v1.2.2).

| Perubahan | Commit | File utama |
|---|---|---|
| Semua perbaikan 26 Okt (§13 no. 1–11) ikut ter-deploy | `5808896` | lihat §13 |
| Redesign web selesai: komponen `@/ui` + token warna, mode gelap global + toggle | `5808896` | `resources/js/ui/*`, `resources/css/tokens.css`, `tailwind.config.js` |
| **Auto presensi stakeholder** di workcode kegiatan: peserta yang dipilih admin otomatis tercatat `hadir` saat jam aktif dimulai; scan mereka menimpa catatan otomatis | `8370d4b` | `Workcode::syncAutoAttendance`, `Attendance::METHOD_AUTO` (`otomatis`), `createOrReplaceAutomatic`, tabel `workcode_auto_attendees`, `WorkcodeAutoAttendanceTest` |
| Kolom deskripsi workcode dihapus dari form (kolom DB masih ada) | `8370d4b` | `WorkcodeController` |
| Perbaikan UX hasil critique (P1–P3): layar self check-in HP bersama, kartu "Hari ini" peserta, alasan penolakan izin **wajib**, editor jadwal "jam sama setiap hari", filter di URL, lazy-load face-api/html5-qrcode | `57dca83` | `Support/ParticipantToday.php`, kolom `leave_requests.alasan_penolakan`, `ParticipantTodayTest` |
| **APK Android disimpan di server**: deploy mengunggah APK, `php artisan apk:publish` mendaftarkannya, unduhan publik di `/aplikasi/unduh`. Link Google Drive di Pengaturan dihapus | `6d362c6` | `Models/AppRelease.php`, `AppReleaseController`, `Console/Commands/PublishApk.php`, `deploy/deploy.ps1`, `AppReleaseTest` |
| **Versi minimum bergeser**: minimum = versionCode APK terbaru − `ANDROID_MIN_VERSION_LAG` (bawaan 5), tidak di bawah `ANDROID_MIN_VERSION_CODE`. `ANDROID_UPDATE_URL` dihapus | `6d362c6` | `AppRelease::minimumVersionCode`, `EnsureSupportedAppVersion` |
| **Arsip workcode**: workcode nonaktif bisa diarsipkan (data presensi tetap), tidak bisa diaktifkan sampai dikembalikan | `66939d4` | `WorkcodeController::archive/unarchive`, kolom `workcodes.archived_at`, `WorkcodeArchiveTest` |
| Istilah UI: kategori `workcode` tampil sebagai **Acara**, `harian` sebagai **Work From Office**. Konfirmasi ketik nama saat menghapus | `66939d4` | `Components/Workcodes/WorkcodeEditor.jsx`, `ui/ConfirmDialog.jsx` |
| Token Sanctum **tidak kedaluwarsa** lagi (sebelumnya 30 hari), supaya peserta tidak logout sendiri setelah update APK | `66939d4` | `config/sanctum.php` |
| Pesan validasi diseragamkan. Cek "harian hanya lewat QR pribadi" dipindah dari `validateWorkcodeActive` ke `SelfCheckInController` | `66939d4` | `AttendanceValidationService` |
| Android v1.2.1–1.2.2: redesign UI (token sama dengan web, mode gelap ikut HP), lokasi peta dari workcode terakhir, duplikat `feature/attendance/Location*.kt` dihapus | Android `6e20323`, `b045009` | `core/ui/theme/*`, `DashboardViewModel` |
| Arsip workcode terjadwal tidak pernah aktif, format Pint dirapikan (§13 no. 12–13) | `66e78f3` (2 Nov) | `Workcode::isEffectivelyActive`, `AutoActivateWorkcode`, `WorkcodeArchiveTest` |
| Pembersihan: throttle `/aplikasi/unduh` (30/menit per IP), `.env.example` dilengkapi, artefak usang dihapus/dipindah (§10.3), `implementation_plan.md` root → `docs/implementation/face-fcm-integration-plan.md`, project.md dirapikan (riwayat bug ke §13) | 2 Nov, Android `a82e6a6` | `routes/web.php`, `.env.example`, `AppReleaseTest` |
| **Kunci perangkat & sinyal anti fake GPS diwajibkan** (bawaan config `true`); token peserta yang belum terkunci ke HP dicabut agar login ulang (`EnsureDeviceBound`) | 2 Nov | `app/Http/Middleware/EnsureDeviceBound.php`, `routes/api.php`, `config/attendance.php`, `phpunit.xml`, `DeviceLockTest` |
| **Wajib ganti password awal di website**: peserta yang password-nya masih NIS/NIP diarahkan ke Profil; password baru tidak boleh sama dengan NIS/NIP | 2 Nov | `app/Support/DefaultPassword.php`, `Middleware/EnsurePasswordChanged.php`, `Auth/PasswordController`, `Profile/Edit.jsx`, `DefaultPasswordChangeTest` |
| Riwayat izin per peserta di Detail Peserta (ringkasan menunggu/disetujui/ditolak/jumlah hari), filter bulan dan tautan `?id=` di halaman Perizinan, label izin dipindah ke model | `66e78f3` (2 Nov) | `AdminLeaveController::participantHistory`, `LeaveRequest::toAdminArray/days/months`, `Components/LeaveHistoryPanel.jsx`, `ParticipantLeaveHistoryTest` |

---

## 1. Ringkasan Project

**Tujuan:** sistem presensi untuk SMA Negeri 1 Babat (SMABA), Lamongan. Mencakup presensi harian guru/karyawan (datang dan pulang) dan presensi kegiatan/acara ("workcode"). Bukti kehadiran berupa wajah, lokasi GPS, QR, atau tanda tangan.

**Pengguna (role di `users.role`: `admin` | `participant`):**

| Pengguna | Akses |
|---|---|
| **Admin / panitia** (`role=admin`) | Panel web: dashboard, scanner QR, data peserta, workcode, laporan, Master QR, perizinan, perangkat, catatan fake GPS, pengaturan TTD kepala sekolah |
| **Peserta** (`role=participant`): guru/pegawai. Kolom `participants.status` menyimpan status kepegawaian (lihat `ParticipantController::normalizeStatus`) | Aplikasi Android (presensi wajah, izin, riwayat, profil). Di web: dashboard peserta, pendaftaran wajah, pengajuan izin, dan riwayat izin |
| **Publik (tanpa login)** | Halaman depan (informasi umum + tombol unduh APK; data kehadiran tidak lagi dikirim ke publik), unduhan APK `/aplikasi/unduh`, self check-in lewat token Master QR, verifikasi tanda tangan laporan (URL bertanda tangan) |

Akun peserta dibuat otomatis saat admin menambah atau mengimpor peserta. Username = NIS/NIP, password awal = NIS/NIP (`ParticipantController::syncParticipantUser`). Registrasi publik ditutup.

Sejak 26 Okt 2026, GTT/PTT (tanpa NIP) mendapat **ID khusus 18 digit berformat NIP PNS**:
- Susunan: tanggal lahir (`YYYYMMDD`) + tahun TMT **2026** + bulan didaftarkan (`MM`) + kode jenis kelamin (1 = L, 2 = P) + nomor urut 3 digit. Contoh: `199504122026101001`.
- Nomor urut melewati nomor yang sudah dipakai siapa pun dengan awalan sama, termasuk NIP asli.
- ID dibuat otomatis di `Participant` (`staffIdPrefix()`/`generateStaffId()`, hook `saving`), disimpan di `nis_nip`, dan dipakai sebagai username dan password awal.
- Tanggal lahir dan jenis kelamin (kolom baru `tanggal_lahir`, `jenis_kelamin`; migrasi `2026_10_26_100000_add_birth_data_to_participants_table`) wajib diisi untuk GTT/PTT di form. Di impor Excel keduanya berupa kolom D–E, opsional.
- GTT/PTT tanpa data lahir (termasuk yang lama) belum punya ID maupun akun sampai admin melengkapinya.
- GTT/PTT tetap tidak masuk laporan presensi harian.

**Alur utama:**

1. Admin mengimpor/menambah peserta (Excel via PhpSpreadsheet). Akun login dan `qr_token` pribadi dibuat otomatis.
2. Admin membuat **workcode** dengan salah satu dari dua kategori (sejak 29 Okt 2026 UI memakai istilah **Work From Office** untuk `harian` dan **Acara** untuk `workcode`):
   - `harian`: hari aktif, jam datang/pulang (sama setiap hari atau per hari), lokasi dan radius.
   - `workcode` (kegiatan): tanggal dan jam aktif, bisa dibatasi ke peserta tertentu (`participant_workcode`), dan bisa memilih **stakeholder** yang otomatis tercatat hadir saat kegiatan dimulai (`workcode_auto_attendees`).
   - Workcode yang sudah lewat bisa **diarsipkan** (`archived_at`) alih-alih dihapus.
3. Peserta mendaftarkan wajah (Android atau web) → admin menyetujui → `face_status=approved`.
4. Peserta presensi lewat salah satu jalur:
   - **Android**: precheck anti fake GPS → wajah 128-d dicocokkan 1:1 di server → GPS/radius → jendela waktu dan toleransi terlambat.
   - **Scanner admin**: memindai QR pribadi peserta.
   - **Self check-in**: memindai Master QR workcode kegiatan → memilih nama → tanda tangan.
5. Peserta mengajukan izin → admin menyetujui → baris presensi berstatus `izin` dibuat. Notifikasi FCM dikirim ke HP.
6. Scheduler menandai `lupa_absen` / `alpha` (`attendance:calculate-alpha`, tiap 5 menit), menyamakan status kegiatan terjadwal + mencatat presensi otomatis stakeholder (`workcode:auto-activate`, tiap menit), menghapus foto presensi setelah 30 hari, dan membersihkan token kedaluwarsa.
7. Admin melihat laporan/rekap per workcode, mencetak laporan bertanda tangan QR, dan mengekspor CSV.
8. Sinkronisasi dua arah:
   - Web → Android: tombol **Sync** (push FCM).
   - Android → web: tarik ke bawah di aplikasi menaikkan sinyal `WebSync`, yang dipolling oleh tab admin.
9. Rilis Android: perintah deploy membangun APK, mengunggahnya ke `storage/app/apk`, lalu `apk:publish` mendaftarkannya (3 rilis terakhir disimpan). Peserta mengunduh dari halaman depan; HP yang tertinggal lebih dari 5 rilis ditolak (426) dan diarahkan ke unduhan yang sama.

---

## 2. Tech Stack

### 2.1 Web + API (`acara-smaba`)

| Lapisan | Teknologi (versi dari `composer.json` / `package.json`) |
|---|---|
| Bahasa | PHP `^8.2` (CI memakai 8.3, sama dengan produksi Hostinger), JavaScript (JSX) |
| Framework | Laravel `^12.0`, Inertia.js (`inertiajs/inertia-laravel ^2.0`, `@inertiajs/react ^2.0`), React `^18.2` |
| Auth | Session web (scaffolding Laravel Breeze `^2.4`), Laravel Sanctum `^4.0` untuk token API Android (tanpa masa berlaku; dicabut saat logout/ganti perangkat/lepas perangkat, `config/sanctum.php`) |
| Database | MySQL (produksi/Laragon; beberapa migrasi memakai `ALTER ... ENUM` khusus non-SQLite), SQLite in-memory untuk test (`phpunit.xml`) |
| Library backend | `kreait/laravel-firebase ^7.2` (FCM), `phpoffice/phpspreadsheet` (impor Excel), `simplesoftwareio/simple-qrcode ^4.2`, `tightenco/ziggy ^2.0` (route di JS) |
| Library frontend | `face-api.js ^0.22.2` (pendaftaran wajah di browser), `html5-qrcode ^2.3.8` (scanner), `chart.js ^4.4.7`, `axios`, `aos`, `@headlessui/react`, Google Maps JS API |
| Styling | Tailwind CSS `^3.2.1` + `@tailwindcss/forms` (paket `@tailwindcss/vite ^4` juga terpasang). Token warna di `resources/css/tokens.css` (terang + gelap), komponen bersama di `resources/js/ui/` (impor `@/ui`), ikon `lucide-react` |
| Build | Vite `^7.0.7` + `laravel-vite-plugin ^2`. Hasil build `public/build/` **di-commit** ke Git |
| Tools | PHPUnit `^11.5`, Laravel Pint (format), Pail (log), GitHub Actions CI, gitleaks (pemindai rahasia) |
| Hosting | Shared hosting Hostinger via SSH (`deploy/`). `proc_open` dimatikan di server, jadi scheduler memakai `Schedule::call` |

### 2.2 Android (`presensi_smaba_mobile`)

| Lapisan | Teknologi (dari `app/build.gradle.kts`, `gradle/libs.versions.toml`) |
|---|---|
| Bahasa | Kotlin `2.1.0`, target JVM 11 |
| Build | Android Gradle Plugin `9.4.1`, KSP, `compileSdk`/`targetSdk` 37, `minSdk` 26. Versi aplikasi `versionCode 5` / `1.2.2` (29 Okt 2026) |
| UI | Jetpack Compose (BOM `2026.02.01`), Material 3, Navigation Compose `2.8.8`, Coil |
| DI | Hilt `2.57.2` |
| Jaringan | Retrofit `2.11.0` + kotlinx-serialization, OkHttp `4.12.0` |
| Penyimpanan | DataStore Preferences, dienkripsi sendiri dengan AndroidKeyStore + AES-GCM (token & ID perangkat). Dependency `security-crypto` yang tidak dipakai dihapus 26 Okt 2026 |
| Wajah | CameraX `1.3.3`, ML Kit Face Detection `16.1.6`, TensorFlow Lite `2.16.1` (model face-api.js dikonversi ke `.tflite`: landmark 68 titik + recognition 128-d) |
| Lokasi & peta | Play Services Location `21.3.0`, Maps Compose `4.4.1` |
| Background | WorkManager `2.10.0`, Firebase Cloud Messaging, Firebase Crashlytics (aktif hanya di build rilis) |
| Build flavor | `dev` (emulator), `deviceDev` (HP di LAN), `staging`, `production`. Build rilis memakai R8 dan ABI ARM saja |

---

## 3. Struktur Folder

### 3.1 Web + API

```
acara-smaba/
├── app/
│   ├── Console/Commands/      # attendance:calculate-alpha, attendance:prune-media, workcode:auto-activate,
│   │                          # apk:publish, user:make-admin, face:update-descriptor, files:migrate-private, fcm:test
│   ├── Http/
│   │   ├── Controllers/       # Controller web (Inertia) + Auth/ (Breeze)
│   │   │   └── Api/V1/        # Controller REST API untuk Android
│   │   ├── Middleware/        # admin, role, SecurityHeaders, EnsureSupportedAppVersion, BumpWebSyncOnWrite, EnsureDeviceBound, EnsurePasswordChanged
│   │   ├── Requests/          # LoginRequest, ProfileUpdateRequest
│   │   └── Resources/Api/V1/  # JSON Resource untuk API
│   ├── Logging/               # RedactSensitiveData: redaksi data sensitif di log
│   ├── Models/                # 11 model Eloquent (lihat §6), termasuk AppRelease
│   ├── Observers/             # AttendanceObserver: push FCM saat presensi berubah
│   ├── Providers/             # AppServiceProvider: rate limiter api/api-login, observer
│   ├── Services/              # AttendanceValidationService, AttendanceStateService, FcmService, QrCodeService, SelfCheckInTokenService
│   └── Support/               # Helper domain: FaceMatcher/FaceDescriptor, DeviceLock, LocationIntegrity, PrivateFile, WebSync,
│                              # Holidays, AdminDashboardStats, ParticipantToday, dll.
├── bootstrap/app.php          # Routing, middleware, penanganan exception JSON untuk api/v1
├── config/attendance.php      # Konfigurasi domain: toleransi terlambat, retensi foto, threshold wajah, anti fake GPS, versi minimum APK
├── database/
│   ├── migrations/            # 55 migrasi (2026-08-13 s.d. 2026-10-29)
│   ├── seeders/               # DatabaseSeeder (admin + 3 contoh peserta), SettingSeeder (data kepala sekolah)
│   └── factories/             # UserFactory
├── deploy/                    # Skrip deploy Hostinger (deploy.ps1, deploy-server.sh, server-setup.sh, .htaccess varian)
├── docs/                      # API_CONTRACT, kompatibilitas descriptor, rencana fase 0–6 + face-fcm-integration-plan, security.md, audit, ux
├── public/                    # index.php, build/ (aset Vite yang di-commit), models/ (bobot face-api.js), images/
├── resources/
│   ├── css/tokens.css         # Token warna/gerak terang + gelap (dipakai tailwind.config.js)
│   ├── js/Pages/              # Halaman Inertia (Dashboard, Participants, Workcodes, Report, Scanner, SelfCheckIn, Dev/UiKit, ...)
│   ├── js/Components/         # Komponen fitur (modal wajah, kalender presensi, peta, lonceng, Workcodes/WorkcodeEditor, LeaveHistoryPanel, ...)
│   ├── js/ui/                 # Komponen dasar `@/ui`: Button, Dialog, ConfirmDialog, DataTable, Form, Layout, Toast, StatusPill,
│   │                          # Segmented, TrendChart, AttendanceBoard, ThemeMenu, theme.js, navigation.js (menu admin)
│   ├── js/Utils/              # faceEnrollment.js, liveness.js (tantangan senyum / cek 3D)
│   ├── js/lib/                # backgroundReload (polling), webSyncSignal, appUrl, reportPrint (cetak laporan)
│   └── views/app.blade.php    # Root view Inertia (skrip awal tema gelap, theme-color)
├── routes/                    # web.php, api.php, auth.php, console.php (scheduler), files.php, signal.php
├── scripts/                   # Utilitas: face-parity (konversi TFLite, fixture), audit pra-migrasi, check-contrast.mjs (kontras token)
├── storage/app/apk/           # APK Android hasil deploy (3 rilis terakhir, tidak dilacak Git)
├── tests/Feature/             # 61 file test (Api/, Auth/, fitur web)
├── backups/                   # Backup lokal, scratch/ dan audit lama (tidak dilacak Git)
├── .venv-tflite/              # Virtualenv Python untuk konversi model (diabaikan Git)
├── README.md                  # Dokumentasi utama (instalasi, konfigurasi, deploy)
├── project.md                 # Dokumen ini
└── CLAUDE.md                  # Instruksi untuk agent (jangan baca Workcodes/Index.jsx utuh)
```

### 3.2 Android

```
presensi_smaba_mobile/
├── app/
│   ├── build.gradle.kts             # Flavor, signing, R8, verifikasi SHA-256 model wajah
│   ├── google-services.json         # Konfigurasi Firebase (dilacak Git)
│   └── src/
│       ├── main/
│       │   ├── AndroidManifest.xml  # Izin, <queries> paket fake GPS/root, service FCM
│       │   ├── assets/face/         # face_landmark_68.tflite, face_recognition.tflite
│       │   └── java/id/sch/smanegeri1babatlmg/presensi/
│       │       ├── MainActivity.kt, PresensiApp.kt, AppNavigation.kt   # Single-activity + NavHost
│       │       ├── core/device/     # DeviceIdentity (ANDROID_ID untuk kunci perangkat)
│       │       ├── core/face/       # Pipeline face-api.js: alignment, ekstraksi descriptor 128-d, logika tangkap
│       │       ├── core/location/   # LocationProvider, LocationIntegrityChecker (anti fake GPS), LocationGate
│       │       ├── core/network/    # NetworkModule (Retrofit/OkHttp), interceptor (auth, versi app, idempotency, log aman), api/, dto/
│       │       ├── core/security/   # Penyimpanan token & perangkat terenkripsi
│       │       ├── core/ui/         # Tema, komponen bersama, dialog izin lokasi
│       │       ├── core/update/     # AppUpdateGate + layar wajib update (respons 426)
│       │       └── feature/         # auth, dashboard, attendance, enrollment, history, leave, profile, sync
│       ├── test/                    # ±30 unit test (JUnit, MockWebServer, coroutines-test)
│       ├── androidTest/             # Test paritas wajah di perangkat, LoginScreenTest
│       ├── dev/, deviceDev/         # Manifest overlay: izinkan cleartext HTTP untuk server lokal
├── docs/android-face-integration.md
└── local.properties.example         # Contoh konfigurasi lokal (URL API, path signing, MAPS_API_KEY)
```

---

## 4. Daftar Fitur dan Status

Status: **Selesai** (ada di kode, ada test, dipakai), **Sebagian** (berjalan tapi ada celah/bagian belum ada), **Belum** (tidak ada di kode), **Rusak** (ada bug yang terbukti di kode).

| Fitur | Status | File terkait | Catatan |
|---|---|---|---|
| Login web (username NIS/NIP atau email) | Selesai | `app/Http/Requests/Auth/LoginRequest.php`, `routes/auth.php` | Kunci setelah 5 percobaan per username+IP. Halaman `/login` dialihkan ke `/` (form ada di modal halaman depan) |
| Login API + token Sanctum | Selesai | `Api/V1/AuthController.php`, `routes/api.php` | Throttle 5/menit, maksimal 5 token per user, ability `role:<role>` |
| Kunci perangkat (1 akun = 1 HP) | Selesai | `app/Support/DeviceLock.php`, `DeviceController.php`, `Pages/Devices/Index.jsx` | Hanya HMAC ANDROID_ID yang disimpan. Reset satuan dan massal oleh admin. Pengajuan pindah HP dihapus (migrasi `2026_10_22_100000`). Sejak 2 Nov 2026 **wajib** (bawaan `DEVICE_LOCK_REQUIRE_ID=true`): login tanpa `device_id` ditolak 426, dan token peserta yang belum terkunci ke HP dicabut lewat middleware `EnsureDeviceBound` (401 `device_not_bound`), sehingga aplikasi login ulang dan akun langsung terkunci. Test: `DeviceLockTest` |
| Lupa password / reset via email | Dihapus (26 Okt 2026) | `routes/auth.php`, `Components/LoginModal.jsx`, `tests/Feature/Auth/AuthenticationTest.php` | Akun dibuat dan diubah admin, dan email tidak pernah terkirim (`MAIL_MAILER=log`). Route `forgot-password`/`reset-password`, `PasswordResetLinkController`, `NewPasswordController`, halaman `ForgotPassword.jsx`/`ResetPassword.jsx`, tautan "Lupa password?", dan `PasswordResetTest` dihapus |
| Reset / ganti password peserta oleh admin | Selesai (26 Okt 2026) | `ParticipantController::updatePassword`, `PUT /participants/{id}/password`, `Pages/Participants/Show.jsx` (kartu "Password Akun"), `tests/Feature/ParticipantPasswordTest.php` | Di halaman Detail Peserta. Dua pilihan: reset ke NIS/NIP (password awal), atau password baru (min. 8 karakter, diulang). Opsional: sekaligus keluarkan semua sesi (token aplikasi Android + sesi web). Password tidak dicatat ke log. Peserta GTT/PTT tanpa data lahir belum punya akun, jadi kartunya hanya berisi keterangan. Sejak 2 Nov 2026, reset ke NIS/NIP membuat peserta wajib mengganti password saat membuka website (`EnsurePasswordChanged`, `DefaultPasswordChangeTest`) |
| Verifikasi email | Sebagian | `routes/auth.php`, `app/Models/User.php` | Route ada, tetapi `User` tidak mengimplementasikan `MustVerifyEmail` (baris 5 dikomentari), jadi middleware `verified` tidak memblokir apa pun |
| Registrasi publik | Belum (sengaja ditutup) | `routes/auth.php` | Admin baru dibuat via `php artisan user:make-admin` |
| Presensi wajah Android (datang/pulang) | Selesai | `Api/V1/AttendanceController.php`, `Support/FaceMatcher.php`, Android `feature/attendance/` | Descriptor 128-d (face-api.js), L2, threshold 0.45. Kunci 15 menit setelah 5 kali gagal. Idempotency-Key wajib |
| Presensi wajah di website | Belum (sengaja dihapus) | `routes/web.php:232-233` | Komentar menyebut presensi wajah hanya lewat Android. Pendaftaran wajah di web masih ada |
| Pendaftaran wajah + persetujuan admin | Selesai | `FaceRecognitionController.php`, `Api/V1/FaceEnrollmentController.php`, `Components/FaceEnrollmentCamera.jsx`, `Utils/liveness.js` | Web: multi-sampel + liveness (senyum/3D pasif). Android: `POST /me/face-enrollment`. Riwayat wajah di `face_histories` |
| Ganti foto profil (pengajuan) | Selesai | `Api/V1/PhotoController.php`, `PhotoChangeRequestController.php` | Foto aktif baru berubah setelah disetujui |
| Validasi lokasi GPS + radius | Selesai | `AttendanceValidationService::validateGpsAndRadius` | Haversine. Menolak akurasi ≤0 atau >120 m dan jam HP yang selisih >2 menit. Radius per workcode (default 50 m) |
| Anti fake GPS (mock, aplikasi fake GPS, root, hooking) | Selesai | `Support/LocationIntegrity.php`, `LocationIntegrityLogController.php`, Android `core/location/LocationIntegrityChecker.kt` | Dicatat di `location_integrity_violations`. Opsi pengembang hanya dicatat. Sejak 2 Nov 2026 sinyal **wajib** (bawaan `ANTI_FAKE_GPS_REQUIRE_SIGNALS=true`): presensi tanpa sinyal ditolak 426. Semua APK versionCode ≥ 2 sudah mengirim sinyal |
| Foto/selfie presensi | Selesai | `Support/AttendanceFaceCapture.php`, `Console/Commands/PruneAttendanceMedia.php` | Disimpan di disk privat, foto datang & pulang terpisah, dihapus setelah 30 hari |
| Toleransi terlambat | Selesai | `Models/Workcode.php` (`isLateAt`, `withLateTolerance`), `config/attendance.php` | Default 60 menit, hanya untuk datang harian |
| Scanner QR pribadi (admin) | Selesai | `AttendanceController::scan`, `Pages/Scanner/Index.jsx` | Ada input NIP manual. Papan menampilkan terlambat & izin. Scan menimpa catatan otomatis stakeholder |
| Self check-in Master QR + tanda tangan | Selesai | `SelfCheckInController.php`, `Pages/SelfCheckIn/*`, `Pages/Admin/MasterQr.jsx` | Hanya untuk workcode kegiatan (Work From Office ditolak lewat `closedReason 'harian'`). Layar untuk HP bersama, cek GPS lebih awal, daftar nama bisa dipakai keyboard. Throttle per IP. Identitas peserta tidak diverifikasi (lihat §10) |
| Presensi manual oleh admin (tambah/ubah/hapus) | Selesai | `AttendanceController::manualStore/Update/Destroy` | Tanpa log audit |
| Status otomatis alpha / lupa absen | Selesai | `Console/Commands/CalculateAttendanceStatus.php`, `routes/console.php` | Pemilihan peserta dan hari libur nasional diperhitungkan sejak 26 Okt 2026 (§13 no. 3) |
| Workcode: CRUD, kategori, jadwal per hari, lokasi | Selesai | `WorkcodeController.php`, `Pages/Workcodes/Index.jsx`, `Components/Workcodes/*` | Beberapa workcode bisa aktif bersamaan. Ada pemilihan peserta, pencarian, konfirmasi nonaktifkan, dan konfirmasi ketik nama saat menghapus. Deskripsi tidak lagi diisi di form (28 Okt) |
| Arsip workcode | Selesai (29 Okt 2026, celah jadwal ditutup 2 Nov) | `WorkcodeController::archive/unarchive`, `workcodes.archived_at`, `Workcode::isEffectivelyActive`, `tests/Feature/WorkcodeArchiveTest.php` | Hanya workcode yang tidak aktif. Arsip tidak pernah aktif: tidak bisa diaktifkan manual, tidak dinyalakan scheduler walau jadwalnya tiba, tanpa presensi otomatis stakeholder (§13 no. 12) |
| Auto presensi stakeholder (kegiatan) | Selesai (28 Okt 2026) | `Workcode::syncAutoAttendance`, `Attendance::createOrReplaceAutomatic`, `AutoActivateWorkcode`, `tests/Feature/WorkcodeAutoAttendanceTest.php` | Stakeholder tercatat `hadir` (metode `otomatis`) pada jam mulai. Presensi yang sudah ada tidak disentuh. Catatan otomatis dihapus bila centang dilepas atau jadwal berubah. Bila workcode membatasi peserta, stakeholder ikut ditambahkan ke peserta terpilih |
| Aktivasi otomatis workcode terjadwal | Selesai | `Models/Workcode::isEffectivelyActive`, `Console/Commands/AutoActivateWorkcode.php`, `routes/console.php` | Status aktif dihitung dari jadwal. Sejak 26 Okt 2026 `workcode:auto-activate` terjadwal tiap menit, menyamakan `is_active`, dan mengirim FCM tanpa mematikan workcode lain (§13 no. 4) |
| Data master peserta (CRUD, impor Excel + preview, hapus massal, detail) | Selesai | `ParticipantController.php`, `Pages/Participants/Index.jsx`, `Show.jsx`, `Components/ImportModal.jsx` | Template unduhan tersedia. Nama dikapitalisasi (title case) |
| QR pribadi peserta (SVG/PNG, regenerasi) | Selesai | `ParticipantController::qrCode/downloadSvg/downloadPng`, `Services/QrCodeService.php` | Hanya untuk admin atau pemilik |
| Manajemen user admin di UI | Belum | — | Admin hanya bisa dibuat lewat command `user:make-admin` |
| Izin (izin, sakit, tidak absen pulang; rentang tanggal; bukti) | Selesai | `LeaveRequestController.php`, `Api/V1/LeaveRequestController.php`, `AdminLeaveController.php`, `Pages/LeaveApprovals/Index.jsx`, Android `feature/leave/` | Persetujuan membuat/memperbarui baris presensi `izin`, dalam satu transaksi DB sejak 26 Okt 2026. Sejak 28 Okt penolakan **wajib** berisi alasan (`alasan_penolakan`, maks. 500 karakter), yang tampil ke peserta di riwayat izin web dan Android. Izin bisa diajukan ke workcode harian walau tidak ada presensi yang sedang dibuka |
| Riwayat izin per peserta (admin) | Selesai (2 Nov 2026) | `AdminLeaveController::participantHistory`, `GET /participants/{id}/leave-history`, `Components/LeaveHistoryPanel.jsx`, `tests/Feature/ParticipantLeaveHistoryTest.php` | Di Detail Peserta: ringkasan dan daftar semua pengajuan, filter status, tombol "Tinjau di Perizinan" (`/admin/leaves?id=`). Halaman Perizinan mendapat filter bulan (`LeaveRequest::months`). |
| Cuti | Selesai (sebagai jenis izin) | `app/Models/LeaveRequest.php` (`JENIS_IZIN` memuat `cuti`), `AdminLeaveController.php` (label "Cuti"), `Components/LeaveRequestModal.jsx:87`, Android `feature/leave/LeaveScreen.kt:66` | Dipastikan 26 Okt 2026: cuti adalah salah satu `jenis_izin`, bukan fitur terpisah. Alurnya sama dengan izin dan tercatat `izin` di presensi. Tidak ada kuota/saldo cuti, jenis cuti (tahunan, melahirkan, …), atau persetujuan berjenjang |
| Hari libur nasional | Sebagian | `Support/Holidays.php`, `HolidayController.php`, `Components/AttendanceCalendarModal.jsx` | ICS Google, dipakai kalender dan `attendance:calculate-alpha`. Laporan masih hanya menandai Sabtu/Minggu sebagai `libur`. Bila Google gagal, salinan terakhir yang valid dipakai (§13 no. 5) |
| Rekap / laporan per workcode + rekap individu | Selesai | `AttendanceController::report/getIndividualRecap/exportAttendance`, `Pages/Report/Index.jsx`, `lib/reportPrint.js`, `tests/Feature/DailyReportPeriodTest.php` | Polling ±20 detik. Sejak 26 Okt 2026 rekap **harian** dihitung per bulan (bawaan bulan berjalan, `?bulan=YYYY-MM` untuk bulan lain). "Tanggal Kegiatan" saat dicetak = tanggal 1 s.d. akhir bulan. Peserta GTT/PTT tidak masuk laporan/ekspor harian. Hitung ganda izin (baris presensi + pengajuan) diperbaiki, dan izin sakit kini masuk kolom Sakit. Laporan kegiatan tidak berubah |
| Cetak laporan + tanda tangan QR kepala sekolah | Selesai | `Report/Index.jsx` (`window.print`), `AttendanceController::qrSignature`, `VerificationController.php`, `SettingController.php` | Verifikasi lewat URL bertanda tangan |
| Ekspor laporan | Sebagian | `AttendanceController::exportAttendance` | Ekspor `.xlsx` sungguhan sejak 26 Okt 2026 (dulu CSV). Ekspor PDF: Belum |
| Dashboard admin (KPI, grafik mingguan, keterlambatan, metode) | Selesai | `routes/web.php`, `Support/AdminDashboardStats.php`, `Pages/Dashboard.jsx` | KPI hadir diperbaiki 26 Okt 2026 (§13 no. 1) |
| Notifikasi push ke HP (FCM) | Selesai | `Services/FcmService.php`, `Observers/AttendanceObserver.php`, Android `WorkcodeFirebaseMessagingService.kt` | Push saat workcode berubah, Sync penuh, perubahan status (presensi, izin, wajah, foto), dan sesi dicabut |
| Notifikasi admin (lonceng) | Selesai | `Support/AdminNotifications.php`, `Components/AdminNotificationBell.jsx` | Pengajuan wajah, foto, dan izin yang menunggu |
| Sinkronisasi Android → web (tarik ke bawah) | Selesai | `WebSyncController.php`, `Support/WebSync.php`, `routes/signal.php`, `lib/webSyncSignal.js` | Sinyal versi lewat cache file, tanpa session |
| Versi minimum aplikasi Android (wajib update) | Selesai | `Middleware/EnsureSupportedAppVersion.php`, `Models/AppRelease.php`, Android `core/update/` | Sejak 28 Okt: jendela bergeser. Minimum = versionCode APK terbaru − `ANDROID_MIN_VERSION_LAG` (bawaan 5), tidak di bawah `ANDROID_MIN_VERSION_CODE`. Respons 426 berisi `update_url` = `/aplikasi/unduh`. Halaman Pengaturan menampilkan rilis terbaru, versi minimum, dan jumlah peserta yang akan diminta update di rilis berikutnya |
| Distribusi APK dari server | Selesai (28 Okt 2026) | `deploy/deploy.ps1`, `Console/Commands/PublishApk.php`, `AppReleaseController.php`, `tests/Feature/AppReleaseTest.php` | Deploy mengunggah APK (`.part` → rename), `apk:publish` mengecek ZIP header + SHA-256, menolak versionCode sama dengan file berbeda, menyimpan 3 rilis. Unduhan publik dihitung (`download_count`, HEAD tidak dihitung) |
| Beranda peserta (web) | Selesai | `routes/web.php` (`participant.dashboard`), `Support/ParticipantToday.php`, `Pages/Participant/Dashboard.jsx`, `tests/Feature/ParticipantTodayTest.php` | Kartu "Hari ini" (jadwal + presensi hari ini), tanggal dari server (WIB), QR pribadi di menu bawah |
| Tampilan web: redesign + mode gelap | Selesai | `resources/js/ui/*`, `resources/css/tokens.css`, `ui/theme.js`, `ui/ThemeMenu.jsx` | Mode gelap global dengan pilihan terang/gelap/sistem. Katalog komponen `/_ui` hanya di lingkungan lokal. Tidak ada test frontend |
| File pribadi via URL bertanda tangan | Selesai | `Support/PrivateFile.php`, `PrivateFileController.php`, `routes/files.php` | Foto wajah, foto presensi, TTD, dan bukti izin di disk `private` |
| Profil (ubah nama/email/password, hapus akun) | Selesai | `ProfileController.php`, `Pages/Profile/*` | Bawaan Breeze; ada risiko terkait email admin (lihat §10) |
| Log audit perubahan data | Belum | — | Tercantum di backlog `docs/implementation/phase-6-maintainability.md:73` |
| 2FA admin | Belum | — | Backlog phase-6 |
| Soft delete / arsip peserta | Belum | — | Backlog phase-6; hapus peserta = hapus presensi (cascade) |

---

## 5. API / Endpoint

### 5.1 REST API Android (`routes/api.php`, prefix `/api/v1`)

Semua route terautentikasi memakai `auth:sanctum` + `throttle:api` (60/menit per user). Middleware grup `api` juga menjalankan `EnsureSupportedAppVersion` dan `BumpWebSyncOnWrite`. Kolom "Status" mencerminkan pemakaian oleh klien yang ada (diperiksa di `core/network/api/*.kt` Android dan `resources/js`).

| Method | Route | Fungsi | Auth | Status |
|---|---|---|---|---|
| POST | `/api/v1/auth/login` | Login, kunci perangkat, terbitkan token | Tidak (throttle `api-login` 5/menit) | Selesai, dipakai |
| POST | `/api/v1/auth/logout` | Cabut token aktif | Sanctum | Selesai, dipakai |
| POST | `/api/v1/sync` | Naikkan sinyal WebSync (tarik ke bawah) | Sanctum | Selesai, dipakai |
| GET | `/api/v1/me` | Profil peserta + status wajah | Sanctum | Selesai, dipakai |
| GET | `/api/v1/me/state` | Status gabungan untuk dashboard (ETag → 304) | Sanctum | Selesai, dipakai |
| POST | `/api/v1/me/face-enrollment` | Daftar wajah 128-d (menunggu admin) | Sanctum | Selesai, dipakai |
| GET | `/api/v1/me/photo` | Foto aktif peserta | Sanctum | Selesai, dipakai |
| POST | `/api/v1/me/photo-change-requests` | Ajukan ganti foto (multipart) | Sanctum | Selesai, dipakai |
| GET | `/api/v1/admin/photo-change-requests` | Daftar pengajuan foto (admin) | Sanctum + cek admin di controller | Ada, tidak dipakai klien mana pun |
| PATCH | `/api/v1/admin/photo-change-requests/{id}/approve` | Setujui foto (admin) | Sanctum + admin | Ada, tidak dipakai klien |
| PATCH | `/api/v1/admin/photo-change-requests/{id}/reject` | Tolak foto (admin) | Sanctum + admin | Ada, tidak dipakai klien |
| GET | `/api/v1/workcodes/active` | Workcode aktif untuk peserta | Sanctum | Selesai, dipakai |
| GET | `/api/v1/attendance-history/daily` | Riwayat harian per tanggal | Sanctum | Ada, tidak dipakai Android |
| GET | `/api/v1/attendance-history` | Riwayat presensi | Sanctum | Selesai, dipakai |
| POST | `/api/v1/attendance` | Submit presensi wajah (Idempotency-Key wajib) | Sanctum + ability `role:participant` | Selesai, dipakai |
| POST | `/api/v1/attendance/precheck` | Cek anti fake GPS sebelum kamera dibuka | Sanctum + participant | Selesai, dipakai |
| POST | `/api/v1/attendances/leave` | Ajukan izin (alias lama) | Sanctum | Ada, tidak dipakai Android |
| POST | `/api/v1/leave-requests` | Ajukan izin (multipart, bukti) | Sanctum | Selesai, dipakai |
| GET | `/api/v1/leave-requests` | Daftar izin peserta | Sanctum | Selesai, dipakai |
| POST | `/api/v1/fcm/register` | Simpan token FCM + subscribe topic | Sanctum | Selesai, dipakai |
| DELETE | `/api/v1/fcm/unregister` | Hapus token FCM | Sanctum | Selesai, dipakai |

Kontrak lengkap dan katalog status error ada di `docs/api/API_CONTRACT.md`.

### 5.2 Endpoint web (JSON/aksi) penting (`routes/web.php`)

| Method | Route | Fungsi | Auth | Status |
|---|---|---|---|---|
| GET | `/` | Halaman depan: informasi umum + tombol unduh APK (prop `apkUrl`). Statistik/aktivitas presensi tidak lagi dikirim ke publik | Tidak | Selesai |
| GET/HEAD | `/aplikasi/unduh` | Unduh APK terbaru (`apk.download`) | Tidak (throttle 30/menit per IP sejak 2 Nov) | Selesai (28 Okt 2026) |
| GET | `/dashboard` | Dashboard admin | `auth, verified, admin` | Selesai (KPI diperbaiki 26 Okt 2026) |
| GET | `/admin/notifications` | Ringkasan lonceng notifikasi | admin | Selesai |
| GET/POST | `/admin/leaves(?id=)`, `/admin/leaves/{id}/approve\|reject` | Perizinan. `reject` wajib `alasan_penolakan` | admin | Selesai |
| GET/POST/PUT/DELETE | `/workcodes`, `/workcodes/{id}/activate\|deactivate\|archive\|unarchive` | Kelola workcode (+ `participant_ids`, `auto_participant_ids`) | admin | Selesai |
| POST | `/sync` | Push FCM sync penuh ke semua HP | admin | Selesai |
| GET/POST/PUT/DELETE | `/participants`, `/participants/import(/preview\|/confirm)`, `/participants/bulk-delete`, `/participants/template`, `/participants/{id}/qr/regenerate`, `/participants/{id}/face-history` | Data peserta | admin | Selesai |
| PUT | `/participants/{id}/password` | Reset password ke NIS/NIP atau atur password baru (opsional keluarkan semua sesi) | admin | Selesai |
| GET | `/participants/{id}/leave-history` | Riwayat izin satu peserta (JSON) | admin | Selesai (2 Nov 2026) |
| POST/DELETE | `/api/participants/{id}/face` | Daftar/hapus wajah oleh admin | admin | Selesai |
| POST | `/admin/participants/{id}/face/approve\|reject` | Persetujuan wajah | admin | Selesai |
| POST | `/admin/photo-change-requests/{id}/approve\|reject` | Persetujuan foto | admin | Selesai |
| GET/POST | `/admin/devices`, `/admin/users/{id}/device/reset`, `/admin/devices/reset-all` | Kunci perangkat | admin | Selesai |
| GET | `/admin/fake-gps` | Catatan fake GPS | admin | Selesai |
| GET/POST | `/admin/master-qr`, `/admin/master-qr/regenerate` | Master QR self check-in | admin | Selesai |
| GET | `/report`, `/report/individual/{workcode}/{participant}` | Laporan & rekap individu | admin | Selesai |
| GET | `/workcodes/{id}/export` | Ekspor Excel (.xlsx) | admin | Selesai |
| GET | `/workcodes/{id}/qr-signature` | QR tanda tangan laporan | admin | Selesai |
| POST/PUT/DELETE | `/admin/attendances(/{id})` | Presensi manual | admin | Selesai |
| GET/POST | `/scanner`, `/scan`, `/api/scan` | Scanner QR pribadi | admin | Selesai |
| GET/POST | `/admin/settings` | Nama/NIP kepala sekolah + info rilis APK & versi minimum (hanya baca). Route `/admin/settings/apk` (link Google Drive) dihapus 28 Okt | admin | Selesai |
| GET | `/_ui` | Katalog komponen `Dev/UiKit` | admin, **hanya** `APP_ENV=local` | Alat pengembangan |
| GET | `/participant/dashboard`, `/participant/face-registration`, `/participant/leave-history` | Halaman peserta | `auth, verified, role:participant` | Selesai |
| POST | `/api/participants/{id}/face/self`, `/participant/leave` | Daftar wajah sendiri, ajukan izin | participant | Selesai |
| GET | `/participants/{id}/qr`, `/download-svg`, `/download-png` | QR pribadi | `auth` (admin atau pemilik) | Selesai |
| GET/PATCH/DELETE | `/profile` | Profil | `auth` | Selesai |
| GET/POST | `/self-checkin/{token}`, `/self-checkin/{token}/participants` | Self check-in publik | Tidak (token + throttle 300/120 per menit) | Selesai |
| GET | `/api/holidays` | Libur nasional (ICS Google, cache 7 hari) | Tidak (throttle 120/menit) | Sebagian |
| GET | `/storage/{path}` | Fallback file publik (hanya prefix `branding/`) | Tidak | Selesai |
| GET | `/verify-signature/{workcode}` | Verifikasi TTD laporan | URL bertanda tangan | Selesai |
| GET | `/files/{type}/{id}` | File pribadi | URL bertanda tangan, tanpa session | Selesai |
| GET | `/sync/signal` | Versi sinyal WebSync (dipolling tab admin) | Tidak, tanpa throttle (sengaja) | Selesai |
| GET | `/up` | Health check Laravel | Tidak | Selesai |
| — | `routes/auth.php` | Login, logout, verifikasi email, konfirmasi password, ganti password (reset via email dihapus 26 Okt 2026) | campuran | Bawaan Breeze |

---

## 6. Database

Sumber: `database/migrations/*` dan `app/Models/*`. DBMS: MySQL (produksi), SQLite (test).

### 6.1 Tabel domain

| Tabel / Model | Kolom penting | Relasi |
|---|---|---|
| `users` / `User` | `name`, `username` (unik, = NIS/NIP), `email` (nullable, unik), `password`, `role` enum(`admin`,`participant`, default `participant`), `participant_id`, `fcm_token`, `device_id_hash`, `device_model`, `device_bound_at`, `app_version_code`, `app_version_name` | `belongsTo Participant`; memiliki token Sanctum |
| `participants` / `Participant` | `nama`, `nis_nip` (unik, wajib), `status` (status kepegawaian), `qr_token` (unik, disembunyikan), `face_descriptor` (JSON, sampel 128-d), `face_status` enum(`none`,`pending`,`approved`,`rejected`), `photo_path` | `hasMany Attendance`, `hasMany PhotoChangeRequest`, `hasMany FaceHistory`, `belongsToMany Workcode` |
| `workcodes` / `Workcode` | `nama_workcode`, `deskripsi` (tidak lagi diisi dari form, masih dikirim di respons riwayat API), `kategori` enum(`workcode`,`harian`), `tanggal`, `jam_aktif_mulai/selesai`, `hari_aktif` (JSON), `jadwal_per_hari` (JSON, kunci 1–7), `jam_datang_mulai/selesai`, `jam_pulang_mulai/selesai`, `latitude`, `longitude`, `radius_meters` (default 50), `is_active`, `archived_at` (29 Okt) | `hasMany Attendance`, `belongsToMany Participant`, `belongsToMany Participant` lewat `workcode_auto_attendees` (`autoAttendees`) |
| `participant_workcode` (pivot) | PK (`workcode_id`, `participant_id`) | Peserta terpilih per workcode. Workcode tanpa peserta terpilih terbuka untuk semua |
| `workcode_auto_attendees` (pivot, 28 Okt) | PK (`workcode_id`, `participant_id`), cascade delete | Stakeholder yang otomatis tercatat hadir saat kegiatan dimulai |
| `attendances` / `Attendance` | `workcode_id`, `participant_id`, `tanggal`, `waktu_hadir`, `waktu_pulang`, `status` enum(`hadir`,`alpha`,`izin`,`sakit`,`lupa_absen`,`libur`), `leave_request_id`, `signature_path`, `face_capture_path`, `face_capture_pulang_path`, `attendance_method` (`wajah`, `tanda_tangan`, QR, `otomatis`, ...; scope `recorded()` mengecualikan `otomatis`), `device_hash`, `ip_address` | `belongsTo Workcode` (cascade), `belongsTo Participant` (cascade), `belongsTo LeaveRequest` (set null). **Unique** (`workcode_id`,`participant_id`,`tanggal`) |
| `leave_requests` / `LeaveRequest` | `participant_id`, `workcode_id`, `tanggal`, `tanggal_selesai`, `tipe` enum(`izin`,`sakit`), `tipe_izin`, `jenis_izin`, `keterangan`, `alasan`, `bukti_path`, `status_approval` enum(`pending`,`approved`,`rejected`), `alasan_penolakan` (28 Okt) | `belongsTo Participant`, `belongsTo Workcode`, `hasOne Attendance` |
| `photo_change_requests` / `PhotoChangeRequest` | `participant_id`, `photo_path`, `face_descriptor`, `status`, `reviewed_by`, `reviewed_at`, `rejection_reason` | `belongsTo Participant`, `belongsTo User` (reviewer) |
| `face_histories` / `FaceHistory` | `participant_id`, `photo_path`, `source`, `approved_by`, `approved_at` | `belongsTo Participant`, `belongsTo User` (approver) |
| `location_integrity_violations` / `LocationIntegrityViolation` | `user_id`, `participant_id`, `workcode_id`, `reasons` (JSON), `signals` (JSON), `blocked`, `device_model`, `ip_address`, `created_at` | `belongsTo User`, `Participant`, `Workcode` |
| `api_idempotency_logs` / `ApiIdempotencyLog` | `participant_id`, `idempotency_key`, `request_hash`, `response_code`, `response_payload` | `belongsTo Participant`. Unique (`participant_id`,`idempotency_key`) |
| `settings` / `Setting` | `key` (unik), `value` | — (berisi `kepala_sekolah_nama`, `kepala_sekolah_nip`; `android_apk_url` dihapus migrasi 28 Okt) |
| `app_releases` / `AppRelease` (28 Okt) | `version_code` (unik), `version_name`, `file_name`, `size_bytes`, `sha256`, `download_count`, `published_at` | — (file di `storage/app/apk`, ikut terhapus saat baris dihapus; disimpan 3 terakhir) |

### 6.2 Tabel bawaan framework

`password_reset_tokens`, `sessions`, `cache`, `cache_locks`, `jobs`, `job_batches`, `failed_jobs`, `personal_access_tokens` (Sanctum, dengan `expires_at`).

Tabel `device_change_requests` pernah dibuat (2026-10-16), lalu dihapus (2026-10-22).

### 6.3 Diagram relasi ringkas

```
users ──(participant_id)──► participants ◄──┬── attendances ──► workcodes
                                            ├── leave_requests ─┘   ▲
                                            ├── photo_change_requests
                                            ├── face_histories
                                            ├── api_idempotency_logs
                                            ├── participant_workcode ┤
                                            └── workcode_auto_attendees ┘
location_integrity_violations ──► users / participants / workcodes
attendances.leave_request_id ──► leave_requests
app_releases (berdiri sendiri)
```

---

## 7. Aplikasi Android

**Arsitektur:** single-activity (`MainActivity`) + Jetpack Compose + **MVVM** (ViewModel per fitur, `StateFlow`). Lapisan **Repository** di tiap `feature/*`. DI dengan **Hilt** (`@Module`/`@Binds` per fitur). Struktur paket per fitur (`feature/`) dan lapisan bersama (`core/`).

### 7.1 Layar (route di `AppNavigation.kt`)

| Route | Screen | ViewModel | Fungsi |
|---|---|---|---|
| `splash` | `SplashScreen` | `SplashViewModel` | Cek token tersimpan → dashboard atau login |
| `login` | `LoginScreen` | `AuthViewModel` | Login + `device_id` (kunci perangkat) |
| `dashboard` | `DashboardScreen` (+ `DashboardMap`) | `DashboardViewModel` | Status presensi dari `/me/state`, tombol Absen Datang/Pulang, peta lokasi, tarik ke bawah untuk sync |
| `face_recognition` | `FaceRecognitionScreen` | (event dari `DashboardViewModel`) | Kamera, deteksi ML Kit, descriptor TFLite 128-d, kirim presensi |
| `face_enrollment` | `FaceEnrollmentScreen` | `FaceEnrollmentViewModel` | Pendaftaran wajah ke server |
| `history` | `HistoryScreen` | `HistoryViewModel` | Riwayat presensi |
| `leave` | `LeaveScreen` | `LeaveViewModel` | Ajukan izin + daftar izin |
| `profile` | `ProfileScreen` (+ `ProfilePhotoCameraScreen`) | `ProfileViewModel` | Profil, ganti foto, logout |
| (overlay) | `LocationGateScreen`, `AppUpdateScreen` | — | Penahan bila izin/GPS belum aktif, atau versi aplikasi ditolak (426) |

Bottom navigation: Beranda, Riwayat, Izin, Profil.

### 7.2 Koneksi ke API

- Retrofit dengan `BuildConfig.API_BASE_URL` per flavor (`app/build.gradle.kts`):
  - `dev` → `10.0.2.2:8000` (emulator).
  - `deviceDev` → `API_DEVICE_BASE_URL` dari `local.properties`.
  - `staging` → `STAGING_API_BASE_URL`.
  - `production` → Gradle property `PRODUCTION_API_BASE_URL`.
- Interceptor OkHttp (`core/network/`):
  - `AppVersionInterceptor`: header `X-App-Version-Code` / `X-App-Version-Name`.
  - `AuthInterceptor`: Bearer token.
  - `IdempotencyKeyInterceptor`: UUID per tangkapan wajah.
  - `SafeLoggingInterceptor`: redaksi `Authorization` dan body sensitif.
- Respons error di-parse oleh `ApiErrorParser` → `AttendanceOutcome`.
- Real-time:
  - FCM (`WorkcodeFirebaseMessagingService`) → `SyncCoordinator` → muat ulang `/me/state` (ETag).
  - `StateRefreshWorker` (WorkManager) dan `AppVisibilityTracker` untuk penyegaran berkala/saat aplikasi kembali aktif.
- Token disimpan di `EncryptedTokenStorage` dan ID perangkat di `EncryptedDeviceStorage`. Keduanya memakai DataStore, dengan nilai dienkripsi AES-GCM memakai kunci di AndroidKeyStore.
- Build production memakai `usesCleartextTraffic="false"`; `dev`/`deviceDev` mengizinkan HTTP.

### 7.3 Izin (permission) di `AndroidManifest.xml`

| Permission | Kegunaan |
|---|---|
| `INTERNET` | API |
| `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION` | GPS presensi (diminta saat runtime) |
| `CAMERA` | Pengenalan wajah, foto profil (`camera` / `camera.front` `required=false`) |
| `POST_NOTIFICATIONS` | Notifikasi FCM (Android 13+) |
| `FOREGROUND_SERVICE` | **Dipakai** (dipastikan 26 Okt 2026). `feature/sync/StateRefreshWorker.kt` dijalankan sebagai expedited work (`setExpedited`, baris 77) dan menyediakan `getForegroundInfo()` (baris 52). Di Android 8–11 (minSdk 26), WorkManager menjalankannya lewat `SystemForegroundService`, yang butuh izin ini. Di Android 12+ expedited work memakai JobScheduler, jadi `foregroundServiceType` tidak diperlukan |
| `<queries>` ±42 paket | Deteksi aplikasi fake GPS, root (Magisk/SuperSU/KernelSU), dan Xposed/LSPosed |

`allowBackup="false"`; aturan backup/data-extraction ada di `res/xml/`.

### 7.4 Test Android

- 31 file unit test di `app/src/test`: repository, ViewModel, interceptor, serialisasi DTO, anti fake GPS, logika wajah.
- Instrumented test di `app/src/androidTest`: `FaceParityInstrumentedTest`, `LoginScreenTest`.
- `docs/implementation/face-fcm-integration-plan.md` §6a mencatat 116 unit test lulus pada 19 Okt 2026. **Tidak dijalankan ulang** dalam analisis ini.

---

## 8. Cara Menjalankan

### 8.1 Web + API (lokal, Laragon/PHP 8.2+)

```bash
composer setup                              # composer install, salin .env.example → .env, key:generate, migrate, npm install, npm run build
php artisan db:seed                         # admin (username: admin) + 3 contoh peserta
php artisan db:seed --class=SettingSeeder   # data kepala sekolah untuk laporan
php artisan storage:link
composer dev                                # serve + queue:listen + pail + vite sekaligus
php artisan schedule:work                   # scheduler lokal (alpha/lupa absen, prune media, prune token)
php artisan test                            # 328 test (lulus, 2 Nov 2026)
vendor/bin/pint --test                      # cek format (dijalankan juga di CI); di Windows hasilnya terganggu CRLF, lihat §9.3
```

Variabel environment yang dibutuhkan (nama saja; isi dari `.env.example` dan `config/*.php`):

- **Aplikasi:** `APP_NAME`, `APP_ENV`, `APP_KEY`, `APP_DEBUG`, `APP_URL`, `APP_LOCALE`.
- **Database:** `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`.
- **Session/cache/queue:** `SESSION_DRIVER`, `CACHE_STORE`, `QUEUE_CONNECTION`, `FILESYSTEM_DISK`.
- **Mail:** `MAIL_*`.
- **Integrasi:** `GOOGLE_MAPS_API_KEY` (Maps JS, dibatasi referrer), `FIREBASE_CREDENTIALS` (path file service account, jangan di-commit).
- **Seeder:** `ADMIN_PASSWORD` (opsional; bila kosong, password acak dicetak sekali).
- **Domain presensi:** `FACE_THRESHOLD`, `FACE_ENFORCE_DIMENSIONS`, `FACE_MATCH_MAX_FAILURES`, `ATTENDANCE_LATE_TOLERANCE_MINUTES`, `ATTENDANCE_MEDIA_RETENTION_DAYS`, `DEVICE_LOCK_REQUIRE_ID`, `ANDROID_MIN_VERSION_CODE`, `ANDROID_MIN_VERSION_LAG`, `SANCTUM_EXPIRATION`.
- **Anti fake GPS:** `ANTI_FAKE_GPS_BLOCK_FAKE_APPS`, `ANTI_FAKE_GPS_BLOCK_ROOT`, `ANTI_FAKE_GPS_BLOCK_HOOKING`, `ANTI_FAKE_GPS_REQUIRE_SIGNALS`.

Semua variabel di atas kini tercantum di `.env.example` beserta penjelasannya (2 Nov 2026). `SANCTUM_EXPIRATION` dibiarkan sebagai komentar: tidak diisi = token tidak kedaluwarsa. `ANDROID_UPDATE_URL` sudah tidak dipakai (diganti `/aplikasi/unduh`).

Catatan:

- Kamera (scanner, pendaftaran wajah) hanya jalan di `localhost`/HTTPS.
- Admin tambahan dibuat dengan `php artisan user:make-admin <username>`.

**Produksi (Hostinger):**

- Perintah `deploy` (lihat `README.md` §Deployment dan `deploy/`) menjalankan urutan ini:
  1. Test dan `npm run build`.
  2. Commit dan push ke `main`.
  3. Bila ada APK baru: unggah ke `storage/app/apk/incoming` lewat `scp` (dilewati bila versi itu sudah ada di server).
  4. Di server: mode maintenance, `git pull`, `composer install --no-dev --no-scripts`, `migrate --force`, `apk:publish`, cache config/view.
  5. Salin `public/` ke folder web, lalu health check halaman depan dan `HEAD /aplikasi/unduh`.
- Cron produksi: `php artisan schedule:run` tiap menit atau tiap 5 menit.
- `route:cache` sengaja tidak dipakai.

### 8.2 Android

1. Buka `C:\Project\presensi_smaba_mobile` di Android Studio. JDK yang dipakai: JBR bawaan Android Studio.
2. Salin `local.properties.example` → `local.properties`, lalu isi:
   - `API_DEVICE_BASE_URL` (untuk flavor `deviceDev`) dan/atau `STAGING_API_BASE_URL`.
   - `RELEASE_SIGNING_PROPERTIES` (path file signing di luar repo; wajib untuk build rilis).
   - `MAPS_API_KEY` (Google Maps SDK for Android; wajib untuk build rilis, tanpa key peta dashboard kosong).
3. Untuk FCM/Crashlytics, siapkan `app/google-services.json` (bisa dimatikan dengan `-PENABLE_FIREBASE=false`).
4. Perintah:
   ```bash
   ./gradlew assembleDevDebug                     # emulator, backend http://10.0.2.2:8000
   ./gradlew assembleDeviceDevDebug               # HP di jaringan lokal
   ./gradlew testDevDebugUnitTest                 # unit test
   ./gradlew assembleProductionRelease -PPRODUCTION_API_BASE_URL=https://<domain>/api/v1/   # rilis (butuh signing)
   ```
5. Naikkan `versionCode` di `app/build.gradle.kts` setiap rilis. Versi minimum bergeser otomatis saat APK baru di-publish (`ANDROID_MIN_VERSION_LAG`); `ANDROID_MIN_VERSION_CODE` hanya untuk update darurat.

---

## 9. Progres dan Yang Belum Selesai

Bagian ini hanya berisi yang **masih terbuka**. Bug yang sudah diperbaiki ada di §13.

### 9.1 Perkiraan kelengkapan

| Modul | Perkiraan | Alasan |
|---|---|---|
| Backend / API | **±93%** | Semua alur inti ada dan 328 test lulus. Tidak ada bug terbuka yang diketahui (§9.3). Fase 4–6 rencana (konsolidasi service, aktivasi atomik, queue FCM, backup) belum dimulai |
| Web admin & peserta (frontend) | **±90%** | Redesign selesai (komponen `@/ui`, mode gelap). Halaman besar sudah dipecah. Belum ada manajemen admin, ekspor PDF, log audit. Tidak ada test frontend maupun ESLint |
| Aplikasi Android | **±87%** | Fitur peserta lengkap, v1.2.2 (versionCode 5) dirilis lewat unduhan server. Uji end-to-end beberapa skenario belum dilakukan (`docs/implementation/face-fcm-integration-plan.md` §6b–§7). Kunci perangkat dan sinyal anti fake GPS diwajibkan sejak 2 Nov 2026 (cek `.env` produksi, §10.1) |
| Operasional & keamanan | **±64%** | CI, gitleaks, header keamanan, disk privat, distribusi APK otomatis + throttle unduhan sudah ada. Masih terbuka: rotasi kredensial lama di history, CSP belum enforce, backup terenkripsi & uji restore, heartbeat scheduler, branch protection, kebijakan masa berlaku token API (§10.1) |

### 9.2 TODO/FIXME di kode

Pencarian `TODO|FIXME|HACK|XXX` di `app/`, `routes/`, `resources/js`, `config/`, `database/`, `tests/`, `deploy/` (web, dicek ulang 2 Nov 2026) dan `app/src/**/*.kt` (Android): **tidak ada temuan**. Pekerjaan tertunda dicatat di dokumen, bukan di kode:

- `docs/implementation/phase-0-emergency.md:107,111-112`:
  - password SSH/DB lama tidak dirotasi;
  - password admin bawaan di history wajib diganti;
  - pembersihan history opsional.
- `docs/implementation/phase-1-privacy.md:115-116`:
  - enkripsi `face_descriptor` ditunda;
  - masa simpan data belum ditetapkan sekolah.
- `docs/implementation/phase-2-public-endpoints.md:91-92`:
  - uji Android vs staging;
  - CSP dari Report-Only ke enforce.
- `docs/implementation/phase-3-baseline-ci.md:107-110`:
  - proteksi branch `main`;
  - pre-commit;
  - migrasi Tailwind 3 → 4.
- `docs/implementation/phase-4…6`: seluruh Definition of Done masih terbuka (0/5, 0/6, 0/5).
- `docs/implementation/face-fcm-integration-plan.md` (DoD end-to-end): 2 item belum dicentang.

### 9.3 Bug / masalah terbuka

Tidak ada bug terbuka yang diketahui per 2 Nov 2026. Catatan perilaku yang belum diputuskan:

- **Ekspor kegiatan mencantumkan semua peserta.** Peserta tanpa presensi tertulis `alpha`, walaupun workcode membatasi peserta (`AttendanceController::exportAttendance`). Ini perilaku lama.
- **Data produksi untuk perbaikan kolom `tanggal` belum dicek** (§13 no. 7). Database lokal bersih (0 dari 485 baris). Untuk mengecek produksi (hanya membaca): `SELECT attendance_method, status, COUNT(*) FROM attendances WHERE DATE(created_at) <> tanggal GROUP BY attendance_method, status;`
- **Status CI GitHub belum diperiksa** setelah perbaikan Pint (`gh` tidak terpasang di mesin ini).
- **Pint lokal di Windows:** `vendor/bin/pint --test` di working tree melaporkan banyak file karena `core.autocrlf=true` membuat file ber-CRLF. Isi repo tetap LF, jadi CI tidak terpengaruh. Untuk cek lokal yang akurat, jalankan Pint pada hasil `git archive`.

### 9.4 Fitur direncanakan tetapi belum diimplementasikan

Sumber: `docs/implementation/phase-6-maintainability.md:68-78`, phase-4, dan phase-5.

- Log audit perubahan presensi manual dan persetujuan.
- Soft delete / arsip **peserta** (arsip workcode sudah ada).
- Ekspor PDF laporan.
- 2FA admin.
- Manajemen akun admin di UI (sekarang hanya `php artisan user:make-admin`).
- Hari libur nasional di laporan (laporan masih hanya menandai Sabtu/Minggu).
- Paginasi/indeks laporan besar (index `(workcode_id, tanggal)`).
- Dashboard statistik kehadiran per peserta.
- `RecordAttendanceAction` tunggal dan enum `WorkcodeCategory` (Fase 4).
- Aktivasi workcode atomik + unique guard, FCM lewat queue dengan retry, heartbeat scheduler, backup harian terenkripsi + uji restore (Fase 5).
- PHPStan/ESLint di CI, controller ≤150 baris dengan FormRequest + Policy + Resource (Fase 6).
- Enkripsi `face_descriptor` di database (Fase 1.3, ditunda).

Item "notifikasi hasil izin ke peserta" di backlog phase-6 **sudah ada** di kode (`AdminLeaveController::notifyParticipant` → FCM).

---

## 10. Masalah Teknis dan Risiko

### 10.1 Keamanan

| Risiko | Lokasi | Keterangan |
|---|---|---|
| Password awal peserta = NIS/NIP | `ParticipantController::syncParticipantUser` | **Dimitigasi 2 Nov 2026.** Website: selama password masih NIS/NIP, peserta hanya bisa membuka Profil untuk menggantinya (`EnsurePasswordChanged`), sehingga QR pribadi dan pengajuan izin tidak bisa dipakai orang yang tahu NIP-nya. Android: dilindungi kunci perangkat + face match, tanpa paksaan ganti password. Sisa: akun yang belum pernah login di HP mana pun bisa diambil alih lewat Android oleh orang yang tahu NIP-nya (login pertama mengunci akun ke HP orang itu); admin bisa mereset kunci di halaman Perangkat |
| Self check-in tanpa verifikasi identitas | `SelfCheckInController::submitForm` | Siapa pun yang memegang Master QR bisa memilih peserta lain dan menandatangani. `device_hash` dibentuk dari `device_id` + User-Agent kiriman klien (`AttendanceValidationService::generateDeviceHash`), sehingga mudah diganti |
| Semua proxy dipercaya | `bootstrap/app.php:45` | `trustProxies('*')`: `X-Forwarded-For` bisa dipalsukan bila server asal diakses langsung, sehingga batas per-IP bisa diakali (diakui di komentar) |
| CSP masih Report-Only, dengan `unsafe-inline`/`unsafe-eval` | `app/Http/Middleware/SecurityHeaders.php` | Belum memblokir XSS |
| Kredensial lama di history Git | `docs/implementation/phase-0-emergency.md:107,111` | Password SSH lama tidak dirotasi; password admin bawaan yang ada di history wajib diganti. **Perlu tindakan manual** |
| API key Google Maps Android | `presensi_smaba_mobile/app/build.gradle.kts` (`mapsApiKey`) | Key kini dibaca dari `MAPS_API_KEY` (`local.properties` / Gradle property). Key lama **masih ada di history Git** dan selalu terbaca di dalam APK, jadi **wajib dibatasi** ke package name + SHA-1 di Google Cloud Console, atau diganti. **Perlu tindakan manual**. `app/google-services.json` juga dilacak Git |
| Data biometrik tidak dienkripsi saat disimpan | `participants.face_descriptor` | Ditunda dengan sengaja (phase-1) |
| Kunci perangkat & sinyal anti fake GPS: pastikan aktif di produksi | `.env` produksi, `config/attendance.php` | Bawaan kode sejak 2 Nov 2026 = wajib. Tetapi bila `.env` produksi masih berisi `DEVICE_LOCK_REQUIRE_ID=false` atau `ANTI_FAKE_GPS_REQUIRE_SIGNALS=false` (disalin dari `.env.example` lama), nilai itu yang berlaku. **Perlu dicek manual**, lalu `php artisan config:cache` |
| Token API Android tanpa masa berlaku (sejak 29 Okt 2026) | `config/sanctum.php` | Disengaja agar peserta tidak logout setelah update APK. Token yang bocor berlaku sampai logout, ganti perangkat, atau admin melepas perangkat. Jadwal `sanctum:prune-expired` praktis tidak menghapus apa pun. **Perlu keputusan**: tetap begini, atau isi `SANCTUM_EXPIRATION` (contoh 180 hari ada di `.env.example`) |
| File `.env`, `.env.backup`, `.env.production` ada di disk lokal | root repo | Sudah diabaikan `.gitignore`. Jangan disalin ke docroot |
| `/sync/signal` tanpa throttle | `routes/signal.php` | Disengaja (hanya angka versi, cache file), tetapi tetap terbuka publik |

Sisi yang sudah baik:

- Validasi input di semua endpoint API memakai `Validator`/`$request->validate`.
- Throttle untuk login, endpoint publik, dan unduhan APK (30/menit per IP).
- Idempotency presensi.
- File pribadi di disk privat dengan URL bertanda tangan.
- Redaksi log (`RedactSensitiveData`), dan CI menolak log descriptor/jarak serta penyimpanan ke disk publik.
- Admin hanya ditentukan oleh `role` (bukan email).
- Token Sanctum dicabut saat logout, ganti perangkat, dan reset perangkat oleh admin.
- APK yang diterbitkan diverifikasi header ZIP + SHA-256 dari PC sebelum didaftarkan (`apk:publish`).

### 10.2 Duplikasi kode

- `storeIdempotencyAndReturn()` ditulis tiga kali: `Api/V1/AttendanceController.php`, `Api/V1/LeaveRequestController.php`, `Api/V1/PhotoController.php`.
- Pola error "exception berisi JSON" (`throw new \Exception(json_encode([...]), code)` lalu `json_decode($e->getMessage())`) berulang di `AttendanceValidationService`, `Api/V1/AttendanceController`, `AttendanceController::scan`, dan `SelfCheckInController`.
- Pemeriksaan role peserta (`tokenCan('role:participant') && role === 'participant' && participant_id`) diulang per controller API. Belum ada Policy (`app/Policies/` tidak ada).
- Perhitungan jadwal hari ini untuk dashboard admin ditulis inline di closure `routes/web.php` (`jadwal` di `boards`), sebagian menduplikasi `ParticipantToday::schedule`.
- Pencarian workcode aktif tersebar: `getActiveWorkcodes()`, `isEffectivelyActive()`, query langsung di `AutoActivateWorkcode`, `CalculateAttendanceStatus`, `ParticipantToday::dailyWorkcode`, `SelfCheckInController::scheduledToday`. Penyaringan arsip harus diingat manual di tiap query baru sampai ada satu scope bersama (§13 no. 12).

### 10.3 Kode mati / artefak usang

Dibersihkan 2 Nov 2026: `start_server.bat`, `deploy/.htaccess.bak`, command `inspire`, Android `scratch_test.kt`. `scratch/` dan dua audit lama di root (`business_logic_audit.md`, `face_recognition_analysis.md`, sengaja tidak dilacak Git karena berisi rincian celah) dipindah ke `backups/` (lokal, tidak dilacak). `implementation_plan.md` di root dipindah ke `docs/implementation/face-fcm-integration-plan.md`.

Yang tersisa, sengaja dibiarkan:

- Endpoint API tanpa pemakai di aplikasi sekarang: `GET /api/v1/attendance-history/daily`, `POST /api/v1/attendances/leave`, dan tiga route `/api/v1/admin/photo-change-requests*`. Masih diuji di `tests/`. Jangan dihapus selama APK lama masih diizinkan (jendela 5 versi).
- Kolom `workcodes.deskripsi`: tidak lagi diisi dari form, tetapi masih dikirim di respons API riwayat (`AttendanceHistoryResource`, `AttendanceDailyHistoryController`).
- `deploy/.htaccess.new`, `deploy/.htaccess.staging_prepend`: dihapus setelah Fase 5.6 dipastikan (`docs/implementation/phase-5-data-ops.md:67`).
- `.agent/skills/impeccable/` (58 file alat desain) di Git: dipakai agent desain. Menunggu keputusan apakah dikeluarkan dari Git.

### 10.4 Kekurangan test

- Backend: 328 test fitur lulus (`php artisan test`, 2 Nov 2026). Unit test murni hanya `tests/Unit/ExampleTest.php`.
- Frontend React: tidak ada test sama sekali, tidak ada ESLint.
- Tidak ada analisis statis PHP (PHPStan/Larastan).
- Android: unit test cukup lengkap. Uji end-to-end di HP baru sebagian (lihat §9.1). Android **tidak punya CI**: tidak ada folder `.github/` di repo `presensi_smaba_mobile` (remote GitHub `dioalifal0208/Presensi-App`). Build dan test dijalankan oleh perintah `deploy` di laptop developer.

### 10.5 Kemudahan perawatan

- File besar (2 Nov 2026):
  - Frontend: `SelfCheckIn/Form.jsx` (688), `lib/reportPrint.js` (686), `Scanner/Index.jsx` (492), `LeaveApprovals/Index.jsx` (471). `Workcodes/Index.jsx` hanya 344 baris tetapi barisnya panjang (±19 KB), jadi jangan dibaca utuh (`CLAUDE.md`).
  - Backend: `ParticipantController.php` (**1.061**), `AttendanceController.php` (778).
  - Android: `FaceRecognitionScreen.kt` (631), `DashboardScreen.kt` (500).
- Closure route dengan logika query di `routes/web.php` (dashboard admin dengan `boards`/jadwal, dashboard peserta).
- Literal kategori/status (`'harian'`, `'workcode'`, `'hadir'`, …) tersebar; belum ada enum PHP.

---

## 11. Rekomendasi Langkah Berikutnya

Diperbarui 2 Nov 2026. Urutan prioritas:

1. **Tindakan manual (keamanan)** — tidak bisa dikerjakan dari kode:
   - Pastikan password admin produksi sudah diganti, dan password SSH/DB lama di history dirotasi.
   - Batasi API key Maps Android ke package name + SHA-1 di Google Cloud Console.
   - Cek status CI di GitHub Actions.
   - Putuskan kebijakan masa berlaku token API (`SANCTUM_EXPIRATION`).
2. **Pengetatan Android**
   - Selesaikan skenario uji end-to-end yang tersisa.
   - Pastikan `.env` produksi tidak menimpa `DEVICE_LOCK_REQUIRE_ID` / `ANTI_FAKE_GPS_REQUIRE_SIGNALS` dengan `false` (§10.1). Setelah deploy, pantau halaman Perangkat: peserta yang dulu belum terkunci akan login ulang dan terkunci ke HP-nya.
3. **Fase 5 (operasional)**: backup database terenkripsi + uji restore (belum ada backup otomatis di kode), heartbeat scheduler, aktivasi workcode atomik, FCM via queue, proteksi branch `main`.
4. **Fase 4/6 (perawatan)**
   - Satukan sumber kebenaran "workcode aktif" (satu scope/method yang menyaring arsip, jadwal, dan `is_active`).
   - Satukan helper idempotency dan ganti pola exception-JSON dengan exception domain bertipe.
   - Tambah Policy/FormRequest dan enum kategori/status. Pecah `ParticipantController` (1.061 baris).
   - Tambah PHPStan + ESLint ke CI.
5. **Fitur backlog** (perlu konfirmasi prioritas sekolah): log audit, arsip peserta, ekspor PDF, 2FA admin, manajemen admin di UI, self check-in dengan verifikasi identitas yang lebih kuat, hari libur nasional di laporan.

---

## 12. Konvensi Kode

**Umum**

- Bahasa domain **Indonesia**: nama kolom/tabel (`nama`, `nis_nip`, `waktu_hadir`, `jam_datang_mulai`, `status_approval`, `tipe_izin`), pesan ke pengguna, komentar, dan commit message.
- Nama class/method mengikuti konvensi Inggris framework (`AttendanceController`, `validateGpsAndRadius`).
- Commit memakai Conventional Commits berbahasa Indonesia (`feat:`, `fix(face):`, `chore(ci):`, `docs:`, `deploy:`).
- Komentar menjelaskan **alasan** keputusan (mis. NAT WiFi sekolah, `proc_open` dimatikan Hostinger), bukan sekadar apa yang dilakukan.

**Backend (Laravel)**

- Format: Laravel Pint (dicek CI). PSR-4, `camelCase` untuk method, `snake_case` untuk kolom DB.
- Controller web merender Inertia (`Inertia::render('Folder/Page')`) dan memakai `back()->with('success'|'error')` untuk toast.
- Controller API ada di `Api/V1`, dengan respons JSON berbentuk `{status, message, data?}`:
  - `status` ∈ `success`, `error`, `already`, atau kode khusus seperti `face_mismatch`, `fake_gps_detected`, `app_update_required`;
  - HTTP 426 untuk "wajib update".
- Logika domain di `app/Services/` (berbasis instance, di-inject) dan `app/Support/` (helper statis kecil per konsep, mis. `DeviceLock`, `FaceMatcher`, `PrivateFile`). Aturan bisnis workcode ada di model `Workcode`.
- Validasi umumnya inline (`$request->validate` / `Validator::make`). FormRequest hanya untuk login dan profil.
- Semua konfigurasi domain di `config/attendance.php` dengan env var bernama jelas.
- File pribadi **wajib** lewat `PrivateFile` (disk `private`, URL bertanda tangan). Descriptor/jarak wajah **tidak boleh** dicatat ke log (ditegakkan CI).
- Scheduler memakai `Schedule::call(fn () => Artisan::call(...))`, bukan `Schedule::command` (keterbatasan hosting).
- Perubahan data dari Android menaikkan `WebSync`. Perubahan presensi memicu push FCM lewat `AttendanceObserver` (bisa dimatikan dengan `withoutStatePush`).
- Migrasi bertanggal berurutan, dengan `down()` yang lengkap. Migrasi data mengikuti urutan audit → backfill → constraint (`docs/architecture/PROJECT_DOCUMENTATION.md` §15).
- Test: PHPUnit Feature test per fitur (`tests/Feature/...Test.php`). Test API di `tests/Feature/Api/`, beberapa dinamai per fase (`PhaseCAuthTest`, `PhaseEAttendanceTest`, …).

**Frontend (React/Inertia)**

- Komponen fungsi + hooks, file `PascalCase.jsx`.
- Halaman di `Pages/<Fitur>/Index.jsx` / `Show.jsx`, komponen di `Components/`, utilitas di `lib/` dan `Utils/`.
- Route dipanggil dengan `route('nama.route')` (Ziggy). Styling memakai Tailwind utility class langsung di JSX, dengan warna dari token (`bg-surface`, `text-danger`, `text-accent`, …). Warna mentah hanya untuk area yang selalu terang/gelap.
- Komponen dasar diimpor dari `@/ui` (`Button`, `Dialog`, `ConfirmDialog`, `DataTable`, `StatusPill`, …). Animasi masuk tetap memakai AOS lewat komponen.
- Istilah UI: kategori `workcode` = **Acara**, `harian` = **Work From Office** (nilai di DB tidak berubah).
- Pembaruan langsung memakai polling (`backgroundReload.js`, `webSyncSignal.js`), bukan websocket.

**Android (Kotlin)**

- Paket per fitur: `feature/<fitur>/`, berisi `XxxScreen`, `XxxViewModel`, `XxxRepository`, `XxxModule` (Hilt), dan `XxxResult` / `DomainModel`. Komponen bersama ada di `core/`.
- UI Compose dengan state dari `StateFlow` (`collectAsStateWithLifecycle`). Navigasi berbasis string route di `AppNavigation.kt`.
- DTO `@Serializable` di `core/network/dto/*Dtos.kt`. Interface Retrofit di `core/network/api/*Api.kt`. Hasil operasi dibungkus sealed class `*Result` / `AttendanceOutcome`.
- Test unit memakai fake buatan sendiri (`FakeAuthApi`, `FakeSecureTokenStorage`, …) dan MockWebServer, bukan library mocking.
- Konfigurasi per lingkungan lewat product flavor + `BuildConfig`. Rahasia (signing, URL, API key Maps) dibaca dari `local.properties` / Gradle property, tidak ditulis di repo (key Maps lama masih ada di history Git).

---

## 13. Riwayat Perbaikan Bug

Ringkasan bug yang sudah diperbaiki, dengan test yang menjaganya. Rincian ada di commit masing-masing.

| No. | Tanggal | Masalah lama | Perbaikan | Test |
|---|---|---|---|---|
| 1 | 26 Okt | KPI dashboard menghitung baris presensi apa pun di semua tanggal, terhadap semua peserta | `AdminDashboardStats::presence()`: hanya `hadir`, hari ini (harian) atau sekali per kegiatan, di antara peserta yang berhak. Dipakai dashboard, scanner, `POST /scan` | `AdminDashboardStatsTest` |
| 2 | 26 Okt | Statistik halaman depan selalu 0 (prop salah nama) | Diperbaiki, lalu sejak 28 Okt halaman depan tidak lagi mengirim data kehadiran ke publik | — |
| 3 | 26 Okt | `attendance:calculate-alpha` mengabaikan pemilihan peserta dan libur nasional, N+1 query, crash unique key | `eligibleParticipants()`, `Holidays`, `isEffectivelyActive()`, satu query per workcode, cocok lewat `tanggal` | `CalculateAttendanceStatusTest` |
| 4 | 26 Okt | `workcode:auto-activate` tidak terjadwal, dan versi lamanya mematikan semua workcode lain | Terjadwal tiap menit; hanya menyentuh kegiatan terjadwal | `WorkcodeScheduleTest`, `ScheduleWithoutProcOpenTest` |
| 5 | 26 Okt | Libur nasional di-cache kosong 7 hari bila Google gagal | Salinan "terakhir yang valid", coba ulang tiap 1 jam | `HolidaysTest` |
| 6 | 26 Okt | Tombol "Excel" menghasilkan CSV | Ekspor `.xlsx` sungguhan, NIP sebagai teks | `AttendanceExportTest` |
| 7 | 26 Okt | Hari presensi ditentukan dari `created_at`, unique key dari `tanggal`; scanner bisa mencatat scan hari ini sebagai pulang di baris kemarin | Semua jalur presensi, status, kunci perangkat, rekap, dan riwayat API memakai `tanggal`; API riwayat mengirim `tanggal`; `jadwal_hari_ini` di riwayat harian diperbaiki | `AttendanceDateConsistencyTest`, `AttendanceUiStateTest`, Android `HistoryRepositoryTest` |
| 8 | 26 Okt | Persetujuan/penolakan izin tanpa transaksi | `DB::transaction` + `lockForUpdate`, push FCM setelah commit | `LeaveApprovalTest` |
| 9 | 26 Okt | Teks usang di config/menu/rencana | Diperbarui | — |
| 10 | 26 Okt | Android `local.properties.example` memakai kunci yang tidak dibaca | Contoh berisi kunci yang benar | — |
| 11 | 26 Okt | Value binder PhpSpreadsheet bocor dari impor peserta (test ekspor gagal acak) | `loadSpreadsheetAsStrings()` mengembalikan binder di `finally` | `AttendanceExportTest` |
| 12 | 2 Nov | Acara terjadwal yang diarsipkan tetap aktif saat jamnya tiba (scheduler menyalakan + push, presensi otomatis dibuat, scan diterima) | `isEffectivelyActive()` menolak arsip; `AutoActivateWorkcode` dan `SelfCheckInController::scheduledToday()` menyaring arsip; `syncAutoAttendance()` membekukan arsip | `WorkcodeArchiveTest` (terbukti gagal tanpa perbaikan) |
| 13 | 2 Nov | Pint gagal di 3 file pada HEAD, sehingga CI format kemungkinan merah | `vendor/bin/pint` (format saja) | CI `pint --test` |
| — | 26 Okt | `isAdmin()` juga true untuk email tetap yang bisa diubah peserta | Hanya `role === 'admin'` + migrasi menaikkan role akun seeder | `AdminRoleTest` |
| — | 2 Nov | Unduhan APK publik tanpa throttle | `throttle:30,1` per IP | `AppReleaseTest::test_download_is_rate_limited_per_ip` |
| — | 26 Okt | Android: dependency `security-crypto` alpha tak terpakai, duplikat `feature/attendance/Location*.kt` | Dihapus | — |
