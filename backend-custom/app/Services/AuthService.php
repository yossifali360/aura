<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use App\Repositories\UserRepository;
use Laravel\Socialite\Facades\Socialite;
use Symfony\Component\HttpFoundation\RedirectResponse;

class AuthService
{
    public function __construct(protected UserRepository $userRepository)
    {
    }

    public function redirectToDiscord(): RedirectResponse|\Illuminate\Http\RedirectResponse
    {
        return Socialite::driver('discord')
            ->scopes(['identify', 'email'])
            ->redirect();
    }

    public function handleDiscordCallback(): array
    {
        $discordUser = Socialite::driver('discord')->user();

        $existing = $this->userRepository->findByDiscordId($discordUser->getId());

        $firstName = $this->extractFirstName($discordUser->getName() ?? $discordUser->getNickname() ?? 'Player');

        $payload = [
            'discord_id' => $discordUser->getId(),
            'username' => $discordUser->getNickname() ?? $discordUser->getName(),
            'first_name' => $firstName,
            'email' => $discordUser->getEmail(),
            'avatar' => $this->resolveAvatar($discordUser),
        ];

        $user = $existing
            ? $this->userRepository->update($existing, $payload)
            : $this->userRepository->create($payload);

        $token = $user->createToken('discord-auth')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    private function extractFirstName(string $displayName): string
    {
        $parts = preg_split('/\s+/', trim($displayName));

        return $parts[0] ?? 'Player';
    }

    private function resolveAvatar(mixed $discordUser): ?string
    {
        $avatar = $discordUser->getAvatar();

        if ($avatar) {
            return $avatar;
        }

        $id = $discordUser->getId();

        if (! $id) {
            return null;
        }

        $discriminator = $discordUser->user['discriminator'] ?? '0';
        $index = $discriminator === '0'
            ? ((int) bcmod((string) $id, '5'))
            : ((int) $discriminator % 5);

        return "https://cdn.discordapp.com/embed/avatars/{$index}.png";
    }
}
