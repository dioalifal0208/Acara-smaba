# Fase 4 — Konsolidasi Logika Presensi

**Tujuan:** satu tempat yang menentukan apakah presensi sah, dipakai oleh scanner admin, self check-in, face match web, dan API mobile.
**Estimasi:** 4–6 hari. **Branch:** `refactor/phase-4-attendance` (PR per jalur).
**Prasyarat:** Fase 3 (baseline hijau) dan Fase 2 (face match sudah 1:1).

## Kondisi sekarang (empat jalur terpisah)

| Jalur | Lokasi | Threshold wajah | Catatan |
|---|---|---|---|
| Scanner QR admin | `AttendanceController` (web) | — | GPS opsional bila scanner tak mengirim |
| Self check-in | `SelfCheckInController` + `AttendanceValidationService` | — | validasi GPS/device/waktu di service |
| Face match web | `FaceRecognitionController::match` (`:226`) | ≈0.58 (`:314`) | menghitung radius sendiri (`:290-302`) |
| API mobile | `Api/V1/AttendanceController` | 0.85 (`:280`) | normalisasi descriptor sendiri, clock-skew sendiri |

`AttendanceValidationService:118-125` sudah punya Haversine; `FaceRecognitionController` punya `calculateDistance` sendiri → duplikasi.

---

## 4.1 Desain service

Lokasi: `app/Services/Attendance/`.

```
RecordAttendanceAction        // orkestrasi (satu transaksi)
  ├─ AttendanceContext (DTO)   // workcode, participant, source, gps?, device?, faceMatch?, now
  ├─ AttendanceValidationService (sudah ada, dirapikan)
  ├─ FaceMatcher               // normalisasi + jarak Euclidean + threshold dari config
  └─ AttendanceResult (DTO)    // recorded | already | rejected(reason code)
```

- `source`: enum `AttendanceSource { QrAdmin, SelfCheckIn, FaceWeb, Mobile }`.
- Waktu selalu `now()` server; jam perangkat hanya untuk deteksi skew (> 2 menit → tolak untuk `Mobile`/`SelfCheckIn`).
- Satu transaksi: `DB::transaction` → `Attendance::where(workcode, participant, tanggal)->lockForUpdate()` → putuskan datang/pulang/already → simpan. Tangkap `UniqueConstraintViolationException` (`unique_attendance`) dan petakan ke `already`.
- Kode alasan penolakan stabil (`outside_radius`, `gps_inaccurate`, `mock_location`, `clock_skew`, `device_locked`, `face_mismatch`, `outside_time`, `workcode_inactive`, `leave_exists`) → controller memetakan ke pesan; API menyertakan `code` agar Android tidak mem-parse teks.
- Aturan GPS: jika workcode punya koordinat, GPS **wajib** untuk semua sumber kecuali `QrAdmin` bila `config('attendance.qr_admin_requires_gps')` = false (default tetap seperti perilaku sekarang agar tidak merusak operasi; dicatat sebagai keputusan).
- Pesan error jangan menampilkan jarak aktual/descriptor.

`config/attendance.php`:
```php
return [
  'face' => ['threshold_web' => env('FACE_THRESHOLD_WEB', 0.58), 'threshold_mobile' => env('FACE_THRESHOLD_MOBILE', 0.85)],
  'gps' => ['max_accuracy_m' => 50, 'max_clock_skew_s' => 120],
  'qr_admin_requires_gps' => false,
];
```

## 4.2 Urutan migrasi jalur (satu PR per langkah)

1. **Characterization tests**: sebelum mengubah, pastikan test yang ada (`PhaseEAttendanceTest`, `SelfCheckInWebTest`, `AttendanceManagementTest`) mencakup: duplikat, radius, akurasi rendah, mock GPS, clock skew, device lock, jadwal lintas tengah malam, kategori `harian`/`24_jam`/`workcode`. Tambahkan yang kurang. Ini jaring pengaman.
2. **Ekstrak `FaceMatcher`**: pindahkan `calculateDistance` dari `FaceRecognitionController:36` dan `validateFaceMatch` dari `Api/V1/AttendanceController:223-290`; dukung descriptor tunggal dan multi-vector; keduanya memakai config. Tidak mengubah perilaku (threshold tetap berbeda per sumber).
3. **Jalur API mobile** → `RecordAttendanceAction`. Pertahankan format response, idempotency (`ApiIdempotencyLog`) tetap di controller.
4. **Self check-in** → action.
5. **Face match web** → action (setelah Fase 2 menjadikannya 1:1).
6. **Scanner admin** → action.
7. Hapus kode duplikat, `grep` memastikan tidak ada `Attendance::create(` di luar action/CRUD manual admin.

## 4.3 Kalibrasi threshold wajah

- Tujuan: menyatukan threshold web (0.58) dan mobile (0.85) berdasarkan data, bukan tebakan.
- Kumpulkan 1–2 minggu jarak (sukses dan gagal) **anonim**: tabel `face_match_metrics` (`source`, `distance`, `matched`, `created_at`; tanpa participant_id atau descriptor), dipangkas otomatis 30 hari.
- Analisis: distribusi jarak match benar vs salah; pilih threshold dengan FAR rendah. Selama menunggu, jangan ubah nilai produksi.
- Setelah dipilih, ubah lewat env, rilis bertahap, siapkan fallback scan QR admin.

## 4.4 Enum kategori

- `app/Enums/WorkcodeCategory.php`: `Workcode = 'workcode'`, `Harian = 'harian'`, `DuaEmpatJam = '24_jam'`. Cast di model `Workcode`.
- Ganti string literal (`'harian'`, `'kegiatan'`, `'24_jam'`) di `AttendanceValidationService`, `CalculateAttendanceStatus:23`, controller, dan resource: `grep -rn "'kegiatan'\|'harian'\|'24_jam'" app`.
- Migration data hanya jika ada nilai `kegiatan` di DB (periksa dulu: `SELECT DISTINCT kategori FROM workcodes`).

## 4.5 Satukan alur foto wajah

- `registerSelf` (`FaceRecognitionController:128`) saat ini langsung menimpa `photo_path` peserta (hapus foto lama di `:157`) → ganti: buat `PhotoChangeRequest` kandidat seperti API (`PhotoController:105`), foto aktif berubah hanya setelah `approve`.
- Pertahankan perilaku admin `register` (langsung approved, `:84`).
- Migrasi: peserta dengan `face_status='pending'` dari alur lama dipetakan ke kandidat atau dibiarkan sampai direview; tidak ada penghapusan data.
- Satu halaman review admin untuk keduanya (`Pages/Participants` review wajah + `PhotoChangeRequestController`).

---

## Test

- Matriks sumber × aturan (parameterized dataset): hasil identik antar jalur untuk kasus yang sama.
- Concurrency: dua request bersamaan untuk peserta/workcode/tanggal sama → satu `recorded`, satu `already` (gunakan dua koneksi atau uji penangkapan unique violation).
- Regresi API: `API_CONTRACT.md` tidak berubah kecuali field `code` yang ditambahkan.

**Rollback:** setiap jalur dipindah di PR terpisah, sehingga bisa direvert sendiri; perilaku lama dipertahankan sampai test paritas lulus.

## Definition of Done Fase 4

- [ ] Tidak ada logika validasi presensi duplikat di controller; semua lewat `RecordAttendanceAction`.
- [ ] Threshold wajah dari config; data kalibrasi terkumpul dan keputusan dicatat.
- [ ] `WorkcodeCategory` dipakai konsisten; tidak ada literal kategori.
- [ ] Foto aktif tidak berubah sebelum approval pada semua jalur.
- [ ] Test paritas, concurrency, dan regresi lulus.
