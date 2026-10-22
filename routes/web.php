<?php

use App\Http\Controllers\AdminLeaveController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\DeviceController;
use App\Http\Controllers\FaceRecognitionController;
use App\Http\Controllers\HolidayController;
use App\Http\Controllers\LeaveRequestController;
use App\Http\Controllers\LocationIntegrityLogController;
use App\Http\Controllers\ParticipantController;
use App\Http\Controllers\PhotoChangeRequestController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SelfCheckInController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\SyncController;
use App\Http\Controllers\VerificationController;
use App\Http\Controllers\WorkcodeController;
use App\Models\Attendance;
use App\Models\DeviceChangeRequest;
use App\Models\LeaveRequest;
use App\Models\LocationIntegrityViolation;
use App\Models\Participant;
use App\Models\Workcode;
use App\Support\AdminDashboardStats;
use App\Support\AdminNotifications;
use App\Support\PrivateFile;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

Route::get('/', function () {
    $user = auth()->user();

    // Live Stats untuk Guest & Admin
    $totalParticipants = Participant::count();
    $totalAttended = Attendance::distinct('participant_id')->count('participant_id');
    $stats = [
        'total' => $totalParticipants,
        'hadir' => $totalAttended,
        'belum' => $totalParticipants - $totalAttended,
    ];

    // Ambil 5 aktivitas presensi terbaru (disensor namanya untuk privasi)
    $recentScans = Attendance::with('participant')
        ->orderBy('created_at', 'desc')
        ->take(5)
        ->get()
        ->map(function ($attendance) {
            $name = $attendance->participant->nama ?? 'Unknown';
            // Sensor: "Dio Alif" menjadi "Dio A."
            $parts = explode(' ', $name);
            $maskedName = $parts[0];
            if (count($parts) > 1) {
                $maskedName .= ' '.substr($parts[count($parts) - 1], 0, 1).'.';
            }

            return [
                'id' => $attendance->id,
                'nama' => $maskedName,
                'waktu' => $attendance->created_at->format('H:i'),
            ];
        });

    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'initialStats' => $stats,
        'recentScans' => $recentScans,
    ]);
});

Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    // Dashboard route
    Route::get('/dashboard', function () {
        $activeWorkcodes = Workcode::getActiveWorkcodes();
        $activeWorkcode = $activeWorkcodes->first();
        $totalParticipants = Participant::count();
        $totalAttended = $activeWorkcode
            ? Attendance::where('workcode_id', $activeWorkcode->id)->distinct('participant_id')->count('participant_id')
            : 0;

        $pendingLeaveCount = LeaveRequest::where('status_approval', 'pending')->count();

        return Inertia::render('Dashboard', [
            'activeWorkcode' => $activeWorkcode,
            'activeWorkcodes' => $activeWorkcodes,
            'pendingLeaveCount' => $pendingLeaveCount,
            'pendingDeviceCount' => DeviceChangeRequest::where('status', 'pending')->count(),
            'fakeGpsBlockedToday' => LocationIntegrityViolation::where('blocked', true)->whereDate('created_at', today())->count(),
            'stats' => [
                'total' => $totalParticipants,
                'hadir' => $totalAttended,
                'belum' => $totalParticipants - $totalAttended,
            ],
            'weekly' => AdminDashboardStats::weekly(),
            'lateness' => AdminDashboardStats::lateness(),
            'methods' => AdminDashboardStats::methods(),
            'recentAttendances' => AdminDashboardStats::recent(),
        ]);
    })->name('dashboard');

    // Notifikasi admin: pekerjaan yang menunggu verifikasi (dipolling oleh lonceng notifikasi)
    Route::get('/admin/notifications', fn () => response()->json(AdminNotifications::summary()))
        ->name('admin.notifications');

    // Leave Approvals
    Route::get('/admin/leaves', [AdminLeaveController::class, 'index'])->name('admin.leave.index');
    Route::post('/admin/leaves/{leaveRequest}/approve', [AdminLeaveController::class, 'approve'])->name('admin.leave.approve');
    Route::post('/admin/leaves/{leaveRequest}/reject', [AdminLeaveController::class, 'reject'])->name('admin.leave.reject');

    // Event management routes
    Route::get('/workcodes', [WorkcodeController::class, 'index'])->name('workcodes.index');
    Route::post('/workcodes', [WorkcodeController::class, 'store'])->name('workcodes.store');
    Route::put('/workcodes/{workcode}', [WorkcodeController::class, 'update'])->name('workcodes.update');
    Route::post('/workcodes/{workcode}/activate', [WorkcodeController::class, 'activate'])->name('workcodes.activate');
    Route::post('/workcodes/{workcode}/deactivate', [WorkcodeController::class, 'deactivate'])->name('workcodes.deactivate');
    Route::delete('/workcodes/{workcode}', [WorkcodeController::class, 'destroy'])->name('workcodes.destroy');

    // Tombol Sync (petir): minta semua aplikasi Android memuat ulang data dari server.
    Route::post('/sync', [SyncController::class, 'push'])->name('sync.push');

    // Participant management routes
    Route::get('/participants', [ParticipantController::class, 'index'])->name('participants.index');
    Route::get('/participants/template', [ParticipantController::class, 'downloadTemplate'])->name('participants.template');
    Route::post('/participants', [ParticipantController::class, 'store'])->name('participants.store');
    Route::post('/participants/import', [ParticipantController::class, 'import'])->name('participants.import');
    Route::post('/participants/import/preview', [ParticipantController::class, 'importPreview'])->name('participants.import.preview');
    Route::post('/participants/import/confirm', [ParticipantController::class, 'importConfirm'])->name('participants.import.confirm');
    Route::delete('/participants/bulk-delete', [ParticipantController::class, 'bulkDestroy'])->name('participants.bulk-destroy');
    Route::put('/participants/{participant}', [ParticipantController::class, 'update'])->name('participants.update');
    Route::post('/participants/{participant}/qr/regenerate', [ParticipantController::class, 'regenerateQrToken'])->name('participants.qr.regenerate');
    Route::delete('/participants/{participant}', [ParticipantController::class, 'destroy'])->name('participants.destroy');

    // Face Registration routes (Admin)
    Route::post('/api/participants/{participant}/face', [FaceRecognitionController::class, 'register'])->name('participants.face.register');
    Route::delete('/api/participants/{participant}/face', [FaceRecognitionController::class, 'deleteFace'])->name('participants.face.delete');

    // Face Approval routes (Admin)
    Route::post('/admin/participants/{participant}/face/approve', [FaceRecognitionController::class, 'approveFace'])->name('participants.face.approve');
    Route::post('/admin/participants/{participant}/face/reject', [FaceRecognitionController::class, 'rejectFace'])->name('participants.face.reject');

    // Photo change request verification (Admin)
    Route::post('/admin/photo-change-requests/{photoChangeRequest}/approve', [PhotoChangeRequestController::class, 'approve'])->name('photo-change-requests.approve');
    Route::post('/admin/photo-change-requests/{photoChangeRequest}/reject', [PhotoChangeRequestController::class, 'reject'])->name('photo-change-requests.reject');

    // Kunci perangkat Android: pengajuan pindah HP & reset (Admin)
    Route::get('/admin/devices', [DeviceController::class, 'index'])->name('admin.devices.index');
    Route::post('/admin/device-change-requests/{deviceChangeRequest}/approve', [DeviceController::class, 'approve'])->name('admin.device-change-requests.approve');
    Route::post('/admin/device-change-requests/{deviceChangeRequest}/reject', [DeviceController::class, 'reject'])->name('admin.device-change-requests.reject');
    Route::post('/admin/users/{user}/device/reset', [DeviceController::class, 'reset'])->name('admin.devices.reset');
    Route::post('/admin/devices/reset-all', [DeviceController::class, 'resetAll'])->name('admin.devices.reset-all');

    // Catatan anti fake GPS dari aplikasi Android (Admin)
    Route::get('/admin/fake-gps', [LocationIntegrityLogController::class, 'index'])->name('admin.fake-gps.index');

    // Master QR routes
    Route::get('/admin/master-qr', [SelfCheckInController::class, 'masterQr'])->name('admin.master-qr');
    Route::post('/admin/master-qr/regenerate', [SelfCheckInController::class, 'regenerateToken'])->name('admin.master-qr.regenerate');

    // Report routes
    Route::get('/report', [AttendanceController::class, 'report'])->name('report');
    Route::get('/report/individual/{workcode}/{participant}', [AttendanceController::class, 'getIndividualRecap'])->name('report.individual');
    Route::get('/workcodes/{workcode}/export', [AttendanceController::class, 'exportAttendance'])->name('workcodes.export');
    Route::get('/workcodes/{workcode}/qr-signature', [AttendanceController::class, 'qrSignature'])->name('workcodes.qr-signature');

    // Manual Attendance Management (Admin)
    Route::post('/admin/attendances', [AttendanceController::class, 'manualStore'])->name('admin.attendances.store');
    Route::put('/admin/attendances/{attendance}', [AttendanceController::class, 'manualUpdate'])->name('admin.attendances.update');
    Route::delete('/admin/attendances/{attendance}', [AttendanceController::class, 'manualDestroy'])->name('admin.attendances.destroy');

    // Scanner routes (Admin only)
    Route::get('/scanner', [AttendanceController::class, 'scanner'])->name('scanner');
    Route::post('/scan', [AttendanceController::class, 'scan'])->name('scan');
    Route::post('/api/scan', [AttendanceController::class, 'apiScan'])->name('api.scan');

    // Settings routes
    Route::get('/admin/settings', [SettingController::class, 'edit'])->name('admin.settings');
    Route::post('/admin/settings', [SettingController::class, 'update'])->name('admin.settings.update');
});

Route::middleware(['auth', 'verified', 'role:participant'])->group(function () {
    // Participant Dashboard
    Route::get('/participant/dashboard', function () {
        $activeWorkcode = Workcode::getActive();

        return Inertia::render('Participant/Dashboard', [
            'activeWorkcode' => $activeWorkcode,
            'participant' => auth()->user()->participant?->append('photo_url'), // pemilik data: boleh melihat fotonya sendiri
        ]);
    })->name('participant.dashboard');

    // Participant Face Registration & Scanner
    Route::get('/participant/face-registration', function () {
        return Inertia::render('Participant/FaceRegistration', [
            'participant' => auth()->user()->participant,
        ]);
    })->name('participant.face-registration');

    Route::post('/api/participants/{participant}/face/self', [FaceRecognitionController::class, 'registerSelf'])->name('participants.face.self-register');

    // Leave request submission
    Route::post('/participant/leave', [LeaveRequestController::class, 'store'])->name('leave.store');
    Route::get('/participant/leave-history', [LeaveRequestController::class, 'history'])->name('leave.history');
});

Route::middleware('auth')->group(function () {
    // QR pribadi peserta: hanya admin atau peserta pemiliknya (dicek di ParticipantController).
    // Isi QR = token presensi, jadi tidak boleh bisa diambil publik.
    Route::get('/participants/{participant}/qr', [ParticipantController::class, 'qrCode'])->name('participants.qr');
    Route::get('/participants/{participant}/download-svg', [ParticipantController::class, 'downloadSvg'])->name('participants.download.svg');
    Route::get('/participants/{participant}/download-png', [ParticipantController::class, 'downloadPng'])->name('participants.download.png');

    // Profile routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Self check-in publik (tanpa login) lewat token Master QR. Dibatasi per IP, tapi longgar karena
// banyak peserta bisa berbagi satu IP WiFi sekolah (NAT) saat acara.
Route::get('/self-checkin/{token}/participants', [SelfCheckInController::class, 'searchParticipants'])
    ->middleware('throttle:300,1')->name('self-checkin.participants');
Route::get('/self-checkin/{token}', [SelfCheckInController::class, 'showForm'])
    ->middleware('throttle:300,1')->name('self-checkin.show');
Route::post('/self-checkin/{token}', [SelfCheckInController::class, 'submitForm'])
    ->middleware('throttle:120,1')->name('self-checkin.submit');

// Public Holidays API
Route::get('/api/holidays', [HolidayController::class, 'index'])->middleware('throttle:120,1')->name('api.holidays');

// Presensi wajah hanya lewat aplikasi Android (POST /api/v1/attendance); website tidak lagi
// menyediakan presensi wajah. Presensi web: scan QR workcode (self check-in) & scan QR peserta.

// File pribadi (/files/{type}/{id}) ada di routes/files.php: tanpa session, lihat bootstrap/app.php.

// Fallback untuk file publik non-sensitif bila symlink storage tidak tersedia di hosting.
// Hanya prefix yang di-whitelist; data peserta TIDAK PERNAH disimpan di disk publik.
Route::get('/storage/{path}', function (string $path) {
    $allowedPrefixes = ['branding/'];

    if (! PrivateFile::isSafePath($path)
        || ! Str::startsWith($path, $allowedPrefixes)
        || ! Storage::disk('public')->exists($path)) {
        abort(404);
    }

    return Storage::disk('public')->response($path, null, [
        'Cache-Control' => 'public, max-age=86400',
        'X-Content-Type-Options' => 'nosniff',
    ]);
})->where('path', '.*')->name('storage.file');

// Verification route
Route::get('/verify-signature/{workcode}', [VerificationController::class, 'verify'])
    ->middleware(['signed', 'throttle:60,1'])
    ->name('signature.verify');

require __DIR__.'/auth.php';
