<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class PromoteLatestUserToAdmin extends Command
{
    protected $signature = 'aura:make-me-admin {--discord-id= : Discord user ID to promote}';

    protected $description = 'Grant admin access to a user';

    public function handle(): int
    {
        $discordId = $this->option('discord-id');

        $user = $discordId
            ? User::query()->where('discord_id', $discordId)->first()
            : User::query()->latest('id')->first();

        if (! $user) {
            $this->error('User not found. Log in with Discord first, or pass --discord-id=YOUR_ID');

            return self::FAILURE;
        }

        $user->update(['admin_role' => 'super_admin']);

        $this->info("Admin enabled for {$user->first_name} (@{$user->username})");
        $this->info("Discord ID: {$user->discord_id}");
        $this->line('Log out and log back in on the website to refresh your session.');

        return self::SUCCESS;
    }
}
