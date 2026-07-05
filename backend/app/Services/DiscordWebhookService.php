<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\ApplicationType;
use App\Models\Application;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DiscordWebhookService
{
    public function notifyApplication(Application $application, User $user): void
    {
        $type = ApplicationType::tryFrom($application->type) ?? ApplicationType::Server;
        $webhookUrl = $this->webhookForType($type);

        if (! $webhookUrl) {
            return;
        }

        $application->loadMissing('user');

        try {
            Http::timeout(10)->post($webhookUrl, [
                'username' => 'Aura Cfw Applications',
                'embeds' => [
                    [
                        'title' => "New {$type->label()} Application",
                        'color' => $type->color(),
                        'fields' => $this->applicationFields($application, $user, $type),
                        'thumbnail' => $user->avatar ? ['url' => $user->avatar] : null,
                        'timestamp' => $application->created_at?->toIso8601String(),
                    ],
                ],
            ]);
        } catch (\Throwable $e) {
            Log::warning('Discord webhook failed', ['error' => $e->getMessage(), 'application_id' => $application->id]);
        }
    }

    private function webhookForType(ApplicationType $type): ?string
    {
        return match ($type) {
            ApplicationType::Police => env('DISCORD_WEBHOOK_POLICE') ?: env('DISCORD_WEBHOOK_URL'),
            ApplicationType::Ems => env('DISCORD_WEBHOOK_EMS') ?: env('DISCORD_WEBHOOK_URL'),
            ApplicationType::Server => env('DISCORD_WEBHOOK_URL'),
        };
    }

    /**
     * @return list<array{name: string, value: string, inline?: bool}>
     */
    private function applicationFields(Application $application, User $user, ApplicationType $type): array
    {
        $base = [
            ['name' => 'Applicant', 'value' => "{$user->first_name} (@{$user->username})", 'inline' => true],
            ['name' => 'Discord ID', 'value' => $user->discord_id, 'inline' => true],
            ['name' => 'Age', 'value' => (string) $application->age, 'inline' => true],
        ];

        $details = match ($type) {
            ApplicationType::Server => [
                ['name' => 'Real Name', 'value' => $this->truncate((string) ($application->real_name ?? ''))],
                ['name' => 'City Character Name', 'value' => $this->truncate($application->character_concept)],
                ['name' => 'Steam Link', 'value' => $this->truncate($application->experience)],
                ['name' => 'Character Story', 'value' => $this->truncate($application->why_join)],
            ],
            ApplicationType::Police => [
                ['name' => 'Character Name', 'value' => $this->truncate($application->character_concept)],
                ['name' => 'Why Accept', 'value' => $this->truncate($application->why_join)],
                ['name' => 'Police Experience', 'value' => $this->truncate($application->experience ?: '—')],
            ],
            ApplicationType::Ems => [
                ['name' => 'Experience', 'value' => $this->truncate($application->experience)],
                ['name' => 'Character / Background', 'value' => $this->truncate($application->character_concept)],
                ['name' => 'Why Join', 'value' => $this->truncate($application->why_join)],
            ],
        };

        return [
            ...$base,
            ...$details,
            ['name' => 'Status', 'value' => ucfirst($application->status), 'inline' => true],
            ['name' => 'Application ID', 'value' => "#{$application->id}", 'inline' => true],
        ];
    }

    private function truncate(string $text, int $max = 1000): string
    {
        return mb_strlen($text) > $max ? mb_substr($text, 0, $max - 3).'...' : $text;
    }
}
