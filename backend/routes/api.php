<?php

declare(strict_types=1);

use App\Http\Controllers\AdminController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth/discord')->group(function (): void {
    Route::get('/redirect', [AuthController::class, 'redirect']);
    Route::get('/callback', [AuthController::class, 'callback']);
});

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/user', [UserController::class, 'show']);
    Route::post('/applications', [ApplicationController::class, 'store']);
    Route::get('/applications/me', [ApplicationController::class, 'me']);
});

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function (): void {
    Route::get('/stats', [AdminController::class, 'stats']);
    Route::get('/applications', [AdminController::class, 'applications']);
    Route::patch('/applications/{id}', [AdminController::class, 'updateApplication']);
    Route::delete('/applications/{id}', [AdminController::class, 'destroyApplication']);
    Route::post('/applications/message', [AdminController::class, 'sendApplicationMessage']);
    Route::get('/contacts', [AdminController::class, 'contacts']);
    Route::get('/users', [AdminController::class, 'users']);
    Route::patch('/users/{id}', [AdminController::class, 'updateUser']);
    Route::get('/settings/application-types', [AdminController::class, 'applicationTypes']);
    Route::patch('/settings/application-types', [AdminController::class, 'updateApplicationTypes']);
    Route::get('/settings/rules', [AdminController::class, 'rules']);
    Route::patch('/settings/rules', [AdminController::class, 'updateRules']);
});

Route::get('/settings/application-types', [SettingsController::class, 'applicationTypes']);
Route::get('/settings/rules', [SettingsController::class, 'rules']);
Route::get('/settings/rules/{type}', [SettingsController::class, 'rulesByType']);
