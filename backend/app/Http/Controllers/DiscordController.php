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

    public function roleMembers(string $roleKey): JsonResponse
    {
        $roleId = config("services.discord.public_roles.{$roleKey}");

        if (! is_string($roleId) || $roleId === '') {
            return response()->json(['message' => 'Discord role not configured.'], 404);
        }

        $payload = $this->discordBot->getGuildMembersWithRole($roleId);

        if ($payload === null) {
            return response()->json([
                'message' => 'Unable to load Discord role members. Check bot token, guild ID, and Server Members Intent.',
            ], 503);
        }

        return response()->json(['data' => $payload]);
    }

    public function teamMembers(): JsonResponse
    {
        /** @var list<string> $roleIds */
        $roleIds = config('services.discord.team_role_ids', []);

        if ($roleIds === []) {
            return response()->json(['message' => 'Discord team roles not configured.'], 404);
        }

        $payload = $this->discordBot->getGuildTeamMembers($roleIds);

        if ($payload === null) {
            return response()->json([
                'message' => 'Unable to load Discord team members. Check bot token, guild ID, and Server Members Intent.',
            ], 503);
        }

        return response()->json(['data' => $payload]);
    }
}
