<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\DocumentController;
use App\Http\Controllers\Api\V1\UserController;

Route::prefix('v1')->group(function () {
  Route::apiResource('documents', DocumentController::class);
  Route::apiResource('users', UserController::class);
});