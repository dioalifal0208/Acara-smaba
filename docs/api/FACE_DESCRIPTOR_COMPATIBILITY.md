# Kompatibilitas Descriptor Wajah (Web ↔ Android)

Status: diperbarui 19 Okt 2026 — **satu model & satu aturan untuk web dan Android** (Android = input presensi utama, web = pendukung).
Keputusan cocok/tidak cocok selalu di Laravel (`app/Support/FaceMatcher.php`). Android hanya mengekstrak descriptor yang kompatibel lalu mengirimnya **sekali per aksi**.

## 1. Sumber kebenaran

| Bagian | File |
|---|---|
| Model & versi | `package.json` (`face-api.js` `^0.22.2`, terpasang 0.22.2), bobot di `public/models/` |
| Pendaftaran wajah web (sumber descriptor tersimpan) | `resources/js/Utils/faceEnrollment.js`, `resources/js/Components/FaceEnrollmentCamera.jsx`, `resources/js/Utils/liveness.js` |
| Validasi, normalisasi, jarak | `app/Support/FaceDescriptor.php` |
| Aturan pencocokan tunggal | `app/Support/FaceMatcher.php` (dipakai presensi Android `Api/V1/AttendanceController::validateFaceMatch`, 1:1). Presensi wajah web sudah dihapus (Okt 2026). |
| Kunci gagal berulang (Android) | `app/Support/FaceAttemptLimiter.php` |
| Pendaftaran wajah Android | `app/Http/Controllers/Api/V1/FaceEnrollmentController.php` (`POST /api/v1/me/face-enrollment`) |
| Threshold | `config/attendance.php` → `attendance.face.threshold` (env `FACE_THRESHOLD`) |

## 2. Model

- **face-api.js 0.22.2 `FaceRecognitionNet`**: ResNet-34 (varian ringan), port dari model dlib `dlib_face_recognition_resnet_model_v1`. Bobot: `public/models/face_recognition_model-*`.
- Pendukung di web: `TinyFaceDetector` (`inputSize` 416 saat pendaftaran, 512/224 di scanner, `scoreThreshold` 0.5) dan `FaceLandmark68Net` (68 titik) untuk alignment. `FaceExpressionNet` hanya untuk liveness (senyum), tidak memengaruhi descriptor.
- **Dimensi descriptor: 128** float32 (`FaceDescriptor::DIMENSIONS = 128`).

## 3. Preprocessing (face-api.js `withFaceDescriptor`)

1. Deteksi wajah → 68 landmark.
2. **Crop alignment gaya dlib** (`FaceLandmarks.alignDlib`, `useDlibAlignment: true`): titik acuan = pusat mata kiri, mata kanan, mulut; `size = floor(rata-rata jarak mata→mulut / 0.45)`; kotak persegi berpusat di rata-rata ketiga titik dengan `relX = 0.5`, `relY = 0.43`. **Tanpa rotasi** (wajah miring tidak diluruskan; pendaftaran web menolak roll > 12°).
3. Crop dipotong dari frame asli (clip ke batas gambar), lalu **pad ke persegi (di tengah)** dan resize bilinear ke **150×150**.
4. Kanal **RGB** (bukan BGR), nilai piksel 0–255.
5. Normalisasi: `(piksel − mean_rgb) / 256` dengan `mean_rgb = [122.782, 117.001, 104.298]`.
6. Output 128-d **tanpa** normalisasi L2 di sisi model (norma kira-kira mendekati 1 tetapi tidak tepat 1).

## 4. Data tersimpan

`participants.face_descriptor` (JSON): satu vector 128-d (format lama / pendaftaran admin) **atau** 3–10 vector sampel wajah depan dari pendaftaran terpandu (sebaran tiap vector ke rata-ratanya ≤ 0.55). Server mencocokkan ke **vector terdekat** (`FaceDescriptor::minDistance`).

## 5. Metrik & threshold (terpadu)

| Jalur | Normalisasi L2 | Metrik | Cocok bila | Nilai berlaku |
|---|---|---|---|---|
| Android (`POST /api/v1/attendance`), 1:1 dengan wajah peserta sendiri | **Ya, kedua sisi** (input & setiap sampel tersimpan) | Euclidean ke sampel 128-d terdekat | `distance ≤ threshold` | `FACE_THRESHOLD`, default **0.45** |

- 0.45 setelah L2 ≈ 0.58 jarak mentah lama web (norma descriptor face-api.js mentah ≈ 1.3), jadi tingkat keketatan web dipertahankan. Threshold Android lama (0.85 setelah L2) ±2× lebih longgar dan sudah dihapus.
- Sampel tersimpan yang bukan 128-d (mis. 512-d dari FaceNet Android lama) diabaikan. Peserta yang hanya memiliki sampel seperti itu mendapat `face_reenroll_required` dan harus mendaftar ulang. Daftar peserta: `php artisan face:update-descriptor --list --reenroll`.
- Input yang bukan 128-d ditolak `426 face_model_mismatch` (sementara bisa dimatikan dengan `FACE_ENFORCE_DIMENSIONS=false` selama transisi rilis APK).
- Gagal 5× dalam 10 menit mengunci presensi wajah peserta selama 15 menit (`429 face_locked`).
- Perubahan threshold hanya setelah kalibrasi dengan pasangan wajah nyata (FAR/FRR); test `FaceDescriptorParityTest` mengunci nilai default.

## 6. Format request

| Endpoint | Content-Type | Field |
|---|---|---|
| `POST /api/v1/attendance` | `application/json` | `"face_descriptor": [f1, …, f128]` — wajib, tepat 128 (tanpa field → 426 `app_update_required`, dimensi lain → 426 `face_model_mismatch`); satu vector; opsional `"face_model": "faceapi-resnet34-128"` |
| `POST /api/v1/me/face-enrollment` | `application/json` | `"descriptors": [[128], …]` 3–10 sampel konsisten, `"model": "faceapi-resnet34-128"`, `"photo"` data URL opsional; status → `pending` |
| `POST /api/v1/me/photo-change-requests` | `multipart/form-data` | `face_descriptor[]=f1 … face_descriptor[]=f128` — opsional; bila dikirim harus tepat 128 (selain itu 422). Saat disetujui, hanya descriptor kompatibel yang menggantikan data aktif |

## 7. Syarat untuk Android

1. Descriptor **harus berasal dari model yang sama** (bobot face-api.js `FaceRecognitionNet`/dlib ResNet, dikonversi mis. ke TFLite) **dengan preprocessing di §3**. Model lain berdimensi 128 (mis. MobileFaceNet/FaceNet-128) **lolos cek dimensi tetapi jaraknya tidak bermakna** — server tidak dapat mendeteksinya, dan hasilnya false reject/false accept.
2. Kirim vector mentah atau ter-L2 — server menormalisasi ulang untuk jalur Android. Jangan membulatkan agresif (≥ 6 desimal).
3. Satu descriptor per aksi presensi, dengan satu `Idempotency-Key`; retry jaringan memakai key & payload yang sama.
4. Jangan mengambil keputusan cocok/tidak di perangkat, jangan menyimpan descriptor terdaftar di perangkat, dan jangan mencatat descriptor/foto/token ke log (Logcat, Crashlytics, analytics).
5. Pendaftaran wajah dari Android memakai `POST /api/v1/me/face-enrollment` (3–10 sampel, menunggu persetujuan admin). Wajah yang didaftarkan lewat web maupun Android berlaku untuk presensi wajah Android, karena model & aturannya sama.
