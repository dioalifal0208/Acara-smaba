# Fase 1 — Privasi Data Biometrik dan Dokumen

**Tujuan:** descriptor/foto wajah dan dokumen izin tidak bocor lewat log maupun URL publik.
**Estimasi:** 2–3 hari. **Branch:** `fix/phase-1-privacy`.
**Prasyarat:** Fase 0 selesai; PHP CLI berfungsi (kerjakan Fase 3.1 lebih dulu bila belum).

---

## 1.1 Hentikan logging data biometrik

**File:** `app/Http/Controllers/Api/V1/AttendanceController.php`
- Baris ~250: hapus key `'array_android_lengkap' => json_encode($incomingDescriptor)` dari log; sisakan hanya panjang array (`$inSize`) bila perlu debugging.
- Baris ~282: ganti `Log::info('[FACE-DEBUG] ...')` dengan `Log::debug` berisi `participant_id`, jarak dibulatkan 2 desimal, threshold. Tanpa descriptor.
- Baris ~287: pesan ke client `'Wajah tidak cocok. Jarak: '.round(...)` → `'Wajah tidak cocok.'`. Jarak membantu penyerang menyetel percobaan (hill-climbing).
- Baris 23-25 (log request awal): cek isi lengkap blok ini; pastikan hanya metadata (ada/tidaknya, jumlah elemen), tidak ada nilai.
- Telusuri sisa: `grep -rn "face_descriptor\|descriptor" app --include=*.php | grep -i "log"`; periksa juga `FaceRecognitionController`, `UpdateFaceDescriptor` (log `nama` peserta di baris 198 → cukup `id`).

**Konfigurasi log (`config/logging.php`, `.env`)**
- Produksi: `LOG_CHANNEL=daily`, `LOG_LEVEL=warning`, `LOG_DAILY_DAYS=14` (driver `daily` sudah ada).
- Tambah pemrosesan redaksi (opsional tapi disarankan): `app/Logging/RedactSensitive.php` (Monolog processor) yang mengganti key `face_descriptor`, `password`, `token`, `authorization`, `dokumen` di `context` menjadi `[REDACTED]`; daftarkan via `'tap'` pada channel.

**Purge log lama (produksi)**
1. Unduh/backup bila diperlukan untuk forensik (enkripsi, simpan di luar server).
2. `shred -u storage/logs/laravel*.log` atau hapus; periksa juga backup server yang berisi `storage/logs`.
3. Tambahkan langkah ini ke checklist deploy sekali jalan, bukan ke skrip rutin.

**Test**
- Feature test API attendance dengan `Log::spy()`: kirim descriptor 128 float; assert tidak ada panggilan log yang `context` atau pesannya memuat nilai descriptor.
- Test response gagal wajah tidak memuat angka jarak.
- CI guard (Fase 3.3): `grep` gagal bila `Log::` berdekatan dengan `descriptor`.

---

## 1.2 Disk privat untuk dokumen izin dan foto wajah

### a. Konfigurasi
`config/filesystems.php`: tambah disk

```php
'private' => [
    'driver' => 'local',
    'root'   => storage_path('app/private'),
    'serve'  => false,
    'throw'  => true,
],
```
Pastikan `storage/app/private` bukan target symlink `public/storage`.

### b. Tulis ke disk privat (semua titik penyimpanan)

| File | Baris | Perubahan |
|---|---|---|
| `Http/Controllers/LeaveRequestController.php` | 78 | `->store('dokumen_izin', 'private')` |
| `Http/Controllers/Api/V1/LeaveRequestController.php` | 184 | sama |
| `Http/Controllers/Api/V1/PhotoController.php` | 105, 125, 213, 268, 323 | `photo-change-requests` → `private`; semua `Storage::disk('public')` pada foto wajah → `private` |
| `Http/Controllers/FaceRecognitionController.php` | 104, 108, 153, 157, 190, 208 | foto wajah → `private` |
| `Http/Controllers/PhotoChangeRequestController.php` | 48, 83 | `private` |
| `Http/Controllers/ParticipantController.php` | 268, 295 | `private` |
| `Http/Resources/Api/V1/UserResource.php` | 38 | cek eksistensi di `private`; **jangan lagi** mengembalikan URL `/storage/...` |
| `Http/Resources/Api/V1/PhotoChangeRequestResource.php` | 21 | sama |

Nama file diacak (UUID) dan simpan hanya path relatif; validasi upload: `mimes:jpg,jpeg,png,pdf`, `max:5120`, dan untuk foto `image` + dimensi maksimum.

### c. Endpoint terotorisasi (butuh Policy — belum ada `app/Policies/`)
- `LeaveRequestPolicy@viewDocument`: admin, atau `user->participant_id === leaveRequest->participant_id`.
- `ParticipantPolicy@viewPhoto`: admin, atau pemilik.
- Route web (grup `auth`):
  - `GET /leave-requests/{leaveRequest}/document` → `streamDownload`/`response()->file` dari disk `private`, header `Cache-Control: private, no-store`, `X-Content-Type-Options: nosniff`, `Content-Disposition: inline` hanya untuk PDF/gambar.
  - `GET /participants/{participant}/photo` (admin atau pemilik).
- Route API (Sanctum): `GET /api/v1/me/photo` yang sudah ada — ubah agar streaming dari `private`; tambah `GET /api/v1/leave-requests/{id}/document` untuk pemilik.
- Frontend: ganti penggunaan `photo_url`/`bukti_url`/`dokumen` yang berbentuk `/storage/...` dengan route baru (cari `storage/` dan `photo_path` di `resources/js`).
- Kompatibilitas Android: tetap kembalikan field `photo_url` tetapi isi dengan URL route baru yang butuh bearer token; koordinasikan dengan tim aplikasi (gambar yang dimuat tanpa header Authorization akan gagal → sediakan **signed temporary URL** TTL 5 menit bila library gambar Android tidak mengirim token).

### d. Migrasi file lama — `php artisan files:migrate-private`
1. Pilihan `--dry-run` (default) mencetak daftar `dokumen_izin/*`, `photo-change-requests/*`, dan foto wajah (`participants.photo_path`) yang akan dipindah.
2. Eksekusi: `Storage::disk('private')->put($path, Storage::disk('public')->get($path))` → verifikasi ukuran sama → baru hapus dari `public`. Path di DB tidak berubah (relatif), sehingga tidak perlu update DB; jika nama diganti UUID, update DB dalam transaksi.
3. Idempoten: lewati file yang sudah ada di tujuan. Log hasil (jumlah dipindah/gagal), jangan log nama peserta.
4. Jalankan di staging (`deploy/init_staging.sh`) dengan salinan data produksi dulu, lalu produksi setelah backup `storage/app/public`.

### e. Perketat fallback `/storage/{path}` (`routes/web.php:199`)
- Whitelist prefix non-sensitif (mis. `branding/`, `logos/`); tolak selain itu dengan 404.
- Tolak `..`, null byte, path absolut. Hapus `Cache-Control: public, max-age=31536000` untuk path apa pun yang bukan aset statis.
- Setelah migrasi, `grep` memastikan tak ada kode yang masih menulis data sensitif ke disk `public`.

**Test**
- Dokumen izin: guest → redirect login/401; peserta lain → 403; pemilik dan admin → 200 dengan `Cache-Control: private`.
- Foto wajah: sama.
- `/storage/dokumen_izin/x.pdf` dan `/storage/../.env` → 404.
- Upload `.php` yang dinamai `.pdf`/MIME palsu → ditolak.
- Test migrasi command dengan `Storage::fake`.

**Rollback:** command bersifat copy-then-delete; simpan backup `storage/app/public` selama 14 hari. Revert kode tidak membutuhkan perubahan DB.

---

## 1.3 Kebijakan data biometrik

- Dokumen kebijakan 1 halaman: tujuan, dasar persetujuan peserta, retensi (mis. hapus wajah ≤ 30 hari setelah peserta nonaktif), siapa yang boleh akses (admin), cara hapus.
- Pastikan `ParticipantController@destroy` dan penghapusan wajah menghapus: file foto, `face_descriptor`, kandidat `PhotoChangeRequest` (+ filenya). Tambah test.
- Tampilkan teks persetujuan singkat di `FaceRegistrationModal`/`SelfFaceRegistrationModal` sebelum mengambil foto.
- Evaluasi enkripsi `face_descriptor` (`encrypted:array` cast): benchmark `match` 1:N pada jumlah peserta nyata; bila match sudah 1:1 (Fase 2) beban dekripsi kecil → terapkan lewat migration backfill (baca → tulis ulang terenkripsi, bertahap).

---

## Definition of Done Fase 1

- [ ] Tidak ada descriptor, jarak mentah, atau token di log; log lama dihapus.
- [ ] Semua penyimpanan dokumen/foto memakai disk `private`; file lama dimigrasi dan diverifikasi.
- [ ] Akses file hanya via endpoint ber-Policy; `/storage/{path}` ter-whitelist.
- [ ] Android tetap dapat menampilkan foto profil (signed URL atau bearer).
- [ ] Test otorisasi file, redaksi log, dan upload berbahaya lulus.
