# Fase 2 — Hardening Endpoint Publik

**Tujuan:** endpoint tanpa login tidak bisa dipakai untuk enumerasi peserta, pemalsuan presensi, atau brute-force wajah.
**Estimasi:** 3–4 hari. **Branch:** `fix/phase-2-public-endpoints`.
**Prasyarat:** Fase 0–1; keputusan pemilik #4 (self check-in wajib login atau tidak — lihat bawah).

Endpoint publik saat ini (`routes/web.php`):
`:66` `GET /api/participants/lookup`, `:68` `GET /participants/{participant}/qr`, `:188` `GET /api/participants/search`, `:189-190` `GET|POST /self-checkin/{token}`, `:193` `GET /api/holidays`, `:196` `POST /api/face/match`, `:199` `GET /storage/{path}`, `:210` `GET /verify-signature/{workcode}`.

---

## 2.1 Face match menjadi 1:1 dengan nonce

**Masalah:** `FaceRecognitionController::match` (`:226`) mencari wajah terdekat di seluruh peserta approved tanpa auth; response mengembalikan `distance` (`:437`).

**Desain**
1. `SelfCheckInController@showForm` menerbitkan **attempt token** acak (32 byte) tersimpan di cache `selfcheckin:attempt:{hash}` berisi `workcode_id`, `ip`, `ua_hash`, `expires_at` (TTL 5 menit), dikirim ke halaman Inertia.
2. Setelah peserta dipilih di UI, klien memanggil `POST /api/face/match` dengan `{attempt_token, participant_id, face_descriptor, gps..., device...}`.
3. Server: validasi token (ada, belum kedaluwarsa, IP/UA cocok, dipakai sekali per percobaan sukses), muat **hanya** `participant_id` tersebut, bandingkan descriptor 1:1. Tidak ada fallback pencarian 1:N.
4. Response sukses: `{status, message, participant: {nama}}`. Response gagal: pesan generik "Wajah tidak cocok". **Hapus** `distance`, daftar kandidat, status wajah, NIS/NIP dari response.
5. Hitung percobaan gagal per `(participant_id)` dan per IP di cache: ≥5 gagal dalam 10 menit → kunci 15 menit (HTTP 429) dan catat event keamanan (tanpa descriptor).
6. Threshold dari `config/attendance.php` (`face.threshold_web`), bukan literal; nilai awal tetap 0.58 sampai kalibrasi (Fase 4).

**Rate limiter** (`AppServiceProvider`): `RateLimiter::for('face-match', ...)` → `Limit::perMinute(10)->by($ip)` dan `Limit::perMinute(5)->by($participantId)`; pasang `throttle:face-match` di route. Nilai via env agar sekolah dengan satu IP NAT tidak terblokir saat acara ramai.

**Keputusan pemilik (#4):** jika self check-in boleh tanpa akun, nonce+1:1+throttle sudah cukup. Jika wajib login peserta, pindahkan route ke grup `auth` + `role:participant` dan identitas diambil dari session (tidak perlu `participant_id` dari klien) — lebih aman.

**Frontend:** `Pages/SelfCheckIn/*` dan `FaceScannerModal`: kirim `attempt_token` + `participant_id`, hapus penggunaan field `distance` dan pencarian peserta otomatis dari hasil match.

**Test**
- Tanpa/token salah/kedaluwarsa/token IP lain → 403/422.
- Token dipakai ulang setelah sukses → ditolak.
- Descriptor peserta B dikirim dengan `participant_id` A → gagal; response tak memuat angka jarak.
- Lockout setelah 5 gagal; rate limit 429.
- Regresi `SelfCheckInWebTest`.

---

## 2.2 Lookup, search, dan QR peserta

**Masalah:** daftar peserta dan QR pribadi (token presensi) dapat diambil siapa pun.

| Endpoint | Perubahan |
|---|---|
| `GET /api/participants/search` | Syarat: attempt token self-checkin **atau** `auth`. Query ≥ 3 karakter, maks 10 hasil, `throttle:30,1`. Field: `id`, `nama` saja. Tanpa `nis_nip`, `qr_token`, `face_status`, `status` kepegawaian. |
| `GET /api/participants/lookup` | Pindah ke grup `auth` (admin). Bila memang dipakai publik, samakan dengan `search`. Periksa pemakai di `resources/js` dulu. |
| `GET /participants/{participant}/qr` | Pindah ke `auth` + Policy (admin atau pemilik). Untuk berbagi QR, gunakan `URL::temporarySignedRoute('participants.qr', now()->addMinutes(15), ...)` + middleware `signed`. |
| `GET /api/holidays` | Boleh publik, tambah `throttle`, cache respons 24 jam. |
| `GET /verify-signature/{workcode}` | Tetap publik tetapi hanya kembalikan data yang memang dimaksud (nama kegiatan, tanggal, nama kepala sekolah); gunakan UUID/hash, bukan ID berurutan, atau signed URL (QR tanda tangan dibuat di `AttendanceController@qrSignature`, ubah ke signed route). |

Tambahan: tombol admin "Reset QR peserta" (regenerasi `qr_token`) bila token diduga bocor; setelah reset, QR lama gagal di scanner.

**Test:** guest → 401/302 pada `lookup`/`qr`; `search` tanpa token → 403; respons tidak mengandung `nis_nip`/`qr_token`; URL QR bertanda tangan kedaluwarsa → 403; ID workcode berurutan tidak lagi valid untuk verifikasi.

---

## 2.3 Throttle dan proteksi brute-force

- `AuthenticatedSessionController`/`LoginRequest` memakai `RateLimiter` bawaan Breeze — pastikan masih aktif (`ensureIsNotRateLimited`); tambah test.
- `throttle` untuk `forgot-password` (6/menit), `POST /self-checkin/{token}` (20/menit/IP), dan route publik lain di atas.
- API login sudah 5/menit (`AppServiceProvider`); tambah lockout per username (bukan hanya IP).

## 2.4 Proxy dan header keamanan

1. `bootstrap/app.php:26` — ganti `trustProxies(at: '*')` dengan `at: array_filter(explode(',', env('TRUSTED_PROXIES', '')))`. Tanyakan IP proxy Hostinger (atau gunakan `'*'` hanya jika server **hanya** terjangkau lewat proxy; dokumentasikan alasannya). Uji: `request()->ip()` di produksi tetap IP klien nyata.
2. Middleware `SecurityHeaders` (global web): `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(self), geolocation=(self), microphone=()`, `Strict-Transport-Security` (produksi saja). CSP mulai `Content-Security-Policy-Report-Only` karena Inertia/Vite/Leaflet/tile peta memerlukan whitelist sumber.
3. CORS: periksa `config/cors.php` — batasi origin ke domain sendiri; API Android tidak butuh CORS.

## 2.5 Sanctum dan model

- `config/sanctum.php:53` — `expiration => 60*24*30` (30 hari) lewat env `SANCTUM_EXPIRATION`; tambah command `sanctum:prune-expired --hours=24` ke scheduler (`routes/console.php`).
- Login API: hapus token lama perangkat yang sama (`installation_id`) agar token tidak menumpuk.
- `User` fillable sudah dibersihkan di Fase 0; tambah test yang memastikan `role` tidak bisa di-mass-assign.
- Master QR: pastikan `regenerateToken` memakai `Str::random(40)`/UUID v4 dan dicatat waktu rotasi; opsi auto-rotasi harian.

---

## Definition of Done Fase 2

- [ ] `face/match` hanya 1:1, butuh nonce, ter-throttle, tidak mengembalikan jarak/data lain.
- [ ] `search`/`lookup`/`qr` tidak dapat dipakai untuk enumerasi atau unduh QR milik orang lain.
- [ ] `trustProxies` terbatas; security header aktif; CSP report-only berjalan tanpa error berarti.
- [ ] Token Sanctum kedaluwarsa dan terpangkas otomatis.
- [ ] Test untuk seluruh poin di atas lulus; Android diuji terhadap staging.
