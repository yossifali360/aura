<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\AdminRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'discord_id',
        'username',
        'first_name',
        'email',
        'avatar',
        'admin_role',
    ];

    protected $hidden = [
        'remember_token',
    ];

    public static function isConfiguredSuperAdminDiscordId(string $discordId): bool
    {
        $ids = config('services.discord.super_admin_discord_ids', []);

        return in_array($discordId, $ids, true);
    }

    public function isConfiguredSuperAdmin(): bool
    {
        return self::isConfiguredSuperAdminDiscordId($this->discord_id);
    }

    public function effectiveAdminRole(): ?AdminRole
    {
        if ($this->isConfiguredSuperAdmin()) {
            return AdminRole::SuperAdmin;
        }

        if ($this->admin_role) {
            return AdminRole::tryFrom($this->admin_role);
        }

        return null;
    }

    public function isAdmin(): bool
    {
        return $this->effectiveAdminRole() !== null;
    }

    public function isSuperAdmin(): bool
    {
        return $this->effectiveAdminRole() === AdminRole::SuperAdmin;
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }
}
