<?php

declare(strict_types=1);

namespace App\Enums;

enum PoliceSpecialtyStatus: string
{
    case None = 'none';
    case Certified = 'certified';
    case Training = 'training';
}
