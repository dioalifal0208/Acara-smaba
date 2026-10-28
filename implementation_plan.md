# Implementation Plan — Integrasi Presensi Wajah Web/Backend ↔ Android (FCM)

> Disusun 19 Okt 2026 dari audit kode backend (`acara-smaba`) dan aplikasi Android (`C:\Project\presensi_smaba_mobile`), serta data agregat DB lokal (`acara_smaba_local`).
> Data produksi **belum** dicek. Ulangi query agregat di produksi sebelum deploy.
> Rencana induk proyek (Fase 0–6) ada di [`docs/implementation/implementation_plan.md`](docs/implementation/implementation_plan.md). Dokumen ini mencakup integrasi wajah + real-time Android.

**Keputusan produk (final):**

- Aplikasi Android adalah **input presensi utama**. Presensi wajah web adalah jalur pendukung.
- Web dan Android memakai **satu model wajah** dan **satu aturan pencocokan**. Wajah yang didaftarkan di salah satu sisi berlaku di kedua sisi.
- Threshold disamakan ke tingkat ketat web: **jarak setelah L2 ≤ 0.45**, setara 0.58 jarak mentah lama. Nilai ini bisa diubah lewat `.env` setelah kalibrasi.
- Real-time memakai **FCM sebagai pemicu** dan endpoint state sebagai sumber kebenaran. Websocket/Reverb tidak dipakai.

---

## 1. Ringkasan Temuan

| # | Masalah | Bukti | Dampak |
|---|---|---|---|
| A1 | **Model wajah Android berbeda dari web.** Android: `assets/facenet.tflite` (FaceNet, 512-d). Web: face-api.js 0.22.2 (dlib ResNet-34, 128-d) | Semua 19 request nyata Android (28 Sep–2 Okt) membawa 512 angka. Di DB ada 1 vektor 128-d (norma 1.42) dan 1 vektor 512-d (norma 1.00) | Peserta yang daftar di web selalu mendapat `400 "Versi model wajah berbeda"`. Kalau dimensinya dipaksa 128, jaraknya tidak bermakna sehingga hasilnya "Wajah tidak cocok" |
| A2 | **Preprocessing Android salah**: piksel [-1,1], tanpa landmark/alignment, crop di-stretch dengan `createScaledBitmap` | `feature/attendance/FaceNetHelper.kt` | Descriptor tidak kompatibel walaupun modelnya sudah benar |
| A3 | **Presensi wajah dimatikan di Android** (perubahan belum di-commit): route `face_recognition` dihapus, `isFaceAttendanceAvailable = false`, `attendanceVerificationEvent` tidak di-collect | `DashboardViewModel.kt:56`, diff `AppNavigation.kt` | Tombol presensi selalu nonaktif. `submitAttendance()` tidak pernah dipanggil |
| A4 | **Izin lokasi tidak pernah diminta saat runtime** | grep: hanya ada permintaan izin CAMERA | Install baru tertahan di `ErrorLocationScreen` |
| A5 | **118 dari 120 peserta belum punya data wajah** (`face_status=none`) | Agregat DB lokal | `403 face_not_registered` sebelum pencocokan |
| A6 | **Server dilonggarkan untuk menutupi A1**: batas `size:128` dihapus. Persetujuan ganti foto menyalin descriptor ukuran apa pun (`max:512`) dan selalu menyetel `approved` | Komentar di `AttendanceController.php`, `Api/V1/PhotoController.php:67,196-201`, `PhotoChangeRequestController.php:26-30` | Data wajah rusak: peserta yang datanya menjadi 512-d tidak bisa lagi memakai scanner web |
| A7 | **Aturan pencocokan tidak konsisten**: web 0.58 tanpa L2 (`<`), Android 0.85 dengan L2 (`<=`), ±2× lebih longgar. Lockout gagal-wajah hanya ada di web | `config/attendance.php` (versi lama), `FaceRecognitionController.php:55-69` | Celah salah-terima di Android. Keamanan antar jalur tidak sama |
| A8 | **Bug Android lain**: | Audit Android | Pesan menyesatkan, scanner macet, risiko crash/ANR |
| | – sukses membaca `data.message` (server menaruh `message` di level atas) | | |
| | – `already` ditampilkan sebagai sukses | | |
| | – `isProcessingExtraction` tidak pernah direset dan tidak thread-safe | | |
| | – interpreter ditutup saat inferensi berjalan | | |
| | – model 94 MB dimuat di main thread | | |
| A9 | **Idempotency**: `request_hash` tidak menyertakan descriptor, dan respons gagal sementara di-cache permanen per key | `AttendanceController.php` (hash & `storeIdempotencyAndReturn`) | Retry dengan key yang sama memutar ulang kegagalan lama |
| A10 | **Tidak ada real-time per pengguna**: FCM hanya topic `workcode-updates`, prioritas normal | `FcmService.php` | Persetujuan wajah/izin/foto dan presensi dari web tidak sampai ke HP |
| A11 | Kredensial Firebase lokal belum diisi | `laravel.log`: "Unable to determine the Firebase Project ID" | Push tidak jalan di lokal |
| A12 | Scheduler `workcode:auto-activate` dihapus (commit `54ba606`), jadi jam buka/tutup jendela presensi tidak mengirim push | `routes/console.php`, `php artisan schedule:list` | HP tidak tahu saat jendela presensi berubah |
| A13 | Hanya 1 dari 105 user peserta yang punya `fcm_token` | Agregat DB lokal | Push per pengguna belum menjangkau siapa pun |
| A14 | Dashboard & Laporan admin tidak live | grep `backgroundReload` | Admin harus refresh manual |
| A15 | Paket paritas `docs/android/face-parity/` (model TFLite hasil konversi, fixtures, README) **belum di-commit** | `git status: ?? docs/android/` | Tim Android kemungkinan tidak pernah menerimanya |

Sudah diverifikasi dan bukan penyebab masalah:

- Model TFLite hasil konversi valid. SHA-256 cocok dengan `conversion_report.json`, `pass: true`, dan `FaceDescriptorParityTest` lulus.
- `installation_id` (UUID) dan `device_timestamp` (ISO-8601) yang dikirim Android sudah valid.
- Rotasi dan koordinat ML Kit sudah konsisten.

---

## 2. Arsitektur Target

### 2.1 Satu model, satu aturan

| Komponen | Spesifikasi |
|---|---|
| Model kanonik | face-api.js 0.22.2 `FaceRecognitionNet` (dlib ResNet-34), 128-d, id `faceapi-resnet34-128` |
| Web | Tetap face-api.js (`public/models/`) |
| Android | `face_landmark_68.tflite` (in `[1,112,112,3]`, out `[1,136]`) + `face_recognition.tflite` (in `[1,150,150,3]`, out `[1,128]`), float32, CPU |
| Pencocokan server (semua jalur) | L2-normalisasi input dan setiap sampel tersimpan, jarak Euclidean ke sampel 128-d terdekat, **cocok bila ≤ `FACE_THRESHOLD` (default 0.45)** |
| Lockout | Satu `FaceAttemptLimiter` untuk web dan Android: 5 gagal dalam 10 menit, kunci 15 menit (key `face-match-failures\|{id}`, `face-match-lock\|{id}`) |
| Data tersimpan | 1 vektor (legacy/admin) atau 3–10 sampel (pendaftaran terpandu, sebaran ≤ 0.55). Tanpa sampel 128-d berarti `face_reenroll_required` |

### 2.2 Alur real-time (FCM sebagai pemicu)

```
Perubahan data (admin/web/server)
   └─► DB commit
        └─► FcmService::sendStateChanged(user, reason)       ← per pengguna, token users.fcm_token
              data: {type:"state_changed", reason, v:"1"}     ← tanpa data pribadi
              android: priority=high, ttl=600s

Topic "workcode-updates" (sudah ada) → type "workcode_sync", dinaikkan ke priority=high

Android FirebaseMessagingService
   └─► SyncCoordinator (@Singleton, StateFlow)
        ├─ foreground : GET /api/v1/me/state (If-None-Match) segera (topic: jitter 0–15 dtk)
        └─ background : WorkManager expedited → GET /me/state
```

**Prinsip:**

- Payload FCM hanya pemicu. HP **selalu** mengambil ulang `/me/state`, jadi push yang hilang atau terlambat tidak merusak state.
- Cadangan bila push gagal:
  - refresh saat aplikasi ke foreground (`ProcessLifecycleOwner` ON_START);
  - polling adaptif di dashboard: 15 dtk saat jendela presensi buka atau wajah `pending`, selain itu 60 dtk;
  - alarm lokal pada jam buka/tutup `effective_schedule` (dikoreksi `server_time`), menggantikan A12.
- Dashboard admin: polling `backgroundReload` tiap ±20 dtk dengan jitter, hanya props presensi/statistik, berhenti saat tab tersembunyi.
- **Reverb/websocket tidak dipakai.** Produksi di Hostinger shared hosting tanpa daemon/queue worker. Pertimbangkan ulang hanya bila pindah ke VPS.

| `reason` | Pemicu (setelah commit) |
|---|---|
| `face` | `FaceRecognitionController` register / registerSelf / approveFace / rejectFace / deleteFace |
| `photo` | Approve/reject ganti foto (API `PhotoController` & web `PhotoChangeRequestController`); kirim juga `face` bila descriptor berubah |
| `leave` | `AdminLeaveController` approve/reject |
| `attendance` | Presensi dibuat/diubah di luar API Android (scanner web, self check-in, input manual admin) lewat `AttendanceObserver`. **Dilewati** saat console/cron alpha |
| `workcode_sync` (topic) | CRUD/aktivasi workcode (sudah ada) |

---

## 3. Kontrak API

### 3.1 `GET /api/v1/me/state` (baru; `auth:sanctum`, `throttle:api`, khusus peserta)

```json
{
  "status": "success",
  "data": {
    "server_time": "2026-10-19T07:00:00+07:00",
    "state_version": "<sha1 data tanpa server_time>",
    "workcode_aktif": { "...": "WorkcodeResource atau null" },
    "presensi_hari_ini": { "waktu_hadir": "ISO|null", "waktu_pulang": "ISO|null" },
    "attendance_ui": { "...": "sama persis dengan AttendanceValidationService::attendanceUi()" },
    "face": {
      "status": "none|pending|approved|rejected",
      "ready": true,
      "blocker": null,
      "model": "faceapi-resnet34-128",
      "sample_count": 5,
      "can_enroll": false,
      "locked": false,
      "retry_after_seconds": null
    }
  }
}
```

- Header `ETag: "<state_version>"`. Request dengan `If-None-Match` yang sama dijawab `304` tanpa body.
- ETag dihitung dari data milik pengguna itu sendiri, jadi tidak bocor antar-pengguna.
- `GET /api/v1/me` ikut menambahkan `participant.face` (objek yang sama). Perubahan ini bersifat aditif.

### 3.2 `POST /api/v1/me/face-enrollment` (baru)

Request:

```json
{ "descriptors": [[128 float], "... 3–10 sampel"], "photo": "data:image/jpeg;base64,...", "model": "faceapi-resnet34-128" }
```

| Kondisi | Respons |
|---|---|
| Valid (`FaceDescriptor::validateEnrollment(requireMultiple: true)`) | `201 success`. Disimpan dengan `face_status = pending`, lalu admin menyetujui di web |
| `model` ≠ `faceapi-resnet34-128` | `426 face_model_mismatch` |
| Wajah sudah `approved` & `ready` | `409 face_already_registered` |
| Data tidak valid / tidak konsisten | `422 invalid_face_data` |

### 3.3 `POST /api/v1/attendance` (diubah)

- `face_descriptor`: **tepat 128 angka**. Field opsional `face_model`.
- `request_hash` menyertakan `sha256(face_descriptor)`. Android membuat **UUID Idempotency-Key baru per pengambilan wajah** dan memakainya ulang hanya untuk retry jaringan dengan payload identik.
- Gagal sementara (jendela waktu, GPS, `face_mismatch`, `face_model_mismatch`) **tidak disimpan** di `api_idempotency_logs`, sehingga retry dievaluasi ulang. Hasil final (201, 200 success/already, 403 blocker) tetap disimpan.
- Insert idempotency yang bentrok (`UniqueConstraintViolationException`) ditangani dengan membaca ulang baris lalu memutar ulang responsnya, bukan 500.

### 3.4 Katalog status dan aksi Android

| `status` | HTTP | Arti | Aksi Android |
|---|---|---|---|
| `success` | 201/200 | Datang/pulang tercatat | Tampilkan `message` top-level, refetch state |
| `already` | 200 | Sudah presensi | Info (**bukan** sukses), refetch state |
| `face_mismatch` | 400 | Wajah tidak cocok | "Coba lagi" + saran pencahayaan, key baru |
| `face_locked` | 429 | Terkunci setelah gagal berulang | Hitung mundur `retry_after_seconds` |
| `face_not_registered` | 403 | Belum daftar wajah | Buka layar pendaftaran wajah |
| `face_pending` | 403 | Menunggu persetujuan admin | Info menunggu (push `face` akan datang) |
| `face_rejected` | 403 | Ditolak admin | Buka layar pendaftaran ulang |
| `face_reenroll_required` | 403 | Data wajah dari model lama (512-d) | Buka layar pendaftaran ulang |
| `face_model_mismatch` / `app_update_required` | 426 | Versi aplikasi/model tidak sesuai | Minta update aplikasi |
| `error` | 400/403 | Jendela waktu, GPS, radius, workcode | Tampilkan `message`, refetch state |
| (tanpa status) | 401 | Token kedaluwarsa | Hapus token, ke login |
| (tanpa status) | 429 | Throttle API | Hormati `Retry-After` |
| (tanpa status) | 5xx/timeout | Gangguan server/jaringan | Retry dengan key & body yang sama, backoff |

---

## 4. Rencana Kerja Backend (`acara-smaba`)

| # | Pekerjaan | File | Status |
|---|---|---|---|
| B1 | `FaceMatcher` (MODEL_ID, threshold, L2 kedua sisi, sampel terdekat, `<=`), dipakai web 1:1, scanner admin 1:N, self check-in, dan API | `app/Support/FaceMatcher.php` / `FaceDescriptor.php`, `FaceRecognitionController.php`, `Api/V1/AttendanceController.php` | Selesai |
| B2 | Config: satu `attendance.face.threshold` (`FACE_THRESHOLD`, 0.45); hapus `threshold_web/mobile` | `config/attendance.php`, `.env.example` | Selesai |
| B3 | `FaceAttemptLimiter` bersama web + API | `app/Support/FaceAttemptLimiter.php` | Selesai |
| B4 | `faceAttendanceBlocker()` menambah `face_reenroll_required`; `Participant::faceState()` | `app/Models/Participant.php` | Selesai |
| B5 | `GET /me/state` + ETag/304; `participant.face` di `/me` | `Api/V1/AttendanceStateController.php`, `UserResource.php`, `routes/api.php` | Selesai |
| B6 | `POST /me/face-enrollment` | `Api/V1/FaceEnrollmentController.php`, `routes/api.php` | Selesai |
| B7 | Validasi 128-d, `face_model`, status baru, lockout, hash idempotency menyertakan descriptor | `Api/V1/AttendanceController.php` | Selesai |
| B8 | Gagal sementara tidak di-cache; tangani duplikat key | `Api/V1/AttendanceController.php` | Selesai |
| B9 | Ganti foto: descriptor harus valid 128-d; `approved` hanya bila ada sampel kompatibel | `Api/V1/PhotoController.php`, `PhotoChangeRequestController.php` | Selesai |
| B10 | `FcmService::sendStateChanged()` (high, ttl 600s, after-commit, no-op saat test, hapus token invalid); topic ke priority high | `app/Services/FcmService.php` | Selesai |
| B11 | Hook push `face/photo/leave` + `AttendanceObserver` (lewati console) | Controller terkait, `app/Observers/AttendanceObserver.php`, `AppServiceProvider.php` | Selesai |
| B12 | Polling live Dashboard & Laporan admin | `resources/js/Pages/Dashboard.jsx`, halaman laporan, `resources/js/lib/backgroundReload.js` | Selesai |
| B13 | Perintah daftar peserta yang perlu daftar ulang (id, nama, dimensi, jumlah sampel; tanpa vektor) | Perluas `face:update-descriptor --list` | Selesai |
| B14 | Flag transisi `FACE_ENFORCE_DIMENSIONS` (default `true`) untuk koordinasi rilis | `config/attendance.php`, `AttendanceController.php` | Selesai |
| B15 | Dokumentasi: kontrak, katalog status, aturan terpadu | `docs/api/API_CONTRACT.md`, `docs/api/FACE_DESCRIPTOR_COMPATIBILITY.md` | Selesai |
| B16 | Test: `AttendanceStateTest`, `FaceEnrollmentApiTest`, `FaceAttemptLimiterTest`, `UnifiedFaceMatchTest`, `AttendanceStatePushTest`, update `FaceDescriptorParityTest` | `tests/Feature/Api/` | Selesai |

**Batasan:**

- Jangan menyentuh fitur kunci perangkat (`DeviceLock`, `DeviceController`, `DeviceChangeRequestController`) dan bel notifikasi admin (`AdminNotifications`, `AdminNotificationBell`). Keduanya **ditahan**.
- Descriptor, foto, dan token tidak boleh masuk log.

---

## 5. Rencana Kerja Android (`presensi_smaba_mobile`)

| # | Pekerjaan | File | Status |
|---|---|---|---|
| D1 | Hapus `facenet.tflite` (94 MB). Salin `face_landmark_68.tflite` + `face_recognition.tflite` (±24 MB) ke `assets/face/`, cek SHA-256 dengan `conversion_report.json`. `noCompress "tflite"` | `app/src/main/assets/`, `app/build.gradle.kts` | Selesai |
| D2 | Pipeline face-api.js di `core/face/` (rincian di bawah tabel) | `core/face/**` | Selesai |
| D3 | `FaceRecognitionScreen` baru (rincian di bawah tabel) | `feature/attendance/FaceRecognitionScreen.kt`, `FaceCaptureModels.kt` | Selesai |
| D4 | **Pulihkan route kamera.** Ganti kill switch `isFaceAttendanceAvailable=false` dengan `face.ready` dari `/me/state`. Collect `attendanceVerificationEvent`. Descriptor dikirim lewat channel singkat (bukan nav args/SavedState) | `AppNavigation.kt`, `DashboardViewModel.kt`, `DashboardScreen.kt` | Selesai |
| D5 | **Minta izin lokasi saat runtime** (FINE+COARSE, tolak permanen diarahkan ke Settings). `POST_NOTIFICATIONS` di API 33+ | `DashboardScreen.kt`, `AndroidManifest.xml` | Selesai |
| D6 | DTO: `MeStateDto`, `FaceEnrollmentRequest`, `AttendanceSubmitResponse` (`message` top-level, `already` ≠ sukses). `AttendanceRequest.faceDescriptor` 128 float + `face_model` | `core/network/dto/*`, `core/network/api/*` | Selesai |
| D7 | `ApiErrorParser` → `AttendanceOutcome` sesuai katalog §3.4 | `feature/attendance/*` | Selesai |
| D8 | Idempotency-Key: UUID baru per pengambilan wajah, stabil untuk retry jaringan, tepat satu header | `IdempotencyKeyInterceptor.kt`, `AttendanceApi.kt`, ViewModel | Selesai |
| D9 | Layar pendaftaran wajah (CTA dari dashboard & profil), status "menunggu admin" | `FaceEnrollmentViewModel`, route baru | Selesai |
| D10 | `AttendanceStateRepository` (StateFlow + ETag/304) sebagai sumber state dashboard | `feature/dashboard/*` | Selesai |
| D11 | Sinkronisasi real-time (rincian di bawah tabel) | `feature/dashboard/*`, `PresensiApp.kt` | Selesai |
| D12 | Logging HTTP: BODY hanya di debug, redaksi `Authorization`, tanpa body attendance/enrollment | `NetworkModule.kt` | Selesai |
| D13 | Test JVM: ImageOps/alignment vs `fixtures.json`, ApiErrorParser, 304, SyncCoordinator, idempotency. Test instrumented paritas model di perangkat | `app/src/test/**`, `app/src/androidTest/**` | JVM selesai; instrumented **belum dijalankan** (butuh HP) |

**D2 – pipeline face-api.js (`core/face/`):**

- Interpreter memuat model dari assets dengan memory-map, CPU, tanpa GPU/NNAPI.
- Kotak deteksi ML Kit dipotong pada batas gambar → pad nol ke persegi (di tengah; pad akhir `round(d/2)`) → bilinear 112 (`alignCorners=false`, tanpa half-pixel) → 68 landmark.
- Crop dlib, tanpa rotasi:
  - `size = floor(((|M−L|+|M−R|)/2)/0.45)`
  - `x = floor(max(0, c.x − 0.5·size))`
  - `y = floor(max(0, c.y − 0.43·size))`
- Pad nol ke persegi → bilinear 150 → RGB float 0–255 → 128 float mentah.

**D3 – `FaceRecognitionScreen` baru:**

- Kamera depan. Frame diputar tegak sesuai `rotationDegrees` dan **tidak di-mirror** (preview boleh tercermin).
- Quality gate sebelum ekstraksi: satu wajah, posisi di tengah, cukup besar, |yaw|/|roll| ≤ 12°, mata terbuka, stabil ±3 frame.
- Inferensi di thread latar dengan `AtomicBoolean`. Interpreter tidak ditutup saat inferensi berjalan.
- Mode presensi: 1 descriptor. Mode pendaftaran: 5 sampel (jarak ≥ 300 ms, sebaran ≤ 0.55) + JPEG (q85, sisi maks 640).

**D11 – sinkronisasi real-time:**

- `SyncCoordinator` (`@Singleton`) menggantikan `WorkcodeUpdateSignal`. `onMessageReceived` mem-parse `type/reason`, lalu refresh di foreground atau lewat WorkManager expedited di background.
- Refresh pada ON_START.
- Polling adaptif 15/60 dtk.
- Alarm di jam `effective_schedule`.
- `WorkcodeRefreshWorker` dihapus atau dialihfungsikan.
- Daftarkan token FCM setelah login dan di `onNewToken`; unregister saat logout.

**Catatan:**

- `AndroidManifest.xml` punya perubahan `API_KEY` Maps yang belum di-commit. Pastikan itu disengaja dan kunci dibatasi (package + SHA-1) di Google Cloud Console.
- Konversi desktop lulus paritas, tetapi itu **belum membuktikan** paritas di Android. Test instrumented D13 wajib lulus di HP target (Realme) dengan konfigurasi delegate yang akan dirilis.

---

## 6. Operasional, Data, dan Urutan Rilis

1. **Firebase.** Isi kredensial Firebase (`FIREBASE_CREDENTIALS`/project id) di `.env` lokal dan produksi. Uji satu push `state_changed` ke HP uji.
2. **Audit data produksi** (agregat saja, tanpa vektor). Hitung:
   - peserta per `face_status`;
   - dimensi descriptor (128 vs 512 vs lain);
   - jumlah `fcm_token`;
   - nilai `FACE_THRESHOLD*` di `.env`.
3. **Rilis server dan aplikasi secara terkoordinasi.**
   - Validasi 128-d akan menolak APK lama (512-d). Pilihannya: (a) rilis APK baru dan server di hari yang sama, atau (b) deploy server dengan `FACE_ENFORCE_DIMENSIONS=false` lalu nyalakan setelah APK baru tersebar.
   - Sebelum mengaktifkan presensi wajah, uji paritas di HP target harus lulus.
4. **Pendaftaran wajah.**
   - Peserta mendaftar lewat Android (atau web) → admin menyetujui → push `face` → tombol presensi aktif otomatis.
   - Peserta dengan data 512-d otomatis mendapat `face_reenroll_required` dan harus mendaftar ulang.
5. **Jadwal.** Periksa jendela presensi workcode. Di data lokal, jendela datang hari Senin hanya 06:00–07:00, dan 10 dari 19 percobaan Android gagal karena jendela waktu.
6. **Kalibrasi threshold.** Setelah ada pasangan wajah nyata (relawan dengan persetujuan tertulis, bukan foto peserta), evaluasi FAR/FRR. Ubah `FACE_THRESHOLD` hanya berdasarkan data tersebut.
7. **Commit terpisah dari fitur yang ditahan:**
   - `docs/android/face-parity/` + `FACE_DESCRIPTOR_COMPATIBILITY.md`
   - perubahan wajah/real-time backend
   - perubahan Android

   Jangan ikut-commit fitur kunci perangkat dan bel notifikasi admin.

---

## 6a. Status Verifikasi (19 Okt 2026)

| Pemeriksaan | Hasil |
|---|---|
| `php artisan test` (backend) | **211 passed** (1457 assertions) |
| `vendor/bin/pint --test` (file yang diubah tahap ini) | Lolos |
| `npm run build` | Sukses (hanya peringatan ukuran chunk yang sudah ada) |
| Android `compileDevDebugKotlin`, `testDevDebugUnitTest`, `assembleDevDebug`, `compileDevDebugAndroidTestKotlin` | **BUILD SUCCESSFUL**, **116 unit test lulus** |
| SHA-256 model TFLite di `assets/face/` vs `conversion_report.json` | Cocok |
| Test paritas instrumented di perangkat (`FaceParityInstrumentedTest`) | **Lulus** di Realme 6 Pro (RMX2061, Android 11, arm64) dengan konfigurasi produksi (CPU, 1 thread, tanpa XNNPACK) |
| Uji end-to-end di HP nyata + push FCM | **Presensi pulang wajah lulus** (19 Okt 15:01, Realme, backend lokal). Rincian di §6b. Pendaftaran wajah via Android → persetujuan admin → push `face` **belum diuji** |

Penyelesaian tahap ini:

- **Test baru `UnifiedFaceMatchTest`:**
  - batas web = batas Android;
  - wajah yang didaftarkan di Android dipakai di web;
  - kegagalan sementara dievaluasi ulang dengan key yang sama.
- **`face:update-descriptor`:**
  - hanya menerima 128-D;
  - tidak menampilkan isi vector;
  - `--list` menghitung sampel/dimensi dengan benar;
  - opsi baru `--reenroll`;
  - mengirim push `face`.
- **Polling live ±20 detik di Dashboard & Laporan admin.** Di Laporan, polling berhenti saat modal terbuka.
- **Android `SyncCoordinator`:**
  - jitter 0–15 detik untuk pesan topic;
  - menerima `reason=workcode` (selaras `FcmService::STATE_REASONS`).
- **Dokumentasi diperbarui:** `API_CONTRACT.md` (§2 katalog status, §2a `/me/state`, §2b pendaftaran wajah, §7 FCM), `FACE_DESCRIPTOR_COMPATIBILITY.md`, `docs/android/face-parity/README.md` §5.

Catatan:

- **Data lokal:** peserta yang sebelumnya 512-d kini memiliki 3 sampel 128-D, sehingga `face:update-descriptor --list --reenroll` lokal kosong.
- **Ukuran APK:** APK debug 106 MB karena memuat native lib 4 ABI dan dex tanpa minify. Rilis lewat AAB dipecah per ABI oleh Play Store.
- **Idempotency:** blocker `face_pending` ikut di-cache per key. Karena Android memakai key baru per pengambilan wajah, ini tidak berdampak.

## 6b. Uji End-to-End di HP (19 Okt 2026)

Perangkat Realme 6 Pro (RMX2061, Android 11), build `deviceDevDebug` → backend lokal `192.168.134.106:8000`, akun peserta uji (wajah `approved`, 3 sampel 128-D), workcode "Tes Workcode Harian (Office)".

| Waktu | Kejadian | Bukti |
|---|---|---|
| 12:08:56 | Presensi datang via wajah | `attendances.waktu_hadir`, `attendance_method = wajah` |
| 15:01:32 | Admin mengubah jam pulang di web → push topic `workcode_sync` | `laravel.log`: "FCM workcode update sent" |
| 15:01:36 | HP memuat ulang `/me/state` (200) → tombol "Absen Pulang" muncul **tanpa membuka ulang aplikasi** | Logcat `GET 200`, laporan pengguna |
| 15:01:52–56 | Pemuatan ulang berikutnya tanpa perubahan | `GET 304` (ETag bekerja) |
| 15:01:56 | Submit wajah | Logcat `POST 200` |
| 15:01:58 | Server mencatat pulang | `api_idempotency_logs` id 22: 200 `success` "Presensi pulang berhasil dicatat."; `waktu_pulang` terisi, 1 record (tidak ganda) |
| 15:01:57 | Status disegarkan setelah submit | Logcat `GET 200`; riwayat aplikasi menampilkan pulang |

Log aplikasi: tidak ada crash/error aplikasi. Hanya peringatan bawaan ML Kit (Flogger) dan properti kamera vendor Realme. Tidak ada descriptor, token, atau body request di Logcat.

Belum diuji di HP:

- pendaftaran wajah lewat Android → persetujuan admin → push `face`;
- presensi datang di jendela yang terbuka;
- `face_mismatch`/`face_locked` dengan wajah orang lain;
- izin lokasi pada install baru;
- push saat aplikasi di latar belakang/tertutup;
- dashboard admin yang terbarui otomatis.

## 7. Definition of Done

**Backend dan test:**

- [x] `php artisan test` hijau, termasuk test baru §4 B16. `npm run build` sukses.
- [x] Descriptor yang sama diterima oleh web `/api/face/match` (self) **dan** Android `/api/v1/attendance` dengan aturan yang sama (L2, ≤ 0.45). Dikunci oleh `UnifiedFaceMatchTest`.
  > **Catatan 26 Okt 2026:** presensi wajah web (`/api/face/match`) sudah dihapus. Presensi wajah kini hanya lewat Android (`POST /api/v1/attendance`). Pendaftaran wajah di web tetap ada.
- [x] 5 kali gagal di jalur mana pun mengunci kedua jalur (`face_locked`). Dikunci oleh `FaceAttemptLimiterTest`.
- [x] Data 512-d menghasilkan `face_reenroll_required`. Diuji di jalur Android; web memakai `faceAttendanceBlocker()` yang sama.
- [x] Idempotency: key sama dengan descriptor berbeda → 409. Gagal sementara dievaluasi ulang.

**Build dan paritas Android:**

- [x] Android: `compileDevDebugKotlin`, `testDevDebugUnitTest`, `assembleDevDebug` sukses. Tidak ada referensi `FaceNetHelper`/`facenet.tflite`.
- [x] Test paritas instrumented lulus di HP target (Realme RMX2061) dengan toleransi:
  - elemen ≤ 1e-3;
  - L2 ≤ 5e-3;
  - landmark ≤ 0.5 px;
  - `aligned_rect` identik;
  - pipeline ≤ 1e-2.

**End-to-end di HP nyata:**

- [ ] Daftar wajah di Android → admin menyetujui di web → HP menerima push → tombol aktif tanpa membuka ulang aplikasi.
- [ ] Presensi datang/pulang via Android tercatat dan muncul di dashboard admin ≤ ±20 dtk. *(Pulang via Android tercatat dan muncul di riwayat aplikasi; tampil otomatis di dashboard admin belum dicek.)*
- [ ] Wajah yang didaftarkan di web bisa dipakai presensi di Android, dan sebaliknya.
- [ ] Install baru meminta izin lokasi dan kamera dan bisa presensi tanpa langkah manual lain.

**Privasi:**

- [ ] Tidak ada descriptor, foto, atau token di Logcat, `laravel.log`, payload FCM, atau ETag. *(Sesi uji 19 Okt: Logcat aplikasi & `laravel.log` bersih — hanya metode + status HTTP; payload FCM & ETag sesuai desain. Ulangi di build rilis.)*
