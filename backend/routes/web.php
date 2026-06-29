<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'app' => 'Aura Cfw API',
        'status' => 'ok',
    ]);
});
