# Kontrak API Presensi (Web & Android)

Dokumen ini mendeskripsikan spesifikasi endpoint API untuk modul presensi pada sistem Acara SMABA, memastikan Android (Mobile) dan Web Scanner menggunakan aturan presensi (logic validation) yang tersentralisasi via `AttendanceValidationService`.

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
      "latitude": -6.1234,
      "longitude": 106.1234,
      "radius_meters": 150,
      "jadwal_per_hari": []
    },
    "presensi_hari_ini": {
       "waktu_hadir": "2026-10-02T08:00:00.000000Z",
       "waktu_pulang": null
    }
  }
}
```

**Response (200 OK) - Tidak ada workcode aktif**: `"data": null`
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
  "installation_id": "uuid-device-123",
  "face_descriptor": [0.12, 0.45, -0.99]
}
```

> **`face_descriptor`** adalah **wajib**. Client lama yang tidak mengirim field ini akan menerima **426 Upgrade Required** dengan pesan wajib update.

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
      "workcode": {
         "id": 1,
         "nama_workcode": "Acara Pagi"
      }
    }
  }
}
```

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

**Responses Error**:
- **400 Bad Request**: `Idempotency-Key` hilang/bukan UUID, mock location terdeteksi, akurasi GPS terlalu rendah, clock skew.
- **403 Forbidden**: Di luar radius GPS, perangkat terkunci untuk user lain, di luar jam buka/tutup.
- **409 Conflict**: `Idempotency-Key` sama dengan payload berbeda.
- **422 Unprocessable Entity**: Validasi gagal (field wajib hilang, format salah).
- **426 Upgrade Required**: `face_descriptor` tidak dikirim (versi app lama).

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

**URL**: `POST /api/v1/me/photo-change-requests`
**Headers**:
- `Authorization: Bearer <token>`
- `Idempotency-Key: <UUID>` *(Wajib)*

**Request Body** (multipart/form-data):
```
photo:              file (jpg/png, wajib)
face_descriptor:    [0.9, 0.8, ...] (array float, wajib)
```

**Response Success (201 Created)**:
```json
{
  "status": "success",
  "data": {
    "photo_change_request": {
      "id": 1,
      "status": "pending"
    }
  }
}
```

**Response Error (409)**: Sudah ada pending request yang belum diproses.

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
