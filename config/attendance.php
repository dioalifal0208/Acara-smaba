<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Pencocokan Wajah
    |--------------------------------------------------------------------------
    |
    | threshold_web : jarak Euclidean maksimum descriptor face-api.js (web) agar dianggap cocok.
    | threshold_mobile : jarak maksimum setelah normalisasi L2 untuk aplikasi Android.
    | Nilai awal dipertahankan sampai kalibrasi dengan data nyata (Fase 4).
    |
    */

    'face' => [
        'threshold_web' => (float) env('FACE_THRESHOLD_WEB', 0.58),
        'threshold_mobile' => (float) env('FACE_THRESHOLD_MOBILE', 0.85),

        // Batas percobaan endpoint /api/face/match per pengguna login per menit.
        // Scanner admin memindai banyak orang, jadi batasnya longgar.
        'rate_per_minute' => (int) env('FACE_MATCH_RATE_PER_MINUTE', 30),

        // Kunci presensi wajah peserta setelah gagal berulang (anti coba-coba wajah/foto).
        'max_failures' => (int) env('FACE_MATCH_MAX_FAILURES', 5),
        'failure_window_minutes' => 10,
        'lockout_minutes' => 15,
    ],

];
