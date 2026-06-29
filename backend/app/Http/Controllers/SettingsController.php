<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Repositories\SettingRepository;
use Illuminate\Http\JsonResponse;

class SettingsController extends Controller
{
    public function __construct(protected SettingRepository $settings)
    {
    }

    public function applicationTypes(): JsonResponse
    {
        return response()->json([
            'data' => $this->settings->getApplicationTypes(),
        ]);
    }

    public function rules(): JsonResponse
    {
        return response()->json([
            'data' => $this->settings->getRules(),
        ]);
    }

    public function rulesByType(string $type): JsonResponse
    {
        if (! in_array($type, ['server', 'police', 'ems'], true)) {
            abort(404);
        }

        return response()->json([
            'data' => $this->settings->getRulesForType($type),
        ]);
    }
}
