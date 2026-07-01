<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StorePoliceMemberRequest;
use App\Http\Requests\UpdatePoliceMemberRequest;
use App\Http\Resources\PoliceMemberResource;
use App\Services\PoliceMemberService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PoliceMemberController extends Controller
{
    public function __construct(protected PoliceMemberService $service)
    {
    }

    public function roster(): JsonResponse
    {
        $grouped = $this->service->rosterForPublic();

        $data = [];

        foreach ($grouped as $section => $members) {
            $data[$section] = PoliceMemberResource::collection($members);
        }

        return response()->json(['data' => $data]);
    }

    public function options(): JsonResponse
    {
        return response()->json(['data' => $this->service->options()]);
    }

    public function me(Request $request): JsonResponse
    {
        $member = $this->service->profileForUser($request->user());

        if (! $member) {
            return response()->json([
                'data' => null,
                'message' => __('No police roster record found for your Discord account.'),
            ]);
        }

        return response()->json(['data' => PoliceMemberResource::make($member)]);
    }

    public function index(Request $request): JsonResponse
    {
        return response()->json([
            'data' => PoliceMemberResource::collection($this->service->rosterForAdmin($request->user())),
        ]);
    }

    public function store(StorePoliceMemberRequest $request): JsonResponse
    {
        $member = $this->service->store($request, $request->user());

        return response()->json([
            'data' => PoliceMemberResource::make($member),
            'message' => __('Police member created.'),
        ], 201);
    }

    public function update(UpdatePoliceMemberRequest $request, int $id): JsonResponse
    {
        $member = $this->service->update($request, $id, $request->user());

        return response()->json([
            'data' => PoliceMemberResource::make($member),
            'message' => __('Police member updated.'),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $this->service->destroy($id, $request->user());

        return response()->json([
            'message' => __('Police member deleted.'),
        ]);
    }
}
