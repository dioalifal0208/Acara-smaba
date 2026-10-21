# Kontrak API Presensi (Web & Android)

Dokumen ini mendeskripsikan spesifikasi endpoint API untuk modul presensi pada sistem Acara SMABA, memastikan Android (Mobile) dan Web Scanner menggunakan aturan presensi (logic validation) yang tersentralisasi via `AttendanceValidationService`.

---

## Masa Berlaku Token (sejak Okt 2026)

Token dari `POST /api/v1/auth/login` **kedaluwarsa setelah 30 hari**. Setiap respons `401 Unauthenticated` berarti token habis atau dicabut: hapus token tersimpan dan arahkan pengguna ke layar login. Satu akun menyimpan maksimal **5 token** (5 perangkat/login terakhir); login ke-6 otomatis mencabut token terlama.

---

## Login dan Kunci Perangkat (sejak Okt 2026)

Akun **peserta** terkunci ke HP Android pertama yang dipakai login. Login dari HP lain ditolak sampai admin menyetujui pengajuan pindah perangkat (panel web → **Perangkat**). Akun admin tidak dikunci. Presensi lewat browser web tidak terkena kunci ini.

**ID perangkat** = `Settings.Secure.ANDROID_ID` (tetap sama saat aplikasi diinstal ulang, berubah setelah reset pabrik). **Jangan memakai IMEI**: sejak Android 10 aplikasi biasa tidak bisa membacanya. Server hanya menyimpan HMAC-nya.

### Login
**URL**: `POST /api/v1/auth/login` (maks. 5 percobaan/menit per akun + IP)
```json
{
  "login": "username atau email",
  "password": "rahasia",
  "device_name": "Android App",
  "device_id": "a1b2c3d4e5f60718",
  "device_model": "Samsung Galaxy A12"
}
```
- `device_id`: ANDROID_ID, 8–128 karakter `[A-Za-z0-9._:-]`. `device_model`: opsional, untuk ditampilkan ke admin (`Build.MANUFACTURER + Build.MODEL`).
- Login pertama dengan `device_id` mengunci akun ke HP itu dan mencabut semua token lama.

| Status | `code` | Arti dan tindakan aplikasi |
|---|---|---|
| 200 | — | `data.token` seperti biasa |
| 401 | — | Username/password salah (pesan generik, tanpa info perangkat) |
| 403 | `device_not_registered` | Akun terkunci ke HP lain (`data.registered_device_model`). Tampilkan formulir pengajuan pindah perangkat. Bila `data.device_change_request.status = "rejected"`, tampilkan `rejection_reason`. |
| 403 | `device_change_pending` | Pengajuan untuk HP ini sedang menunggu admin. Tampilkan status menunggu; coba login lagi nanti. |
| 403 | `device_in_use` | HP ini sudah terkunci untuk akun peserta lain (satu HP satu akun; pemiliknya akun yang paling dulu terikat). Tidak ada pengajuan pindah perangkat; tampilkan `message`. Juga dikembalikan oleh `POST auth/device-change-requests`. |
| 426 | `app_update_required` | Aplikasi tidak mengirim `device_id` dan server sudah mewajibkannya (`DEVICE_LOCK_REQUIRE_ID=true`). |

Contoh 403:
```json
{
  "status": "error",
  "code": "device_change_pending",
  "message": "Pengajuan pindah perangkat Anda sedang menunggu persetujuan admin.",
  "data": {
    "registered_device_model": "Samsung Galaxy A12",
    "device_change_request": {
      "id": 7, "status": "pending", "device_model": "Xiaomi Redmi 13", "reason": "HP lama rusak",
      "rejection_reason": null, "created_at": "2026-10-16T08:00:00+07:00", "reviewed_at": null
    }
  }
}
```

**Masa transisi:** selama `DEVICE_LOCK_REQUIRE_ID=false` (bawaan), aplikasi versi lama yang tidak mengirim `device_id` tetap bisa login tanpa dikunci. Setelah semua peserta memakai versi baru, admin server mengubahnya ke `true`.

### Pengajuan Pindah Perangkat
**URL**: `POST /api/v1/auth/device-change-requests` (tanpa token, diverifikasi dengan password; batas sama dengan login)
```json
{
  "login": "username atau email",
  "password": "rahasia",
  "device_id": "ffee112233445566",
  "device_model": "Xiaomi Redmi 13",
  "reason": "HP lama rusak"
}
```
- `reason` wajib, 5–500 karakter. Tidak ada batas jumlah pengajuan; pengajuan baru **menggantikan** yang masih menunggu.
- **201** pengajuan baru dibuat / **200** pengajuan menunggu diperbarui → `data.device_change_request`.
- **401** kredensial salah. **409** `device_already_allowed`: HP ini sudah bisa dipakai, langsung login. **422** `device_lock_not_applicable`: akun admin.

Setelah admin **menyetujui**, HP lama langsung keluar (semua tokennya dicabut, respons berikutnya 401) dan login di HP baru berhasil. Admin juga bisa **reset kunci** (HP hilang): akun keluar dari semua perangkat dan HP berikutnya yang login otomatis terdaftar. HP lama menerima push FCM `{"type":"session_revoked","reason":"device_changed|device_reset","v":"1"}` (token FCM diambil sebelum kunci dipindah) sehingga aplikasi langsung keluar dengan pesan yang jelas. HP baru belum punya token FCM, jadi selama pengajuan menunggu aplikasi mencoba login ulang otomatis tiap 30 detik (kredensial hanya di memori selama layar login terbuka). Halaman admin **Perangkat** memuat ulang datanya tiap ±15 detik.

---

## Header Idempotency-Key

Header `Idempotency-Key` **wajib** dikirim pada setiap **request tulis (POST)** berikut:

| Endpoint | Tujuan |
|---|---|
| `POST /api/v1/attendance` | Presensi face recognition |
| `POST /api/v1/leave-requests` | Pengajuan izin |
| `POST /api/v1/attendances/leave` | Pengajuan izin (alias) |
| `POST /api/v1/me/photo-change-requests` | Ganti foto wajah |

**Format**: UUID v4 (contoh: `550e8400-e29b-41d4-a716-446655440000`)

**Aturan**:
- Jika key belum pernah digunakan → proses normal, simpan log.
- Jika key sudah digunakan **dengan payload sama** → replay response awal (idempotent retry).
- Jika key sudah digunakan **dengan payload berbeda** → **409 Conflict**.
- Jika key hilang atau bukan UUID → **400 Bad Request**.

Endpoint **yang TIDAK memerlukan** Idempotency-Key:
- Semua `GET` (read-only)
- `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`
- `POST /api/v1/fcm/register`, `DELETE /api/v1/fcm/unregister`
- `POST /scan` (Web Admin Scanner, dilindungi CSRF)

---

## 1. Get Active Workcode

Digunakan oleh aplikasi Mobile (Android) untuk mengecek Workcode mana yang saat ini aktif, sekaligus mendapatkan status presensi user pada hari ini untuk workcode tersebut.

**URL**: `GET /api/v1/workcodes/active`
**Headers**:
- `Authorization: Bearer <token>`
- `Accept: application/json`

**Response Success (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "workcode_aktif": {
      "id": 1,
      "nama_workcode": "Acara Pagi",
      "kategori": "workcode",
      "tanggal": "2026-10-02",
      "jam_aktif_mulai": "07:00:00",
      "jam_aktif_selesai": "10:00:00",
      "latitude": -6.1234,
      "longitude": 106.1234,
      "radius_meters": 150,
      "jadwal_per_hari": []
    },
    "presensi_hari_ini": {
       "waktu_hadir": "2026-10-02T08:00:00.000000Z",
       "waktu_pulang": null
    },
    "attendance_ui": {
      "action": "arrival",
      "action_label": "Absen Datang",
      "reason": "arrival_open",
      "message": null,
      "is_late": false,
      "late_minutes": 0,
      "server_time": "2026-10-02T07:15:00+07:00",
      "effective_schedule": {
        "arrival":   { "start": "2026-10-02T07:00:00+07:00", "end": "2026-10-02T10:00:00+07:00", "closes_at": "2026-10-02T10:00:00+07:00", "display": "07:00–10:00" },
        "departure": { "start": null, "end": null, "closes_at": null, "display": null }
      }
    }
  }
}
```

**Response (200 OK) - Tidak ada workcode aktif / tidak ditugaskan**: `"data": null` (tidak berubah), ditambah `attendance_ui` di **level atas**:
```json
{
  "status": "success",
  "data": null,
  "attendance_ui": {
    "action": "none", "action_label": null, "reason": "no_active_workcode",
    "message": "Belum ada workcode yang aktif.",
    "server_time": "2026-10-02T07:15:00+07:00", "effective_schedule": null
  }
}
```

### `attendance_ui` (sejak Okt 2026, aditif)

Status tombol presensi **diputuskan server** dari waktu server, assignment workcode, dan catatan presensi — aturannya sama dengan `POST /api/v1/attendance`. Android hanya menampilkan tombol sesuai `action`; tidak boleh menghitung jadwal atau memilih datang/pulang sendiri. `POST /attendance` tetap memvalidasi ulang semuanya (jadwal, GPS, perangkat, wajah, idempotensi), jadi tombol yang tampil bukan jaminan presensi diterima.

Lokasi: `data.attendance_ui` bila ada workcode; `attendance_ui` level atas bila `data` null.

| Field | Isi |
|---|---|
| `action` | `arrival` (belum datang & dalam jendela datang), `departure` (sudah datang, belum pulang & dalam jendela pulang, hanya workcode `harian`), `none` (selain itu) |
| `action_label` | `Absen Datang` / `Absen Pulang` / `null` |
| `reason` | Kode mesin: `arrival_open`, `departure_open`, `arrival_not_open`, `arrival_closed`, `departure_not_open`, `departure_closed`, `completed`, `no_active_workcode`, `not_assigned`. Klien wajib menganggap nilai tak dikenal sebagai `none`. |
| `message` | Pesan siap tampil saat `action=none`; saat datang dalam masa toleransi berisi peringatan terlambat (mis. `Anda terlambat 25 menit. Presensi datang ditutup pukul 08:00 WIB.`); selain itu `null` |
| `is_late` / `late_minutes` | `true` + menit keterlambatan bila tombol datang terbuka dalam masa toleransi terlambat; selain itu `false` / `0` |
| `server_time` | Waktu server saat respons dibuat, ISO-8601 dengan offset zona aplikasi (`+07:00`) |
| `effective_schedule.arrival/departure` | Jendela yang berlaku **hari ini** (sudah memperhitungkan `jadwal_per_hari`), `start`/`end` ISO-8601 + `display` `HH:mm–HH:mm`; semua `null` bila jendela tidak diatur (mis. departure workcode kegiatan). `end` = jam selesai resmi (batas terlambat); `closes_at` = kapan presensi benar-benar ditutup |

**Toleransi terlambat (workcode `harian`, hanya presensi datang):** presensi datang tetap dibuka sampai `jam_datang_selesai` + `late_tolerance_minutes` (bawaan 60 menit, `ATTENDANCE_LATE_TOLERANCE_MINUTES`), paling lambat 23:59:59 hari itu. Presensi di antara `end` dan `closes_at` diterima dengan `reason=arrival_open` dan tercatat `hadir` tetapi terlambat. Presensi pulang dan workcode kegiatan tidak memiliki toleransi (`closes_at` = `end`).

Catatan: `presensi_hari_ini.waktu_hadir/waktu_pulang` tetap format lama (UTC, `Z`); field baru memakai offset `+07:00`. Keduanya instan waktu yang sama — parse sebagai ISO-8601, jangan sebagai string lokal.

**Response Error (401)**: Token invalid atau tidak ada.
**Response Error (403)**: User bukan `participant`.

---

## 2. Submit Attendance (Android Mobile API)

Digunakan oleh peserta untuk melakukan presensi dari aplikasi Android. Dikawal `Idempotency-Key` untuk menghindari duplikat pada jaringan buruk.

**URL**: `POST /api/v1/attendance`
**Headers**:
- `Authorization: Bearer <token>`
- `Accept: application/json`
- `Content-Type: application/json`
- `Idempotency-Key: <UUID>` *(Wajib)*

**Request Body**:
```json
{
  "latitude": -6.1234,
  "longitude": 106.1234,
  "accuracy": 10.5,
  "device_timestamp": "2026-10-02T08:00:00+07:00",
  "installation_id": "7f0c2a52-9d1e-4a39-8c1e-2b8f6d3a9e10",
  "face_descriptor": [0.0123, -0.0456, "... tepat 128 angka ..."],
  "face_model": "faceapi-resnet34-128",
  "face_capture": "data:image/jpeg;base64,/9j/4AAQ..."
}
```

> **`face_capture`** (opsional, sejak Okt 2026, aditif): foto wajah hasil scan berupa data URL **JPEG** base64 (`data:image/jpeg;base64,...`, maks ±1,5 MB string; disarankan lebar ≤ 480 px, kualitas 0,8). Disimpan di disk privat sebagai bukti presensi **datang** maupun **pulang** dan ditampilkan admin di Laporan → Detail → Log. Hanya disimpan bila presensi berhasil. Format selain JPEG → 422. Aplikasi lama tanpa field ini tetap diterima. Field ini ikut masuk hash idempotensi, jadi retry jaringan harus mengirim foto yang sama persis.

> **`face_descriptor`** wajib: **tepat 128 angka** dari model `faceapi-resnet34-128` (face-api.js web / TFLite Android, lihat `docs/api/FACE_DESCRIPTOR_COMPATIBILITY.md`). Kirim nilai mentah tanpa pembulatan (≥ 6 desimal); normalisasi L2 dilakukan server. `installation_id` harus UUID. `face_model` opsional, tetapi bila dikirim harus `faceapi-resnet34-128`.
>
> **Idempotency**: buat UUID `Idempotency-Key` **baru untuk setiap pengambilan wajah**; pakai ulang hanya untuk retry jaringan dengan body identik. Hash permintaan memuat sidik `face_descriptor`, jadi key sama + tangkapan berbeda = 409. Hanya hasil final yang diputar ulang (201/200 dan blocker 403 `face_*`); kegagalan sementara (jendela waktu, GPS, `face_mismatch`, `face_locked`, workcode) **tidak** disimpan, sehingga retry dievaluasi ulang.

**Response Success (201 Created) - Datang**:
```json
{
  "status": "success",
  "message": "Presensi datang berhasil dicatat.",
  "data": {
    "attendance": {
      "id": 100,
      "status": "hadir",
      "checked_in_at": "2026-10-02T08:00:00+07:00",
      "is_late": false,
      "late_minutes": 0,
      "workcode": {
         "id": 1,
         "nama_workcode": "Acara Pagi"
      }
    }
  }
}
```
Bila datang dalam masa toleransi: `is_late: true`, `late_minutes` > 0, dan `message` menjadi `Presensi datang berhasil dicatat, tetapi terlambat 25 menit.`

**Response Success (200 OK) - Pulang**:
```json
{
  "status": "success",
  "message": "Presensi pulang berhasil dicatat.",
  "data": {
    "attendance": {
      "id": 100,
      "status": "hadir",
      "checked_in_at": "2026-10-02T08:00:00+07:00",
      "checked_out_at": "2026-10-02T15:00:00+07:00",
      "workcode": {
         "id": 1,
         "nama_workcode": "Acara Pagi"
      }
    }
  }
}
```

**Response Info (200 OK) - Sudah Presensi**:
```json
{
    "status": "already",
    "message": "Anda sudah melakukan presensi untuk workcode ini."
}
```

**Response Error (403) - Wajah belum boleh dipakai presensi**:

Presensi wajah hanya untuk peserta yang data wajahnya **sudah disetujui admin**. Begitu admin menyetujui, presensi langsung bisa dilakukan tanpa perubahan di aplikasi. Tampilkan `message` apa adanya ke pengguna dan arahkan ke pendaftaran wajah bila perlu.

| `status` | Arti |
|---|---|
| `face_not_registered` | Belum pernah mendaftarkan wajah |
| `face_pending` | Sudah mendaftar, menunggu persetujuan admin |
| `face_rejected` | Pendaftaran ditolak admin, harus daftar ulang |
| `face_reenroll_required` | Data wajah tersimpan dari model lama (mis. 512-d FaceNet Android lama), tidak kompatibel; harus daftar ulang |

```json
{
    "status": "face_pending",
    "message": "Data wajah Anda sudah didaftarkan dan masih menunggu persetujuan admin. Presensi wajah aktif otomatis setelah disetujui."
}
```

> Data wajah tersimpan bisa berupa beberapa vector (beberapa sampel wajah depan). Server memakai **satu aturan pencocokan** (presensi wajah hanya lewat aplikasi Android): normalisasi L2 kedua sisi, jarak Euclidean ke sampel 128-d terdekat, cocok bila jarak ≤ `FACE_THRESHOLD` (default 0.45). Aplikasi cukup mengirim **satu** vector. Jarak kemiripan tidak pernah dikirim ke klien.

**Katalog status & aksi Android**:

| `status` | HTTP | Arti | Aksi Android |
|---|---|---|---|
| `success` | 201 / 200 | Presensi datang (201) / pulang (200) tercatat | Tampilkan `message` (level atas), muat ulang `/me/state` |
| `already` | 200 | Sudah presensi | Info, **bukan** sukses; muat ulang `/me/state` |
| `face_mismatch` | 400 | Wajah tidak cocok (dihitung ke kunci gagal) | "Coba lagi" dengan tangkapan & key baru |
| `face_locked` | 429 | Terkunci setelah 5 gagal dalam 10 menit (berlaku juga untuk web) | Hitung mundur `retry_after_seconds` |
| `face_not_registered` / `face_rejected` / `face_reenroll_required` | 403 | Lihat tabel di atas | Buka pendaftaran wajah (`POST /me/face-enrollment`) |
| `face_pending` | 403 | Menunggu persetujuan admin | Info menunggu; push FCM `reason=face` datang saat disetujui |
| `face_model_mismatch` | 426 | `face_descriptor` bukan 128-d atau `face_model` lain | Minta update aplikasi |
| `app_update_required` | 426 | `face_descriptor` tidak dikirim (aplikasi lama) | Minta update aplikasi |
| `error` | 400 / 403 / 422 | Jendela waktu, GPS (mock/akurasi/clock skew/radius), workcode, validasi | Tampilkan `message`, muat ulang `/me/state` |
| `error` | 409 | `Idempotency-Key` sama dengan payload berbeda | Buat key baru |
| (tanpa `status`) | 401 | Token tidak valid/kedaluwarsa | Hapus token, ke login |
| (tanpa `status`) | 429 | Throttle API | Hormati `Retry-After` |

```json
{
    "status": "face_locked",
    "message": "Terlalu banyak percobaan wajah yang gagal. Coba lagi dalam 15 menit atau hubungi admin.",
    "retry_after_seconds": 897
}
```

> Transisi rilis: `FACE_ENFORCE_DIMENSIONS=false` menonaktifkan sementara penolakan 426 `face_model_mismatch` (mis. sampai APK baru tersebar). Vector non-128-d tetap tidak pernah cocok dengan data tersimpan.

---

## 2a. Status Gabungan Peserta (Android)

Satu sumber kebenaran untuk dashboard aplikasi. Dimuat ulang saat aplikasi dibuka/kembali ke depan, setiap menerima pesan FCM, dan setelah submit presensi.

**URL**: `GET /api/v1/me/state` (token peserta). Header opsional `If-None-Match: "<state_version>"` → **304** tanpa body bila tidak ada perubahan. Header opsional `X-Installation-Id: <installation_id>` (nilai yang sama dengan `installation_id` saat presensi): bila HP ini sudah dipakai presensi akun lain pada workcode aktif hari ini, `attendance_ui` menjadi `action: "none"`, `reason: "device_used"` dengan `message` penjelasan, sehingga tombol Absen Datang tidak tampil.

```json
{
  "status": "success",
  "data": {
    "server_time": "2026-10-19T07:00:00+07:00",
    "state_version": "3f2b…",
    "workcode_aktif": { "id": 16, "nama_workcode": "…", "kategori": "harian" },
    "presensi_hari_ini": { "waktu_hadir": "2026-10-19T06:31:00+07:00", "waktu_pulang": null },
    "attendance_ui": { "action": "departure", "action_label": "Absen Pulang", "reason": "departure_open", "message": null, "server_time": "…", "effective_schedule": { } },
    "face": {
      "status": "approved",
      "ready": true,
      "blocker": null,
      "model": "faceapi-resnet34-128",
      "sample_count": 3,
      "can_enroll": false,
      "locked": false,
      "retry_after_seconds": null
    }
  }
}
```

- Header respons `ETag: "<state_version>"`. `state_version` tidak memuat nilai yang berubah tiap detik (`server_time`, `retry_after_seconds`), jadi hanya berubah bila tampilan perlu berubah.
- `workcode_aktif` / `presensi_hari_ini` bisa `null`. `attendance_ui` sama persis dengan `GET /workcodes/active`.
- `face.ready = true` ⇔ presensi wajah boleh dilakukan. Bila `false`, tampilkan `face.blocker.message`; bila `face.can_enroll`, tampilkan tombol daftar wajah.
- Bentuk `face` yang sama juga ada di `GET /api/v1/me` → `participant.face`.

## 2b. Pendaftaran Wajah dari Android

**URL**: `POST /api/v1/me/face-enrollment` (token peserta, JSON)

```json
{
  "model": "faceapi-resnet34-128",
  "descriptors": [[128 angka], [128 angka], [128 angka]],
  "photo": "data:image/jpeg;base64,/9j/4AAQ…"
}
```

- `descriptors`: 3–10 sampel wajah depan, masing-masing 128 angka mentah, konsisten (jarak tiap sampel ke rata-ratanya ≤ 0.55). Aturan sama dengan pendaftaran mandiri web.
- `photo` opsional, JPEG/PNG base64 maks ±1,5 MB.
- Status menjadi `pending`; admin menyetujui di web (Peserta → Wajah). Setelah disetujui, aplikasi menerima FCM `reason=face`.

| Kondisi | HTTP | `status` |
|---|---|---|
| Berhasil | 201 | `success` + `data.face` |
| `model` bukan `faceapi-resnet34-128` | 426 | `face_model_mismatch` |
| Wajah sudah disetujui & siap (ganti lewat pengajuan foto) | 409 | `face_already_registered` |
| Data/foto tidak valid atau sampel tidak konsisten | 422 | `invalid_face_data` |

## 2c. Anti Fake GPS (Android)

Aplikasi mengumpulkan sinyal integritas lokasi dan mengirimnya sebagai `location_integrity`; **server yang memutuskan** dan mencatat setiap percobaan (tabel `location_integrity_violations`, terlihat admin di halaman **Perangkat** → "Percobaan Fake GPS").

```json
"location_integrity": {
  "is_mock": false,
  "mock_app_active": false,
  "fake_apps": ["GPS Emulator"],
  "rooted": false,
  "hooking": false,
  "developer_options": true
}
```

| Field | Arti | Ditolak bila |
|---|---|---|
| `is_mock` | Titik lokasi (atau lokasi terakhir) berasal dari penyedia mock | `true` (selalu) |
| `mock_app_active` | Aplikasi dipilih di Opsi Pengembang → "Pilih aplikasi lokasi palsu" (AppOps `mock_location`) | `true` (selalu) |
| `fake_apps` | Nama aplikasi fake GPS populer yang terpasang | tidak kosong (`ANTI_FAKE_GPS_BLOCK_FAKE_APPS`, default `true`) |
| `rooted` | Biner `su`, Magisk/KernelSU/SuperSU, build `test-keys` | `true` (`ANTI_FAKE_GPS_BLOCK_ROOT`, default `true`) |
| `hooking` | Xposed/LSPosed/EdXposed, jejak Riru/Zygisk/Frida di proses | `true` (`ANTI_FAKE_GPS_BLOCK_HOOKING`, default `true`) |
| `developer_options` | Opsi Pengembang aktif | tidak pernah (hanya dicatat) |

Akurasi `0` selalu dianggap `is_mock`, walau sinyal tidak dikirim. Bila `ANTI_FAKE_GPS_REQUIRE_SIGNALS=true`, permintaan tanpa `location_integrity` ditolak **426** `app_update_required` (aktifkan setelah APK baru tersebar).

- **`POST /api/v1/attendance/precheck`** (token peserta, tanpa Idempotency-Key): `{"accuracy": 8.5, "location_integrity": {…}}` → **200** `{"status":"ok"}` atau **403**. Dipanggil sebelum kamera wajah dibuka agar peserta tidak memindai wajah sia-sia.
- **`POST /api/v1/attendance`**: field yang sama diperiksa ulang sebelum idempotensi (penolakan tidak di-cache per key).

Respons penolakan (keduanya):
```json
{
  "status": "fake_gps_detected",
  "message": "Presensi diblokir. Aplikasi Fake GPS terpasang di HP ini. Hapus aplikasi tersebut untuk dapat melakukan presensi. Terdeteksi: GPS Emulator.",
  "reasons": ["fake_app_installed"]
}
```
`reasons` ⊆ `mock_location`, `mock_app_active`, `fake_app_installed`, `hooking_framework`, `rooted`.

> Sinyal dari HP bisa dipalsukan oleh APK yang dimodifikasi; lapisan ini mencegah kecurangan umum (aplikasi fake GPS, mock location, root/hooking), bukan bukti mutlak. Penguatan berikutnya yang disarankan: Google Play Integrity API (verifikasi APK asli & integritas perangkat di server).

---

## 3. Web Admin Scanner

Digunakan oleh Admin untuk menscan QR Code peserta dari panel Web (Dashboard). Endpoint ini mem-bypass validasi Face Match dan Device Lock, namun tetap mematuhi aturan Radius GPS dan Window Jam Buka (menggunakan shared Service yang sama).

**URL**: `POST /scan` (Web Router, dilindungi CSRF + session auth)
**Headers**:
- `Accept: application/json`
- `Content-Type: application/json`
- `X-CSRF-TOKEN: <token>` (atau via cookie)

**Request Body**:
```json
{
  "qr_token": "uuid-qr-peserta",
  "latitude": -6.1234,
  "longitude": 106.1234,
  "accuracy": 10.5
}
```

> `latitude`, `longitude`, `accuracy` bersifat opsional. Jika tidak dikirim, validasi radius di-skip.

**Response Success (200 OK)**:
```json
{
    "status": "success",
    "message": "Presensi berhasil dicatat!",
    "participant": {
        "id": 1,
        "nama": "Nama Peserta",
        "nis_nip": "12345"
    },
    "timestamp": "08:00:00",
    "stats": {
        "total": 100,
        "hadir": 10,
        "belum": 90
    }
}
```

**Responses Error**:
- **400 Bad Request**: Belum ada workcode aktif.
- **403 Forbidden**: Scanner berada di luar radius atau jam tutup.
- **404 Not Found**: QR Code tidak dikenali.

---

## 4. Leave Request (Pengajuan Izin)

**URL**: `POST /api/v1/leave-requests`
**Headers**:
- `Authorization: Bearer <token>`
- `Accept: application/json`
- `Idempotency-Key: <UUID>` *(Wajib)*

**Request Body** (multipart/form-data):
```
tipe_izin:          izin_penuh | tidak_absen_datang | tidak_absen_pulang
jenis_izin:         cuti | izin_sakit | force_majeure | ...
keterangan:         "Teks alasan"
tanggal:            "2026-10-02"
izin_lebih_dari_satu_hari: true (opsional)
tanggal_selesai:    "2026-10-04" (wajib jika multi-hari)
dokumen:            file (jpg/png/pdf, opsional)
```

**Response Success (201 Created)**:
```json
{
  "status": "success",
  "data": {
    "leave_request": {
      "id": 1,
      "kategori": "izin",
      "tipe_izin": "izin_penuh",
      "jenis_izin": "cuti",
      "tanggal": "2026-10-02",
      "tanggal_selesai": "2026-10-04",
      "keterangan": "Teks alasan",
      "status_approval": "pending",
      "has_dokumen": true
    }
  }
}
```

**Note**: Pengajuan selalu masuk sebagai `pending`. Approval hanya dilakukan oleh admin via web.

---

## 5. Photo Change Request

> **URL foto (`photo_url`) — berlaku sejak Fase 1 (Okt 2026):** semua `photo_url` di `/me`, `/me/photo`, dan respons ganti foto kini berupa **URL bertanda tangan sementara** ke `/files/...` (berlaku 60 menit), bukan lagi `/storage/...`. URL bisa langsung dimuat library gambar (Glide/Coil) **tanpa** header `Authorization`. Jangan menyimpan URL ini permanen atau memakai URL lama di cache: ambil ulang dari API bila gambar gagal dimuat (HTTP 403 = URL kedaluwarsa). Cache gambar sebaiknya memakai key `participant_id`, bukan URL lengkap.

**URL**: `POST /api/v1/me/photo-change-requests`
**Headers**:
- `Authorization: Bearer <token>`
- `Idempotency-Key: <UUID>` *(Wajib)*

**Request Body** (multipart/form-data):
```
photo:              file (jpg/jpeg/png/webp, maks 5 MB, wajib)
face_descriptor[]:  0.9, 0.8, ... (opsional; bila dikirim harus tepat 128 angka model faceapi-resnet34-128, selain itu 422)
```

> Saat disetujui admin, descriptor hanya menggantikan data wajah bila kompatibel (128-d), dan `face_status` menjadi `approved` hanya bila peserta akhirnya memiliki minimal satu sampel 128-d. Pengajuan tanpa descriptor hanya mengganti foto.

**Response Success (201 Created)**:
```json
{
  "status": "success",
  "message": "Foto berhasil diajukan dan menunggu verifikasi admin.",
  "data": {
    "photo_change_request": {
      "id": 1,
      "status": "pending",
      "photo_url": "https://<host>/files/photo-change-request/1?expires=...&signature=...",
      "created_at": "2026-10-20T14:30:00+07:00",
      "submitted_at": "2026-10-20T14:30:00+07:00",
      "reviewed_at": null,
      "rejection_reason": null
    },
    "has_pending_photo_change": true
  }
}
```

**Response Error (409)**: Sudah ada pending request yang belum diproses.

Foto & descriptor aktif peserta **tidak berubah** sampai admin menyetujui pengajuan.

### Status foto — `GET /api/v1/me/photo`

```json
{
  "status": "success",
  "data": {
    "photo_url": "https://<host>/files/participant-photo/1?expires=...&signature=...",
    "face_status": "approved",
    "active_photo": { "photo_url": "https://<host>/files/participant-photo/1?...", "status": "approved" },
    "photo_change_request": {
      "id": 1, "status": "pending", "photo_url": "https://<host>/files/photo-change-request/1?...",
      "created_at": "2026-10-20T14:30:00+07:00", "submitted_at": "2026-10-20T14:30:00+07:00",
      "reviewed_at": null, "rejection_reason": null
    },
    "has_pending_photo_change": true
  }
}
```

- `face_status` / `active_photo.status` = status foto/wajah **aktif** (`approved`, `pending`, `rejected`, atau `null`).
- `photo_change_request` = pengajuan perubahan foto **terbaru apa pun statusnya** (`pending`, `approved`, `rejected`), `null` bila belum pernah mengajukan. **Berubah sejak Okt 2026:** sebelumnya hanya berisi pengajuan `pending`; klien yang menganggap "tidak null = sedang menunggu" harus beralih ke `has_pending_photo_change`.
- `has_pending_photo_change` = `true` bila masih ada pengajuan menunggu verifikasi admin.

---

## 6. FCM Token Management

### Register Token
**URL**: `POST /api/v1/fcm/register`
**Headers**: `Authorization: Bearer <token>`
**Body**: `{ "token": "fcm-device-token" }`
**Response**: `{ "status": "success", "message": "FCM token berhasil didaftarkan." }`

### Unregister Token
**URL**: `DELETE /api/v1/fcm/unregister`
**Headers**: `Authorization: Bearer <token>`
**Response**: `{ "status": "success", "message": "FCM token berhasil dihapus." }`

> Kedua endpoint ini **tidak** memerlukan `Idempotency-Key`.

Daftarkan token setelah login dan di `onNewToken`; hapus saat logout. Server melepas token yang ditolak Firebase (tidak terdaftar/tidak valid).

## 7. Sinkronisasi Real-time (FCM)

FCM hanya **pemicu**: payload tidak berisi data pribadi maupun state. Aplikasi selalu memuat ulang `GET /api/v1/me/state` (dengan `If-None-Match`), sehingga pesan yang hilang/terlambat tidak merusak tampilan.

| Pesan | Tujuan | Data | Dikirim saat |
|---|---|---|---|
| Per pengguna | token `users.fcm_token` | `{"type":"state_changed","reason":"face\|attendance\|photo\|leave\|workcode","v":"1"}` | Setelah commit DB: wajah didaftarkan/disetujui/ditolak/dihapus (`face`), presensi dicatat/diubah di luar aplikasi — scanner web, self check-in, input manual admin (`attendance`), pengajuan foto diputuskan (`photo`, plus `face` bila data wajah berubah), izin diputuskan (`leave`) |
| Topic `workcode-updates` | semua perangkat | `{"type":"workcode_sync","action":…,"workcode_id":…}` | Workcode dibuat/diubah/diaktifkan/dinonaktifkan/dihapus |
| Topic `workcode-updates` | semua perangkat | `{"type":"workcode_sync","action":"full_sync","v":"1","timestamp":…}` | Admin menekan tombol **Sync** (petir) di web (`POST /sync`, jeda 30 detik). Aplikasi memuat ulang seluruh datanya dari API; tanpa `workcode_id`. Aplikasi lama sudah menanganinya sebagai `workcode_sync` biasa (muat ulang `/me/state`) |

- Android priority `high`, TTL 600 detik. Push `state_changed` per pengguna+alasan dibatasi agar satu aksi (mis. izin multi-hari) cukup satu pesan.
- Perhitungan alpha otomatis (cron) tidak mengirim push.
- Untuk pesan topic, aplikasi menunda acak 0–15 detik sebelum memuat ulang agar satu sekolah tidak memuat ulang bersamaan.
- Cadangan bila push gagal: muat ulang saat aplikasi ke depan, polling adaptif di dashboard (15 detik saat jendela presensi buka/wajah `pending`, selain itu 60 detik), dan pemuatan ulang pada jam buka/tutup `effective_schedule`.
