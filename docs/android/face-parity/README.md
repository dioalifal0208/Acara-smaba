# Paket Paritas Wajah untuk Android

Tujuan: Android menghasilkan descriptor yang **setara** dengan web (face-api.js 0.22.2), lalu mengirimnya ke Laravel. Keputusan cocok/tidak tetap di server.
Ringkasan model & alur server: [`docs/api/FACE_DESCRIPTOR_COMPATIBILITY.md`](../../api/FACE_DESCRIPTOR_COMPATIBILITY.md).

| # | Item | Status |
|---|---|---|
| 1 | Model landmark (TFLite) + dokumentasi titik | TFLite fp32 tersedia, paritas CPU desktop lulus; Android belum diuji (§1, §6) |
| 2 | Model embedding (TFLite) + versi, SHA-256, lisensi | TFLite fp32 tersedia, hash dan hasil verifikasi di conversion_report.json (§2, §6) |
| 3 | Spesifikasi preprocessing | **Tersedia** (§3), diverifikasi terhadap kode face-api.js |
| 4 | Fixture validasi non-sensitif | **Tersedia** untuk paritas numerik (`fixtures.json`); pasangan wajah nyata cocok/tidak cocok **belum** (§4) |
| 5 | Konfirmasi server | **Terkonfirmasi**, dikunci test (§5) |

---

## 1. Model landmark 68 titik

- Model web: `FaceLandmark68Net` face-api.js (CNN depthwise-separable + dense block, ±350 KB). **Bukan** `shape_predictor_68_face_landmarks.dat` dlib; dilatih penulis face-api.js pada ±35 ribu gambar.
- Bobot sumber: `public/models/face_landmark_68_model-*` (SHA-256 di `fixtures.json → models`).
- **Input TFLite**: crop kotak deteksi wajah dari frame asli (dipotong di batas gambar, koordinat dibulatkan ke bawah) → pad ke persegi dengan **nol, gambar di tengah** → resize bilinear **112×112** → RGB float32 **0–255**, NHWC `[1,112,112,3]`. Normalisasi `(px − [122.782, 117.001, 104.298]) / 255` berada **di dalam model**. Android tidak boleh menormalisasi lagi.
- **Output**: 136 float = 68 × (x, y) berselang-seling, relatif terhadap persegi 112 yang sudah dipad. Konversi ke piksel gambar: `x_px = (x·112 − padX) / lebarSkala · lebarCrop + box.x` (lihat `FaceLandmark68NetBase.postProcess`); `fixtures.json → pipeline` memuat hasil relatif dan piksel untuk dicocokkan.
- **Urutan titik** (skema iBUG 300-W, indeks 0-based, "kiri/kanan" = sisi gambar, bukan sisi subjek):

  | Indeks | Bagian |
  |---|---|
  | 0–16 | Rahang |
  | 17–21 / 22–26 | Alis kiri / kanan |
  | 27–35 | Hidung |
  | 36–41 | Mata kiri (`getLeftEye`) |
  | 42–47 | Mata kanan (`getRightEye`) |
  | 48–67 | Mulut (`getMouth`) |

- **Koordinat & orientasi**: piksel gambar, origin kiri-atas, x ke kanan, y ke bawah, **setelah** frame kamera diputar tegak sesuai `rotationDegrees`. Gambar inferensi **tidak dicerminkan**, termasuk kamera depan; preview boleh tercermin. Konvensi ini sama untuk pendaftaran dan presensi, mengikuti data piksel `<video>` web. Descriptor tidak simetris terhadap mirror.

## 2. Model embedding

- Model web: `FaceRecognitionNet` face-api.js 0.22.2 = ResNet-34 ringan, setara jaringan contoh `dnn_face_recognition_ex` dlib (`dlib_face_recognition_resnet_model_v1`, 99.38 % LFW menurut README face-api.js). Output **128 float32**, tanpa L2 (norma ±1.29–1.30 pada fixture).
- Bobot sumber: `public/models/face_recognition_model-shard1`, `-shard2`, `-weights_manifest.json` (SHA-256 di `fixtures.json → models`).
- Input TFLite: RGB float32 **0–255**, NHWC `[1,150,150,3]`. Normalisasi `(px − [122.782, 117.001, 104.298]) / 256` berada **di dalam model**; output `[1,128]` belum dinormalisasi L2.
- **Lisensi**:
  - Kode face-api.js: MIT (`node_modules/face-api.js/LICENSE`, © 2018 Vincent Mühler).
  - Bobot embedding: dilatih Davis King (dlib); repo `davisking/dlib-models` menyatakan file-filenya dirilis ke domain publik (CC0-1.0).
  - Bobot landmark face-api.js: didistribusikan dalam repo MIT; dataset latihnya tidak didokumentasikan. **Catatan**: bila tim Android memilih landmark dlib `shape_predictor_68_face_landmarks.dat` sebagai pengganti, lisensinya **melarang penggunaan komersial** (dataset iBUG 300-W).
  - Konfirmasi akhir lisensi untuk distribusi di Play Store sebaiknya dilakukan pihak yang berwenang.

## 3. Preprocessing (sumber: face-api.js 0.22.2, jalur tensor)

1. Deteksi wajah → kotak `box` (web: TinyFaceDetector, `scoreThreshold` 0.5). Detektor lain boleh, tetapi kotak berbeda menggeser landmark sedikit; ukur dampaknya dengan fixture §4.
2. Landmark 68 (§1), digeser ke koordinat gambar: `p + (box.x, box.y)`.
3. Titik acuan: `L` = rata-rata titik 36–41, `R` = rata-rata 42–47, `M` = rata-rata 48–67.
4. Crop gaya dlib (`FaceLandmarks.alignDlib`), **tanpa rotasi**:
   ```
   size = floor(((|M−L| + |M−R|) / 2) / 0.45)
   c    = (L + R + M) / 3
   x    = floor(max(0, c.x − 0.5  · size))
   y    = floor(max(0, c.y − 0.43 · size))
   rect = (x, y, min(size, W + x), min(size, H + y))
   ```
   Lalu dipotong di batas gambar: `w = min(rect.right − x, W − x)`, `h = min(rect.bottom − y, H − y)`, semua dibulatkan ke bawah (`Box.clipAtImageBorders`).
5. Pad ke persegi: sisi pendek ditambah piksel **0 (hitam)**, gambar **di tengah** (`padToSquare`): untuk selisih `d`, pad akhir (kanan/bawah) = `round(d/2)` (Math.round, .5 dibulatkan ke atas), pad awal = `d − akhir`.
6. Resize bilinear ke 150×150 (`tf.image.resizeBilinear`, `alignCorners=false`, tanpa half-pixel centers). Bila sudah 150×150, tidak di-resize.
7. Android mengirim RGB float32 0–255 (bukan BGR). Model embedding menjalankan `(px − [122.782, 117.001, 104.298]) / 256` secara internal. Jangan lakukan normalisasi kedua di Android.
8. Inferensi → 128 float. Android boleh L2-normalisasi sebelum kirim (§5).

Catatan web: di browser, langkah 5–6 berjalan lewat canvas (`imageToSquare`: skala dulu baru ditempel di tengah), dengan interpolasi milik browser. Jadi web sendiri tidak bit-exact antar-browser; acuan Android adalah jalur tensor di atas.

## 4. Fixture (`fixtures.json`, `inputs/*.rgb`)

Dibuat ulang dengan `node scripts/face-parity/generate-fixtures.cjs` (deterministik, backend CPU tfjs-core 1.7.0). Semua input **sintetis** (gradien + derau), bukan wajah, jadi tidak mengandung data biometrik.

- `inputs/*.rgb`: RGB uint8 HWC mentah tanpa header. Bisa juga dibangkitkan ulang:
  `v = (x·gx + y·gy + c·85 + (xorshift32() & noiseMask)) & 255`, urutan loop y → x → c, xorshift32: `s ^= s<<13; s ^= s>>>17; s ^= s<<5` (uint32), parameter di `generator`. Cocokkan `sha256`.
- `recognition[]`: crop 150×150 siap-model → `descriptor_raw` / `descriptor_l2`. `recog_120x150_pad` menguji pad + resize (langkah 5–6).
- `distances[]`: jarak Euclidean mentah & setelah L2 antar-fixture. Laravel diuji menghasilkan angka yang sama (`tests/Feature/Api/FaceDescriptorParityTest.php`).
- `pipeline`: gambar 320×240 + kotak deteksi tetap → landmark (relatif & piksel) → titik acuan → `aligned_rect` → descriptor. Menguji langkah 1–8 tanpa detektor.
- `alignment_cases[]`: uji murni rumus crop (langkah 4), termasuk kasus terpotong di tepi.

**Toleransi penerimaan konversi** (TFLite fp32 di CPU built-in, tanpa GPU delegate/fp16/kuantisasi; konfigurasi delegate Android diuji terpisah):

| Uji | Batas |
|---|---|
| `recognition[]` per elemen | `|Δ| ≤ 1e-3` |
| `recognition[]` jarak L2(Android, web) | `≤ 5e-3` |
| `pipeline` landmark | `≤ 0.5 px` |
| `pipeline.aligned_rect` | identik (bilangan bulat) |
| `pipeline` jarak L2 descriptor | `≤ 1e-2` |

Toleransi ini mengukur paritas numerik, bukan keamanan pencocokan. Nilai yang berada dekat threshold tetap dapat berubah keputusan akibat selisih numerik; evaluasi pasangan wajah nyata tetap diperlukan.

**Belum tersedia: pasangan wajah nyata (cocok / tidak cocok).** Fixture sintetis tidak bisa dipakai untuk itu. Pada fixture ini, jarak antar-gambar derau saja sudah 0.21–0.41 setelah L2, di bawah 0.85. Untuk pasangan nyata dibutuhkan foto relawan dengan persetujuan tertulis, atau dataset publik yang lisensinya mengizinkan; foto peserta tidak boleh dipakai. Setelah ada, tambahkan ke generator: descriptor web per foto dan jarak yang diharapkan.

## 5. Konfirmasi server

Diverifikasi di kode dan dikunci oleh `tests/Feature/Api/FaceDescriptorParityTest.php` dan `tests/Feature/Api/UnifiedFaceMatchTest.php`:

- **Satu aturan untuk semua jalur** (`app/Support/FaceMatcher.php`): web peserta 1:1, scanner admin 1:N, dan `POST /api/v1/attendance` menormalisasi L2 **kedua sisi** (input & setiap sampel 128-d tersimpan), lalu mengambil jarak Euclidean **terdekat**. Diterima bila `jarak ≤ FACE_THRESHOLD` (default **0.45**). Android boleh mengirim vector mentah atau sudah L2; hasilnya sama.
- 0.45 setelah L2 setara 0.58 jarak mentah web lama (norma mentah ±1.3). Threshold Android lama 0.85 (±2× lebih longgar, temuan S10) sudah dihapus.
- Input bukan 128-d ditolak `426 face_model_mismatch`; data tersimpan tanpa sampel 128-d menghasilkan `face_reenroll_required`.
- Test gagal bila default threshold bergeser. Perubahan threshold hanya setelah evaluasi dataset dan persetujuan eksplisit; nilai env produksi tetap perlu dicek saat deploy.

## 6. Konversi TFLite fp32

Bobot face-api.js tersimpan dalam format manifest tfjs-core (bukan SavedModel/graph model). Alur resmi menggunakan `export-weights.cjs` lalu **`convert_tflite.py` (underscore)**. Berkas `convert-tflite.py` (hyphen) adalah alternatif lama dan tidak dipakai untuk artefak ini.

Jalankan dari root backend di PowerShell:

```powershell
& C:/laragon/bin/python/python-3.12/python.exe -m venv .venv-tflite/conversion-2.16.1
& .venv-tflite/conversion-2.16.1/Scripts/python.exe -m pip install tensorflow==2.16.1
node scripts/face-parity/export-weights.cjs .venv-tflite/decoded-weights
$env:TF_ENABLE_ONEDNN_OPTS = '0'
& .venv-tflite/conversion-2.16.1/Scripts/python.exe scripts/face-parity/test_convert_tflite.py
& .venv-tflite/conversion-2.16.1/Scripts/python.exe scripts/face-parity/convert_tflite.py .venv-tflite/decoded-weights docs/android/face-parity/models
```

Exporter memakai bobot float32 yang sudah di-decode/de-kuantisasi face-api.js. Converter membangun ulang operasi jaringan, memverifikasi TensorFlow dan TFLite terhadap fixture, dan keluar nonzero jika ada ketidaksesuaian.

Venv konversi diisolasi karena venv induk sedang dipakai installer lain. Keduanya berada di bawah `.venv-tflite/` yang diabaikan Git.

Hasil: `models/face_landmark_68.tflite`, `models/face_recognition.tflite`, serta `models/conversion_report.json`. Model akhir hanya ditulis jika semua pemeriksaan lolos. Sebelum memakai artefak, cocokkan SHA-256 model dan fixture dengan laporan serta pastikan `pass: true`.

Model memakai float32 built-in TFLite ops, tanpa fp16, kuantisasi, atau GPU delegate. Laporan merekam bentuk tensor, ops, versi TensorFlow/NumPy, hash converter, dan kontrak normalisasi internal.

Pada host Windows ini, XNNPACK bawaan TensorFlow 2.16.1 menghasilkan output sesuai toleransi tetapi crash saat interpreter dibersihkan dengan exit code `-1073740940` (`0xC0000374`, heap corruption). Konversi resmi memakai `BUILTIN_WITHOUT_DEFAULT_DELEGATES`, satu thread; proses pemeriksaan harus keluar 0. Model tetap memakai ops standar. Ini tidak membuktikan ada masalah yang sama di Android; delegate Android harus diuji dengan fixture.

Kelulusan di desktop belum membuktikan kelulusan runtime Android. Jalankan kembali fixture pada Realme sebelum mengaktifkan presensi wajah. Threshold Laravel tidak diubah oleh konversi.
