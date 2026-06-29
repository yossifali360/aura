<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\ApplicationRequest;
use App\Http\Resources\ApplicationResource;
use App\Services\ApplicationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApplicationController extends Controller
{
    public function __construct(protected ApplicationService $service)
    {
    }

    public function store(ApplicationRequest $request): JsonResponse
    {
        $application = $this->service->store($request, $request->user());

        return response()->json([
            'data' => ApplicationResource::make($application),
            'message' => __('Application submitted successfully.'),
        ], 201);
    }

    public function me(Request $request): JsonResponse
    {
        $type = $request->query('type', 'server');
        $application = $this->service->findLatestForUser($request->user(), $type);

        return response()->json([
            'data' => $application ? ApplicationResource::make($application) : null,
        ]);
    }
}
