<?php

use App\Http\Controllers\PrivateFileController;
use App\Support\PrivateFile;
use Illuminate\Support\Facades\Route;

// File pribadi peserta (foto wajah, foto presensi, tanda tangan, dokumen izin).
// Hanya bisa dibuka lewat URL bertanda tangan sementara buatan server (App\Support\PrivateFile).
// Dimuat di luar grup `web` (bootstrap/app.php): tanpa session, cookie, CSRF, dan Inertia, jadi
// puluhan foto sekaligus tidak membuka/menulis session di database. Tanda tangan URL sudah
// menjadi bukti izin akses, dan browser menyimpan file sampai URL kedaluwarsa.
Route::get('/files/{type}/{id}', [PrivateFileController::class, 'show'])
    ->whereIn('type', array_keys(PrivateFile::TYPES))
    ->whereNumber('id')
    ->middleware('signed')
    ->name('files.show');
