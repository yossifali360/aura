<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\ApplicationType;
use App\Models\Application;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DiscordBotService
{
    private const API_BASE = 'https://discord.com/api/v10';

    private const CODE_NO_MUTUAL_GUILDS = 50278;

    private ?string $senderLabel = null;

    private bool $verifiedLoginApp = false;

    public function sendApplicationReceived(Application $application, User $user): bool
    {
        $type = ApplicationType::tryFrom($application->type) ?? ApplicationType::Server;

        return $this->sendDirectMessage($user->discord_id, $this->applicationReceivedMessage($type))['ok'];
    }

    public function sendApplicationStatusUpdate(Application $application, User $user): bool
    {
        if (! in_array($application->status, ['approved', 'rejected'], true)) {
            return false;
        }

        $type = ApplicationType::tryFrom($application->type) ?? ApplicationType::Server;
        $content = $application->status === 'approved'
            ? $this->applicationApprovedMessage($type)
            : $this->applicationRejectedMessage($type);

        return $this->sendDirectMessage($user->discord_id, $content)['ok'];
    }

    /**
     * Add the user to the configured Discord server using their OAuth token (guilds.join scope).
     */
    public function addUserToGuild(string $discordUserId, string $accessToken): bool
    {
        $guildId = config('services.discord.guild_id');

        if (! $guildId || ! $this->botToken()) {
            return false;
        }

        try {
            $response = Http::timeout(10)
                ->withHeaders($this->headers())
                ->put(self::API_BASE."/guilds/{$guildId}/members/{$discordUserId}", [
                    'access_token' => $accessToken,
                ]);

            if ($response->successful() || $response->status() === 204) {
                return true;
            }

            Log::warning('Discord guild join failed', [
                'discord_id' => $discordUserId,
                'guild_id' => $guildId,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
        } catch (\Throwable $e) {
            Log::warning('Discord guild join exception', [
                'discord_id' => $discordUserId,
                'error' => $e->getMessage(),
            ]);
        }

        return false;
    }

    /**
     * Open a DM channel when the user logs in with the same Discord application.
     */
    public function ensureDirectMessageChannel(string $discordUserId): bool
    {
        if (! $this->botToken()) {
            return false;
        }

        $this->verifyBotMatchesLoginApp();

        try {
            $response = Http::timeout(10)
                ->withHeaders($this->headers())
                ->post(self::API_BASE.'/users/@me/channels', [
                    'recipient_id' => $discordUserId,
                ]);

            if (! $response->successful()) {
                Log::debug('Discord DM channel ensure failed', [
                    'discord_id' => $discordUserId,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
            }

            return $response->successful();
        } catch (\Throwable $e) {
            Log::debug('Discord DM channel ensure exception', [
                'discord_id' => $discordUserId,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * @return array{ok: bool, error: ?string}
     */
    public function sendDirectMessage(string $discordUserId, string $content): array
    {
        if (! $this->botToken()) {
            Log::warning('Discord bot token missing — add DISCORD_BOT_TOKEN from the same app as DISCORD_CLIENT_ID', [
                'discord_id' => $discordUserId,
            ]);

            return ['ok' => false, 'error' => __('Discord bot is not configured.')];
        }

        $this->verifyBotMatchesLoginApp();

        try {
            $channelResponse = Http::timeout(10)
                ->withHeaders($this->headers())
                ->post(self::API_BASE.'/users/@me/channels', [
                    'recipient_id' => $discordUserId,
                ]);

            if (! $channelResponse->successful()) {
                $error = $this->parseDiscordError($channelResponse->body());

                Log::warning('Discord DM channel creation failed', [
                    'discord_id' => $discordUserId,
                    'status' => $channelResponse->status(),
                    'body' => $channelResponse->body(),
                ]);

                return ['ok' => false, 'error' => $error];
            }

            $channelId = $channelResponse->json('id');

            $messageResponse = Http::timeout(10)
                ->withHeaders($this->headers())
                ->post(self::API_BASE."/channels/{$channelId}/messages", [
                    'content' => $content,
                ]);

            if (! $messageResponse->successful()) {
                $error = $this->parseDiscordError($messageResponse->body());

                Log::warning('Discord DM send failed', [
                    'discord_id' => $discordUserId,
                    'status' => $messageResponse->status(),
                    'body' => $messageResponse->body(),
                ]);

                return ['ok' => false, 'error' => $error];
            }

            return ['ok' => true, 'error' => null];
        } catch (\Throwable $e) {
            Log::warning('Discord DM exception', [
                'discord_id' => $discordUserId,
                'error' => $e->getMessage(),
            ]);

            return ['ok' => false, 'error' => __('Failed to send Discord message.')];
        }
    }

    public function applicationReceivedMessage(ApplicationType $type): string
    {
        return implode("\n", [
            "**{$this->senderLabel()}**",
            '',
            "لقد استلمنا طلبك الخاص ب **{$type->labelAr()}**",
            'وسيتم التواصل معك قريبا',
            '',
            "_We received your **{$type->label()}** application. We will contact you soon._",
        ]);
    }

    public function applicationApprovedMessage(ApplicationType $type): string
    {
        return implode("\n", [
            "**{$this->senderLabel()}**",
            '',
            "تم **قبول** طلبك الخاص ب **{$type->labelAr()}**",
            'تهانينا!.',
            '',
            "_Your **{$type->label()}** application has been **approved**. Congratulations!_",
        ]);
    }

    public function applicationRejectedMessage(ApplicationType $type): string
    {
        return implode("\n", [
            "**{$this->senderLabel()}**",
            '',
            "تم **رفض** طلبك الخاص ب **{$type->labelAr()}**",
            'يمكنك التقديم مرة أخرى لاحقاً إذا رغبت.',
            '',
            "_Your **{$type->label()}** application has been **rejected**. You may re-apply later if you wish._",
        ]);
    }

    public function formatAdminMessage(string $message): string
    {
        return "**{$this->senderLabel()}**\n\n".trim($message);
    }

    /**
     * @return array{sent: int, failed: int, failures: array<string, string>}
     */
    public function sendBulkDirectMessages(array $discordUserIds, string $message): array
    {
        $content = $this->formatAdminMessage($message);
        $sent = 0;
        $failed = 0;
        $failures = [];

        foreach (array_unique($discordUserIds) as $discordUserId) {
            $result = $this->sendDirectMessage($discordUserId, $content);

            if ($result['ok']) {
                $sent++;
            } else {
                $failed++;
                $failures[$discordUserId] = $result['error'] ?? __('Failed to send Discord message.');
            }
        }

        return compact('sent', 'failed', 'failures');
    }

    private function parseDiscordError(string $body): string
    {
        $payload = json_decode($body, true);

        if (! is_array($payload)) {
            return __('Failed to send Discord message.');
        }

        if (($payload['code'] ?? null) === self::CODE_NO_MUTUAL_GUILDS) {
            return __('User is not in your Discord server. Set DISCORD_GUILD_ID, ensure the bot is in that server, and ask them to log in again.');
        }

        if (is_string($payload['message'] ?? null) && $payload['message'] !== '') {
            return $payload['message'];
        }

        return __('Failed to send Discord message.');
    }

    private function senderLabel(): string
    {
        if ($this->senderLabel !== null) {
            return $this->senderLabel;
        }

        $token = $this->botToken();

        if (! $token) {
            return (string) config('app.name', 'Aura Cfw');
        }

        try {
            $response = Http::timeout(5)
                ->withHeaders($this->headers())
                ->get(self::API_BASE.'/users/@me');

            if ($response->successful()) {
                $this->senderLabel = $response->json('global_name')
                    ?? $response->json('username')
                    ?? (string) config('app.name', 'Aura Cfw');

                return $this->senderLabel;
            }
        } catch (\Throwable) {
            // Fall back to app name below.
        }

        $this->senderLabel = (string) config('app.name', 'Aura Cfw');

        return $this->senderLabel;
    }

    private function verifyBotMatchesLoginApp(): void
    {
        if ($this->verifiedLoginApp) {
            return;
        }

        $this->verifiedLoginApp = true;

        $clientId = config('services.discord.client_id');
        $token = $this->botToken();

        if (! $clientId || ! $token) {
            return;
        }

        try {
            $response = Http::timeout(5)
                ->withHeaders($this->headers())
                ->get(self::API_BASE.'/oauth2/applications/@me');

            if ($response->successful() && (string) $response->json('id') !== (string) $clientId) {
                Log::error('DISCORD_BOT_TOKEN must come from the same Discord application as DISCORD_CLIENT_ID.');
            }
        } catch (\Throwable) {
            // Non-fatal.
        }
    }

    /**
     * @param  list<string>  $discordUserIds
     * @return array<string, string>
     */
    public function getAvatarUrlsForUsers(array $discordUserIds): array
    {
        $urls = [];

        foreach (array_unique($discordUserIds) as $discordUserId) {
            if (! is_string($discordUserId) || ! preg_match('/^\d{17,20}$/', $discordUserId)) {
                continue;
            }

            $urls[$discordUserId] = $this->resolveAvatarUrlForUser($discordUserId);
        }

        return $urls;
    }

    public function resolveAvatarUrlForUser(string $discordUserId): string
    {
        $token = $this->botToken();

        if (! $token) {
            return $this->defaultEmbedAvatarUrl($discordUserId);
        }

        try {
            $response = Http::timeout(5)
                ->withHeaders($this->headers())
                ->get(self::API_BASE."/users/{$discordUserId}");

            if (! $response->successful()) {
                Log::debug('Discord user lookup failed for avatar', [
                    'discord_id' => $discordUserId,
                    'status' => $response->status(),
                ]);

                return $this->defaultEmbedAvatarUrl($discordUserId);
            }

            /** @var array<string, mixed> $data */
            $data = $response->json();
            $avatarHash = isset($data['avatar']) ? (string) $data['avatar'] : '';

            if ($avatarHash !== '') {
                $extension = str_starts_with($avatarHash, 'a_') ? 'gif' : 'png';

                return "https://cdn.discordapp.com/avatars/{$discordUserId}/{$avatarHash}.{$extension}?size=256";
            }

            $discriminator = isset($data['discriminator']) ? (string) $data['discriminator'] : '0';

            return $this->defaultEmbedAvatarUrl($discordUserId, $discriminator);
        } catch (\Throwable $e) {
            Log::debug('Discord user lookup exception for avatar', [
                'discord_id' => $discordUserId,
                'error' => $e->getMessage(),
            ]);

            return $this->defaultEmbedAvatarUrl($discordUserId);
        }
    }

    private function defaultEmbedAvatarUrl(string $discordUserId, string $discriminator = '0'): string
    {
        $index = $discriminator === '0'
            ? (int) bcmod(bcdiv($discordUserId, '4194304'), '6')
            : ((int) $discriminator % 5);

        return "https://cdn.discordapp.com/embed/avatars/{$index}.png?size=256";
    }

    private function botToken(): ?string
    {
        $token = config('services.discord.bot_token');

        return is_string($token) && $token !== '' ? $token : null;
    }

    private function headers(): array
    {
        return [
            'Authorization' => 'Bot '.$this->botToken(),
            'Content-Type' => 'application/json',
        ];
    }
}
