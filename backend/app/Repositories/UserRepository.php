<?php

declare(strict_types=1);

namespace App\Repositories;

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
}
