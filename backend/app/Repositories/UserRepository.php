<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Enums\AdminRole;
use App\Enums\ApplicationType;
use App\Models\PoliceMember;
use App\Models\User;
use Illuminate\Support\Collection;

class UserRepository
{
    public function findByDiscordId(string $discordId): ?User
    {
        return User::query()->where('discord_id', $discordId)->first();
    }

    public function create(array $data): User
    {
        return User::query()->create($data);
    }

    public function update(User $user, array $data): User
    {
        $user->update($data);

        return $user->fresh();
    }

    public function findById(int $id): ?User
    {
        return User::query()->find($id);
    }

    public function allOrdered(): Collection
    {
        return User::query()->orderByDesc('id')->get();
    }

    public function linkableForPoliceRoster(?int $exceptMemberId = null): Collection
    {
        $takenDiscordIds = PoliceMember::query()
            ->when($exceptMemberId, fn ($query) => $query->where('id', '!=', $exceptMemberId))
            ->whereNotNull('discord_id')
            ->pluck('discord_id');

        $currentDiscordId = $exceptMemberId
            ? PoliceMember::query()->whereKey($exceptMemberId)->value('discord_id')
            : null;

        return User::query()
            ->with(['applications' => fn ($query) => $query->where('type', ApplicationType::Police->value)])
            ->whereNotNull('discord_id')
            ->where(function ($query) {
                $query->where('admin_role', AdminRole::PoliceAdmin->value)
                    ->orWhereHas('applications', function ($application) {
                        $application->where('type', ApplicationType::Police->value)
                            ->where('status', 'approved');
                    });
            })
            ->where(function ($query) use ($takenDiscordIds, $currentDiscordId) {
                if ($takenDiscordIds->isEmpty()) {
                    return;
                }

                $query->whereNotIn('discord_id', $takenDiscordIds);

                if ($currentDiscordId) {
                    $query->orWhere('discord_id', $currentDiscordId);
                }
            })
            ->orderBy('username')
            ->get();
    }
}
