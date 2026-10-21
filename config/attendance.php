<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Toleransi Terlambat (presensi harian)
    |--------------------------------------------------------------------------
    |
    | Presensi datang workcode harian tetap dibuka sampai sekian menit setelah jam datang
    | selesai; presensi di rentang itu tercatat hadir tetapi terlambat. Tidak berlaku untuk
    | presensi pulang maupun workcode kegiatan. Batas toleransi tidak melewati tengah malam.
    |
    */

    'late_tolerance_minutes' => (int) env('ATTENDANCE_LATE_TOLERANCE_MINUTES', 60),

    /*
    |--------------------------------------------------------------------------
    | Pencocokan Wajah
    |--------------------------------------------------------------------------
    |
    | Presensi wajah hanya lewat aplikasi Android (POST /api/v1/attendance, pencocokan 1:1);
    | model face-api.js FaceRecognitionNet (dlib ResNet-34) 128-d, sama dengan pendaftaran web.
    | Kedua sisi (input & setiap sampel tersimpan) dinormalisasi L2, lalu jarak Euclidean ke
    | sampel terdekat; cocok bila jarak <= threshold. 0.45 setelah L2 ≈ 0.58 jarak mentah lama
    | (norma descriptor face-api.js mentah ≈ 1.3). Lihat docs/api/FACE_DESCRIPTOR_COMPATIBILITY.md.
    |
    */

    'face' => [
        'threshold' => (float) env('FACE_THRESHOLD', 0.45),

        // Temporary rollout switch while the Android 128-d APK is being distributed.
        'enforce_dimensions' => (bool) env('FACE_ENFORCE_DIMENSIONS', true),

        // Kunci presensi wajah peserta setelah gagal berulang (anti coba-coba wajah/foto).
        'max_failures' => (int) env('FACE_MATCH_MAX_FAILURES', 5),
        'failure_window_minutes' => 10,
        'lockout_minutes' => 15,
    ],

    /*
    |--------------------------------------------------------------------------
    | Kunci Perangkat (aplikasi Android)
    |--------------------------------------------------------------------------
    |
    | Akun peserta terkunci ke HP pertama yang dipakai login (ANDROID_ID). Pindah HP harus
    | lewat pengajuan yang disetujui admin. Selama aplikasi Android versi lama (yang belum
    | mengirim device_id) masih beredar, biarkan require_device_id = false: login tanpa
    | device_id tetap diterima tanpa penguncian. Setelah semua peserta memakai versi baru,
    | set DEVICE_LOCK_REQUIRE_ID=true agar aplikasi lama ditolak (426, wajib update).
    |
    */

    /*
    |--------------------------------------------------------------------------
    | Anti Fake GPS (aplikasi Android)
    |--------------------------------------------------------------------------
    |
    | Aplikasi mengirim sinyal integritas lokasi; server menolak presensi dan mencatatnya
    | (tabel location_integrity_violations, halaman admin Perangkat). Lokasi mock dan mock app
    | yang aktif selalu ditolak. require_signals=true menolak aplikasi lama yang belum mengirim
    | sinyal (426) — aktifkan setelah APK baru tersebar ke semua peserta.
    |
    */

    'location_integrity' => [
        'block_fake_apps' => (bool) env('ANTI_FAKE_GPS_BLOCK_FAKE_APPS', true),
        'block_root' => (bool) env('ANTI_FAKE_GPS_BLOCK_ROOT', true),
        'block_hooking' => (bool) env('ANTI_FAKE_GPS_BLOCK_HOOKING', true),
        'require_signals' => (bool) env('ANTI_FAKE_GPS_REQUIRE_SIGNALS', false),
    ],

    'device_lock' => [
        'require_device_id' => (bool) env('DEVICE_LOCK_REQUIRE_ID', false),
    ],

];
