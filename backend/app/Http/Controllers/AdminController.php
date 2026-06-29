<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\SendApplicationMessageRequest;
use App\Http\Requests\UpdateApplicationStatusRequest;
use App\Http\Requests\UpdateApplicationTypesRequest;
use App\Http\Requests\UpdateRulesRequest;
use App\Http\Requests\UpdateUserRoleRequest;
use App\Http\Resources\AdminUserResource;
use App\Http\Resources\ApplicationResource;
use App\Http\Resources\ContactMessageResource;
use App\Services\AdminService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function __construct(protected AdminService $service)
    {
    }

    public function stats(Request $request): JsonResponse
    {
        return response()->json(['data' => $this->service->stats($request->user())]);
    }

    public function applications(Request $request): JsonResponse
    {
        $paginator = $this->service->applications(
            $request->query('type'),
            $request->query('status'),
            $request->user(),
        );

        return response()->json([
            'data' => ApplicationResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function updateApplication(UpdateApplicationStatusRequest $request, int $id): JsonResponse
    {
        $application = $this->service->updateApplicationStatus($request, $id, $request->user());

        return response()->json([
            'data' => ApplicationResource::make($application),
            'message' => __('Application updated.'),
        ]);
    }

    public function destroyApplication(Request $request, int $id): JsonResponse
    {
        $this->service->deleteApplication($id, $request->user());

        return response()->json([
            'message' => __('Application deleted. The user can apply again.'),
        ]);
    }

    public function contacts(Request $request): JsonResponse
    {
        $paginator = $this->service->contacts($request->user());

        return response()->json([
            'data' => ContactMessageResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function users(Request $request): JsonResponse
    {
        return response()->json([
            'data' => AdminUserResource::collection($this->service->users($request->user())),
        ]);
    }

    public function updateUser(UpdateUserRoleRequest $request, int $id): JsonResponse
    {
        $user = $this->service->updateUserRole($request, $id, $request->user());

        return response()->json([
            'data' => AdminUserResource::make($user),
            'message' => __('User updated.'),
        ]);
    }

    public function applicationTypes(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $this->service->applicationTypes($request->user()),
        ]);
    }

    public function updateApplicationTypes(UpdateApplicationTypesRequest $request): JsonResponse
    {
        return response()->json([
            'data' => $this->service->updateApplicationTypes($request, $request->user()),
            'message' => __('Application settings updated.'),
        ]);
    }

    public function rules(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $this->service->rules($request->user()),
        ]);
    }

    public function updateRules(UpdateRulesRequest $request): JsonResponse
    {
        return response()->json([
            'data' => $this->service->updateRules($request, $request->user()),
            'message' => __('Rules updated.'),
        ]);
    }

    public function sendApplicationMessage(SendApplicationMessageRequest $request): JsonResponse
    {
        $result = $this->service->sendApplicationMessages($request, $request->user());

        $message = match (true) {
            $result['failed'] > 0 && $result['sent'] === 0 => __('Discord messages could not be delivered.'),
            $result['failed'] > 0 => __('Some Discord messages failed to send.'),
            default => __('Discord messages sent.'),
        };

        return response()->json([
            'data' => $result,
            'message' => $message,
        ]);
    }
}
