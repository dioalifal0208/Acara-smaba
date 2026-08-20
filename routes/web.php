<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\WorkcodeController;
use App\Http\Controllers\ParticipantController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SelfCheckInController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    $user = auth()->user();
    $initialStats = null;

    if ($user && $user->isAdmin()) {
        // Ambil data stats awal untuk scanner di halaman depan
        $totalParticipants = \App\Models\Participant::count();
        $totalAttended = \App\Models\Attendance::distinct('participant_id')->count('participant_id');
        $initialStats = [
            'total' => $totalParticipants,
            'hadir' => $totalAttended,
            'belum' => $totalParticipants - $totalAttended,
        ];
    }

    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'initialStats' => $initialStats,
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
        $activeWorkcode = \App\Models\Workcode::getActive();
        $totalParticipants = \App\Models\Participant::count();
        $totalAttended = $activeWorkcode
            ? \App\Models\Attendance::where('workcode_id', $activeWorkcode->id)->distinct('participant_id')->count('participant_id')
            : 0;
            
        $pendingLeaveCount = \App\Models\LeaveRequest::where('status_approval', 'pending')->count();

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
    Route::get('/admin/leaves', [\App\Http\Controllers\AdminLeaveController::class, 'index'])->name('admin.leave.index');
    Route::post('/admin/leaves/{leaveRequest}/approve', [\App\Http\Controllers\AdminLeaveController::class, 'approve'])->name('admin.leave.approve');
    Route::post('/admin/leaves/{leaveRequest}/reject', [\App\Http\Controllers\AdminLeaveController::class, 'reject'])->name('admin.leave.reject');

    // Event management routes
    Route::get('/workcodes', [WorkcodeController::class, 'index'])->name('workcodes.index');
    Route::post('/workcodes', [WorkcodeController::class, 'store'])->name('workcodes.store');
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
    Route::post('/api/participants/{participant}/face', [\App\Http\Controllers\FaceRecognitionController::class, 'register'])->name('participants.face.register');
    Route::delete('/api/participants/{participant}/face', [\App\Http\Controllers\FaceRecognitionController::class, 'deleteFace'])->name('participants.face.delete');
    
    // Face Approval routes (Admin)
    Route::post('/admin/participants/{participant}/face/approve', [\App\Http\Controllers\FaceRecognitionController::class, 'approveFace'])->name('participants.face.approve');
    Route::post('/admin/participants/{participant}/face/reject', [\App\Http\Controllers\FaceRecognitionController::class, 'rejectFace'])->name('participants.face.reject');

    // Master QR routes
    Route::get('/admin/master-qr', [SelfCheckInController::class, 'masterQr'])->name('admin.master-qr');
    Route::post('/admin/master-qr/regenerate', [SelfCheckInController::class, 'regenerateToken'])->name('admin.master-qr.regenerate');

    // Report routes
    Route::get('/report', [AttendanceController::class, 'report'])->name('report');
    Route::get('/report/individual/{workcode}/{participant}', [AttendanceController::class, 'getIndividualRecap'])->name('report.individual');
    Route::get('/workcodes/{workcode}/export', [AttendanceController::class, 'exportAttendance'])->name('workcodes.export');
    Route::get('/workcodes/{workcode}/qr-signature', [AttendanceController::class, 'qrSignature'])->name('workcodes.qr-signature');
    // Scanner routes (Admin only)
    Route::get('/scanner', [AttendanceController::class, 'scanner'])->name('scanner');
    Route::post('/scan', [AttendanceController::class, 'scan'])->name('scan');
    Route::post('/api/scan', [AttendanceController::class, 'apiScan'])->name('api.scan');
});

Route::middleware(['auth', 'verified', 'role:participant'])->group(function () {
    // Participant Dashboard
    Route::get('/participant/dashboard', function () {
        $activeWorkcode = \App\Models\Workcode::getActive();
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
    
    Route::post('/api/participants/{participant}/face/self', [\App\Http\Controllers\FaceRecognitionController::class, 'registerSelf'])->name('participants.face.self-register');

    // Leave request submission
    Route::post('/participant/leave', [\App\Http\Controllers\LeaveRequestController::class, 'store'])->name('leave.store');
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

// Public Face Recognition routes
Route::post('/api/face/match', [\App\Http\Controllers\FaceRecognitionController::class, 'match'])->name('face.match');
require __DIR__.'/auth.php';
