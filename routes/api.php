<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ProfileController;

Route::prefix('v1')->group(function () {
    
    Route::post('/auth/login', [AuthController::class, 'login'])
        ->middleware('throttle:api-login')
        ->name('api.v1.login');

    Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout'])
            ->name('api.v1.logout');
            
        Route::get('/me', [ProfileController::class, 'me'])
            ->name('api.v1.me');

        Route::get('/workcodes/active', [\App\Http\Controllers\Api\V1\WorkcodeController::class, 'active'])
            ->name('api.v1.workcodes.active');

        Route::get('/attendance-history', [\App\Http\Controllers\Api\V1\AttendanceHistoryController::class, 'index'])
            ->name('api.v1.attendance-history');

        Route::post('/attendance', [\App\Http\Controllers\Api\V1\AttendanceController::class, 'submit'])
            ->name('api.v1.attendance.submit');

        Route::post('/attendances/leave', [\App\Http\Controllers\Api\V1\LeaveRequestController::class, 'submit'])
            ->name('api.v1.attendances.leave.submit');
    });

});
