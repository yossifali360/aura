<?php

declare(strict_types=1);

namespace App\Enums;

enum ApplicationType: string
{
    case Server = 'server';
    case Police = 'police';
    case Ems = 'ems';

    public function label(): string
    {
        return match ($this) {
            self::Server => 'City Application',
            self::Police => 'Police Department',
            self::Ems => 'EMS / Medical',
        };
    }

    public function labelAr(): string
    {
        return match ($this) {
            self::Server => 'تقديم المدينة',
            self::Police => 'الشرطة',
            self::Ems => 'الإسعاف',
        };
    }

    public function color(): int
    {
        return match ($this) {
            self::Server => 0xA855F7,
            self::Police => 0x3B82F6,
            self::Ems => 0xEF4444,
        };
    }
}
