<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\ContactRequest;
use App\Services\ContactService;
use Illuminate\Http\JsonResponse;

class ContactController extends Controller
{
    public function __construct(protected ContactService $service)
    {
    }

    public function store(ContactRequest $request): JsonResponse
    {
        $this->service->store($request);

        return response()->json([
            'message' => __('Message sent successfully. We will get back to you soon.'),
        ], 201);
    }
}
