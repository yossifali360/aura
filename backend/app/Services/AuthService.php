<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\AdminRole;
use App\Repositories\UserRepository;
use Illuminate\Support\Facades\Cache;
use Laravel\Socialite\Facades\Socialite;
use Symfony\Component\HttpFoundation\RedirectResponse;

class AuthService
{
    private const OAUTH_CODE_CACHE_TTL_MINUTES = 10;

    public function __construct(
        protected UserRepository $userRepository,
        protected DiscordBotService $discordBot,
    ) {
    }

    public function redirectToDiscord(): RedirectResponse|\Illuminate\Http\RedirectResponse
    {
        return Socialite::driver('discord')
            ->scopes(['identify', 'email', 'guilds.join'])
            ->withConsent()
            ->stateless()
            ->redirect();
    }

    public function handleDiscordCallback(): array
    {
        $code = request('code');

        if (! is_string($code) || $code === '') {
            throw new \InvalidArgumentException('Missing OAuth code.');
        }

        $resultCacheKey = $this->oauthCacheKey($code, 'result');

        if ($cached = Cache::get($resultCacheKey)) {
            return $cached;
        }

        $discordPayload = $this->exchangeDiscordCode($code);

        $existing = $this->userRepository->findByDiscordId($discordPayload['id']);

        $firstName = $this->extractFirstName($discordPayload['name'] ?? $discordPayload['nickname'] ?? 'Player');

        $payload = [
            'discord_id' => $discordPayload['id'],
            'username' => $discordPayload['nickname'] ?? $discordPayload['name'],
            'first_name' => $firstName,
            'email' => $discordPayload['email'],
            'avatar' => $this->resolveAvatarFromPayload($discordPayload),
        ];

        $user = $existing
            ? $this->userRepository->update($existing, $payload)
            : $this->userRepository->create($payload);

        if ($user->isConfiguredSuperAdmin() && $user->admin_role !== AdminRole::SuperAdmin->value) {
            $user = $this->userRepository->update($user, [
                'admin_role' => AdminRole::SuperAdmin->value,
            ]);
        }

        $token = $user->createToken('discord-auth')->plainTextToken;

        $this->discordBot->addUserToGuild($user->discord_id, (string) $discordPayload['token']);
        $this->discordBot->ensureDirectMessageChannel($user->discord_id);

        $result = [
            'user' => $user,
            'token' => $token,
        ];

        Cache::put($resultCacheKey, $result, now()->addMinutes(self::OAUTH_CODE_CACHE_TTL_MINUTES));

        return $result;
    }

    /**
     * @return array{id: string, nickname: ?string, name: ?string, email: ?string, avatar: ?string, token: string, raw: array<string, mixed>}
     */
    private function exchangeDiscordCode(string $code): array
    {
        $payloadCacheKey = $this->oauthCacheKey($code, 'payload');

        if ($cached = Cache::get($payloadCacheKey)) {
            return $cached;
        }

        $discordUser = Socialite::driver('discord')
            ->stateless()
            ->user();

        $payload = [
            'id' => (string) $discordUser->getId(),
            'nickname' => $discordUser->getNickname(),
            'name' => $discordUser->getName(),
            'email' => $discordUser->getEmail(),
            'avatar' => $discordUser->getAvatar(),
            'token' => (string) $discordUser->token,
            'raw' => $discordUser->user ?? [],
        ];

        Cache::put($payloadCacheKey, $payload, now()->addMinutes(self::OAUTH_CODE_CACHE_TTL_MINUTES));

        return $payload;
    }

    private function oauthCacheKey(string $code, string $suffix): string
    {
        return 'discord_oauth:'.hash('sha256', $code).":{$suffix}";
    }

    private function extractFirstName(string $displayName): string
    {
        $parts = preg_split('/\s+/', trim($displayName));

        return $parts[0] ?? 'Player';
    }

    /**
     * @param array{id: string, avatar: ?string, raw: array<string, mixed>} $payload
     */
    private function resolveAvatarFromPayload(array $payload): ?string
    {
        if ($payload['avatar']) {
            return $payload['avatar'];
        }

        $id = $payload['id'];

        if ($id === '') {
            return null;
        }

        $discriminator = $payload['raw']['discriminator'] ?? '0';
        $index = $discriminator === '0'
            ? ((int) bcmod((string) $id, '5'))
            : ((int) $discriminator % 5);

        return "https://cdn.discordapp.com/embed/avatars/{$index}.png";
    }
}
