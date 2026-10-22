<?php

use App\Http\Controllers\WebSyncController;
use Illuminate\Support\Facades\Route;

// Sinyal sinkronisasi Android → web, dipanggil tiap beberapa detik oleh setiap tab admin.
// Dimuat di luar grup `web` (bootstrap/app.php): tanpa session, cookie, CSRF, dan Inertia, jadi tidak
// membuka/menulis session di database. Sengaja tanpa throttle: rate limiter memakai cache default
// (database di produksi). Isinya hanya angka versi dari cache file, bukan data pribadi.
Route::get('/sync/signal', [WebSyncController::class, 'signal'])->name('sync.signal');
