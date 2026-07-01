<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\PoliceMember;
use Illuminate\Support\Collection;

class PoliceMemberRepository
{
    public function allOrdered(): Collection
    {
        return PoliceMember::query()
            ->orderBy('badge_number')
            ->get();
    }

    public function activeOrdered(): Collection
    {
        return PoliceMember::query()
            ->where('status', 'active')
            ->orderBy('badge_number')
            ->get();
    }

    public function findById(int $id): ?PoliceMember
    {
        return PoliceMember::query()->find($id);
    }

    public function findByDiscordId(string $discordId): ?PoliceMember
    {
        return PoliceMember::query()
            ->where('discord_id', $discordId)
            ->first();
    }

    public function create(array $data): PoliceMember
    {
        return PoliceMember::query()->create($data);
    }

    public function update(PoliceMember $member, array $data): PoliceMember
    {
        $member->update($data);

        return $member->refresh();
    }

    public function delete(PoliceMember $member): void
    {
        $member->delete();
    }
}
