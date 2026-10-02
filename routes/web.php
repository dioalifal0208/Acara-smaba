<?php

use App\Http\Controllers\AdminLeaveController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\FaceRecognitionController;
use App\Http\Controllers\HolidayController;
use App\Http\Controllers\LeaveRequestController;
use App\Http\Controllers\ParticipantController;
use App\Http\Controllers\PhotoChangeRequestController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SelfCheckInController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\VerificationController;
use App\Http\Controllers\WorkcodeController;
use App\Models\Attendance;
use App\Models\LeaveRequest;
use App\Models\Participant;
use App\Models\Workcode;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
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

// Route publik untuk lookup peserta & download QR Code
Route::get('/api/participants/lookup', [ParticipantController::class, 'lookup'])->name('participants.lookup');
Route::get('/participants/{participant}/qr', [ParticipantController::class, 'qrCode'])->name('participants.qr');
Route::get('/participants/{participant}/download-svg', [ParticipantController::class, 'downloadSvg'])->name('participants.download.svg');
Route::get('/participants/{participant}/download-png', [ParticipantController::class, 'downloadPng'])->name('participants.download.png');

Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    // Dashboard route
    Route::get('/dashboard', function () {
        $activeWorkcode = Workcode::getActive();
        $totalParticipants = Participant::count();
        $totalAttended = $activeWorkcode
            ? Attendance::where('workcode_id', $activeWorkcode->id)->distinct('participant_id')->count('participant_id')
            : 0;

        $pendingLeaveCount = LeaveRequest::where('status_approval', 'pending')->count();

        return Inertia::render('Dashboard', [
            'activeWorkcode' => $activeWorkcode,
            'pendingLeaveCount' => $pendingLeaveCount,
            'stats' => [
                'total' => $totalParticipants,
                'hadir' => $totalAttended,
                'belum' => $totalParticipants - $totalAttended,
            ],
        ]);
    })->name('dashboard');

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

    // Participant management routes
    Route::get('/participants', [ParticipantController::class, 'index'])->name('participants.index');
    Route::get('/participants/template', [ParticipantController::class, 'downloadTemplate'])->name('participants.template');
    Route::post('/participants', [ParticipantController::class, 'store'])->name('participants.store');
    Route::post('/participants/import', [ParticipantController::class, 'import'])->name('participants.import');
    Route::post('/participants/import/preview', [ParticipantController::class, 'importPreview'])->name('participants.import.preview');
    Route::post('/participants/import/confirm', [ParticipantController::class, 'importConfirm'])->name('participants.import.confirm');
    Route::delete('/participants/bulk-delete', [ParticipantController::class, 'bulkDestroy'])->name('participants.bulk-destroy');
    Route::put('/participants/{participant}', [ParticipantController::class, 'update'])->name('participants.update');
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
            'participant' => auth()->user()->participant,
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
    // Profile routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Public Self Check-In routes (no login required)
Route::get('/api/participants/search', [ParticipantController::class, 'search'])->name('participants.search');
Route::get('/self-checkin/{token}', [SelfCheckInController::class, 'showForm'])->name('self-checkin.show');
Route::post('/self-checkin/{token}', [SelfCheckInController::class, 'submitForm'])->name('self-checkin.submit');

// Public Holidays API
Route::get('/api/holidays', [HolidayController::class, 'index'])->name('api.holidays');

// Public Face Recognition routes
Route::post('/api/face/match', [FaceRecognitionController::class, 'match'])->name('face.match');

// Fallback & direct handler for public storage files (works even if storage:link is missing/broken on hosting/cPanel)
Route::get('/storage/{path}', function ($path) {
    if (! Storage::disk('public')->exists($path)) {
        abort(404);
    }

    return Storage::disk('public')->response($path, null, [
        'Cache-Control' => 'public, max-age=31536000',
    ]);
})->where('path', '.*')->name('storage.file');

// Verification route
Route::get('/verify-signature/{workcode}', [VerificationController::class, 'verify'])->name('signature.verify');

require __DIR__.'/auth.php';
