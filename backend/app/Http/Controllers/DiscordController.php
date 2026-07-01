<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\DiscordBotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DiscordController extends Controller
{
    public function __construct(protected DiscordBotService $discordBot)
    {
    }

    public function avatars(Request $request): JsonResponse
    {
        $raw = (string) $request->query('ids', '');
        $ids = array_values(array_filter(array_map(
            'trim',
            explode(',', $raw),
        ), fn (string $id): bool => preg_match('/^\d{17,20}$/', $id) === 1));

        return response()->json([
            'data' => $this->discordBot->getAvatarUrlsForUsers($ids),
        ]);
    }
}
