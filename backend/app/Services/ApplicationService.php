<?php

declare(strict_types=1);

namespace App\Services;

use App\Http\Requests\ApplicationRequest;
use App\Models\Application;
use App\Models\User;
use App\Repositories\ApplicationRepository;
use App\Repositories\SettingRepository;
use Illuminate\Validation\ValidationException;

class ApplicationService
{
    public function __construct(
        protected ApplicationRepository $repository,
        protected DiscordWebhookService $discord,
        protected DiscordBotService $discordBot,
        protected SettingRepository $settings,
    ) {
    }

    public function store(ApplicationRequest $request, User $user): Application
    {
        $validated = $request->validated();
        $type = $validated['type'];

        if (! $this->settings->isApplicationTypeEnabled($type)) {
            throw ValidationException::withMessages([
                'type' => [__('Applications for this role are currently closed.')],
            ]);
        }

        $existing = $this->repository->findActiveByUserIdAndType($user->id, $type);

        if ($existing) {
            throw ValidationException::withMessages([
                'application' => [__('You already have an active application for this role.')],
            ]);
        }

        $application = $this->repository->create([
            ...$validated,
            'user_id' => $user->id,
            'status' => 'pending',
        ]);

        $this->discord->notifyApplication($application, $user);
        $this->discordBot->sendApplicationReceived($application, $user);

        return $application->load('user');
    }

    public function findLatestForUser(User $user, string $type): ?Application
    {
        return $this->repository->findActiveByUserIdAndType($user->id, $type);
    }
}
