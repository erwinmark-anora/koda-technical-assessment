<?php

use App\Http\Controllers\Api\ProjectController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Project API
|--------------------------------------------------------------------------
|
| The five endpoints the brief calls for, mounted under the conventional
| Laravel `/api` prefix:
|
|   GET    /api/projects        index
|   POST   /api/projects        store
|   GET    /api/projects/{id}   show
|   PUT    /api/projects/{id}   update
|   DELETE /api/projects/{id}   destroy
|
*/

Route::apiResource('projects', ProjectController::class)
    ->whereNumber('project');
