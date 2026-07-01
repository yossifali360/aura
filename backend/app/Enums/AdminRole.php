<?php

declare(strict_types=1);

namespace App\Enums;

enum AdminRole: string
{
    case SuperAdmin = 'super_admin';
    case WhitelistAdmin = 'whitelist_admin';
    case PoliceAdmin = 'police_admin';
    case EmsAdmin = 'ems_admin';
    case UsersAdmin = 'users_admin';

    public function label(): string
    {
        return match ($this) {
            self::SuperAdmin => 'Super Admin',
            self::WhitelistAdmin => 'Whitelist Admin',
            self::PoliceAdmin => 'Police Admin',
            self::EmsAdmin => 'EMS Admin',
            self::UsersAdmin => 'Users Admin',
        };
    }

    public function canManageUsers(): bool
    {
        return in_array($this, [self::SuperAdmin, self::UsersAdmin], true);
    }

    public function canManageSettings(): bool
    {
        return $this === self::SuperAdmin;
    }

    public function canManageRules(): bool
    {
        return $this->canManageAnyRules();
    }

    public function canManageAnyRules(): bool
    {
        return in_array($this, [self::SuperAdmin, self::PoliceAdmin, self::EmsAdmin], true);
    }

    public function canManageRulesForType(string $type): bool
    {
        return match ($this) {
            self::SuperAdmin => true,
            self::PoliceAdmin => $type === ApplicationType::Police->value,
            self::EmsAdmin => $type === ApplicationType::Ems->value,
            default => false,
        };
    }

    public function canManageApplicationType(string $type): bool
    {
        return match ($this) {
            self::SuperAdmin => true,
            self::WhitelistAdmin => $type === ApplicationType::Server->value,
            self::PoliceAdmin => $type === ApplicationType::Police->value,
            self::EmsAdmin => $type === ApplicationType::Ems->value,
            default => false,
        };
    }

    public function canManageAnyApplicationTypes(): bool
    {
        return $this->canManageSettings()
            || in_array($this, [self::WhitelistAdmin, self::PoliceAdmin, self::EmsAdmin], true);
    }

    public function canViewContacts(): bool
    {
        return $this === self::SuperAdmin;
    }

    public function canViewApplicationType(string $type): bool
    {
        return match ($this) {
            self::SuperAdmin => true,
            self::WhitelistAdmin => $type === ApplicationType::Server->value,
            self::PoliceAdmin => $type === ApplicationType::Police->value,
            self::EmsAdmin => $type === ApplicationType::Ems->value,
            self::UsersAdmin => false,
        };
    }

    public function canAssignRole(?self $role): bool
    {
        if ($this === self::SuperAdmin) {
            return true;
        }

        if ($this === self::UsersAdmin) {
            return $role !== null
                && ! in_array($role, [self::SuperAdmin, self::UsersAdmin], true);
        }

        return false;
    }

    /**
     * @return list<string>
     */
    public function allowedApplicationTypes(): array
    {
        return match ($this) {
            self::SuperAdmin => [
                ApplicationType::Server->value,
                ApplicationType::Police->value,
                ApplicationType::Ems->value,
            ],
            self::WhitelistAdmin => [ApplicationType::Server->value],
            self::PoliceAdmin => [ApplicationType::Police->value],
            self::EmsAdmin => [ApplicationType::Ems->value],
            self::UsersAdmin => [],
        };
    }
}
