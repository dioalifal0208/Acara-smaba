<?php

use App\Http\Controllers\Api\V1\AttendanceController;
use App\Http\Controllers\Api\V1\AttendanceDailyHistoryController;
use App\Http\Controllers\Api\V1\AttendanceHistoryController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\FcmTokenController;
use App\Http\Controllers\Api\V1\LeaveRequestController;
use App\Http\Controllers\Api\V1\PhotoController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\WorkcodeController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    Route::post('/auth/login', [AuthController::class, 'login'])
        ->middleware('throttle:api-login')
        ->name('api.v1.login');

    Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout'])
            ->name('api.v1.logout');

        Route::get('/me', [ProfileController::class, 'me'])
            ->name('api.v1.me');

        Route::get('/me/photo', [PhotoController::class, 'show'])
            ->name('api.v1.me.photo');

        Route::post('/me/photo-change-requests', [PhotoController::class, 'storeChangeRequest'])
            ->name('api.v1.me.photo-change-requests.store');

        Route::get('/admin/photo-change-requests', [PhotoController::class, 'indexForAdmin'])
            ->name('api.v1.admin.photo-change-requests.index');

        Route::patch('/admin/photo-change-requests/{photoChangeRequest}/approve', [PhotoController::class, 'approve'])
            ->name('api.v1.admin.photo-change-requests.approve');

        Route::patch('/admin/photo-change-requests/{photoChangeRequest}/reject', [PhotoController::class, 'reject'])
            ->name('api.v1.admin.photo-change-requests.reject');

        Route::get('/workcodes/active', [WorkcodeController::class, 'active'])
            ->name('api.v1.workcodes.active');

        Route::get('/attendance-history/daily', [AttendanceDailyHistoryController::class, 'index'])
            ->name('api.v1.attendance-history.daily');

        Route::get('/attendance-history', [AttendanceHistoryController::class, 'index'])
            ->name('api.v1.attendance-history');

        Route::post('/attendance', [AttendanceController::class, 'submit'])
            ->name('api.v1.attendance.submit');

        Route::post('/attendances/leave', [LeaveRequestController::class, 'submit'])
            ->name('api.v1.attendances.leave.submit');

        Route::post('/leave-requests', [LeaveRequestController::class, 'submit'])
            ->name('api.v1.leave-requests.store');

        Route::get('/leave-requests', [LeaveRequestController::class, 'index'])
            ->name('api.v1.leave-requests.index');

        Route::post('/fcm/register', [FcmTokenController::class, 'register'])
            ->name('api.v1.fcm.register');

        Route::delete('/fcm/unregister', [FcmTokenController::class, 'unregister'])
            ->name('api.v1.fcm.unregister');
    });

});
