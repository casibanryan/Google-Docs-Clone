<?php
use App\Http\Controllers\Api\v1\ShareDocumentController;
use App\Http\Controllers\Api\V1\DocumentController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
  Route::apiResource('documents', DocumentController::class);
  Route::apiResource('users', UserController::class);
  Route::post('document/share', [ShareDocumentController::class, 'store']);
  Route::post('document/remove-share', [ShareDocumentController::class, 'destroy']);
});