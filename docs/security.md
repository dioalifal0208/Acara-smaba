# Kebijakan Data Biometrik dan Data Pribadi

Berlaku untuk aplikasi Presensi SMABA (web dan Android). Dokumen ini menjelaskan data apa yang disimpan, untuk apa, siapa yang boleh mengakses, berapa lama disimpan, dan cara penghapusannya.

> **Perlu konfirmasi sekolah:** bagian bertanda ⚠️ adalah usulan teknis. Kepala sekolah/pengelola perlu menetapkan nilainya dan menyampaikannya kepada peserta.

## 1. Data yang disimpan

| Data | Contoh | Lokasi |
|---|---|---|
| Data titik wajah (descriptor) | 3 sampel vector 128 angka dari wajah menghadap depan | Database, kolom `participants.face_descriptor` |
| Foto wajah pendaftaran | Foto saat pendaftaran wajah | Disk privat `storage/app/private/faces` |
| Foto kandidat ganti foto | Foto pengajuan ganti wajah dari Android | Disk privat `photo-change-requests` |
| Foto presensi | Foto saat presensi wajah | Disk privat `attendance-face-captures` |
| Tanda tangan presensi | Tanda tangan self check-in | Disk privat `attendance-signatures` |
| Dokumen izin | Surat dokter, surat tugas | Disk privat `dokumen_izin` |

## 2. Tujuan

Semata-mata untuk **mencatat dan memverifikasi kehadiran** (presensi wajah, rekap, dan bukti izin). Data tidak dipakai untuk tujuan lain dan tidak dibagikan ke pihak ketiga.

## 3. Persetujuan

Sebelum kamera pendaftaran wajah menyala, aplikasi menampilkan penjelasan singkat (tujuan, siapa yang dapat mengakses, cara penghapusan) dan meminta persetujuan ("Setuju & Mulai"). Pendaftaran oleh admin dilakukan dengan sepengetahuan peserta.

## 4. Akses

- File pribadi **tidak pernah** disimpan di folder publik web. File hanya disajikan lewat URL bertanda tangan sementara (berlaku 60 menit) yang dibuat server untuk **admin** atau **pemilik data** (`App\Support\PrivateFile`).
- Data titik wajah dan path file tidak pernah ikut dikirim ke browser atau endpoint publik (`$hidden` pada model `Participant`).
- Log aplikasi tidak boleh memuat data wajah, password, token, atau dokumen. Penyaring `App\Logging\RedactSensitiveData` mengganti nilai kunci sensitif dengan `[REDACTED]` sebagai pengaman terakhir.

## 5. Retensi dan penghapusan

| Kejadian | Yang dihapus otomatis |
|---|---|
| Admin menghapus peserta | Data wajah, foto wajah, foto kandidat, foto presensi, tanda tangan, dan dokumen izin milik peserta |
| Admin menghapus workcode | Foto presensi, tanda tangan, dan dokumen izin yang terkait workcode itu |
| Admin menolak/menghapus wajah peserta | Data wajah dan foto wajah |
| Admin menyetujui/menolak ganti foto | Foto lama atau foto kandidat yang tidak dipakai |

- ⚠️ Usulan: data wajah peserta yang sudah tidak aktif (lulus/mutasi) dihapus paling lambat **30 hari** setelah status nonaktif.
- ⚠️ Usulan: foto presensi dan tanda tangan disimpan selama **1 tahun ajaran** untuk keperluan rekap, lalu dihapus.
- Log aplikasi disimpan maksimal 14 hari (`LOG_DAILY_DAYS`).
- Peserta dapat meminta penghapusan data wajahnya kepada admin; admin memakai tombol **Hapus Data Wajah** di menu Peserta.

## 6. Insiden kebocoran data

1. Amankan: cabut akses yang bocor (ganti password, nonaktifkan akun, rotasi kunci).
2. Catat: apa yang bocor, kapan, berapa peserta terdampak.
3. Laporkan kepada kepala sekolah dan beri tahu peserta terdampak. Untuk data biometrik, ikuti ketentuan UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (pemberitahuan tertulis paling lambat 3×24 jam sejak kegagalan pelindungan diketahui).

## 7. Catatan teknis

- **Enkripsi `face_descriptor` di database:** dievaluasi dan ditunda. Pencocokan wajah publik (scanner admin, self check-in) masih membandingkan ke seluruh peserta yang disetujui, sehingga enkripsi menambah beban dekripsi per permintaan, dan kolomnya perlu dimigrasi dari JSON ke teks. Dikerjakan setelah pencocokan publik menjadi 1:1 (Fase 2).
- Pemeriksaan wajah hidup (senyum + cek 3D) berjalan di browser dan menahan foto/layar, tetapi bukan pengamanan mutlak.
