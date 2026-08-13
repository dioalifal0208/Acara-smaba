<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\EventController;
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
        $activeEvent = \App\Models\Event::getActive();
        $totalParticipants = \App\Models\Participant::count();
        $totalAttended = $activeEvent
            ? \App\Models\Attendance::where('event_id', $activeEvent->id)->distinct('participant_id')->count('participant_id')
            : 0;

        return Inertia::render('Dashboard', [
            'activeEvent' => $activeEvent,
            'stats' => [
                'total' => $totalParticipants,
                'hadir' => $totalAttended,
                'belum' => $totalParticipants - $totalAttended,
            ],
        ]);
    })->name('dashboard');

    // Event management routes
    Route::get('/events', [EventController::class, 'index'])->name('events.index');
    Route::post('/events', [EventController::class, 'store'])->name('events.store');
    Route::post('/events/{event}/activate', [EventController::class, 'activate'])->name('events.activate');
    Route::post('/events/{event}/deactivate', [EventController::class, 'deactivate'])->name('events.deactivate');
    Route::delete('/events/{event}', [EventController::class, 'destroy'])->name('events.destroy');

    // Participant management routes
    Route::get('/participants', [ParticipantController::class, 'index'])->name('participants.index');
    Route::post('/participants', [ParticipantController::class, 'store'])->name('participants.store');
    Route::post('/participants/import', [ParticipantController::class, 'import'])->name('participants.import');
    Route::put('/participants/{participant}', [ParticipantController::class, 'update'])->name('participants.update');
    Route::delete('/participants/{participant}', [ParticipantController::class, 'destroy'])->name('participants.destroy');

    // Master QR routes
    Route::get('/admin/master-qr', [SelfCheckInController::class, 'masterQr'])->name('admin.master-qr');
    Route::post('/admin/master-qr/regenerate', [SelfCheckInController::class, 'regenerateToken'])->name('admin.master-qr.regenerate');

    // Report routes
    Route::get('/report', [AttendanceController::class, 'report'])->name('report');
});

Route::middleware('auth')->group(function () {
    // Profile routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Scanner routes
    Route::get('/scanner', [AttendanceController::class, 'scanner'])->name('scanner');
    
    Route::post('/scan', [AttendanceController::class, 'scan'])->name('scan');
    Route::post('/api/scan', [AttendanceController::class, 'apiScan'])->name('api.scan');
});

// Public Self Check-In routes (no login required)
Route::get('/api/participants/search', [ParticipantController::class, 'search'])->name('participants.search');
Route::get('/self-checkin/{token}', [SelfCheckInController::class, 'showForm'])->name('self-checkin.show');
Route::post('/self-checkin/{token}', [SelfCheckInController::class, 'submitForm'])->name('self-checkin.submit');

require __DIR__.'/auth.php';
