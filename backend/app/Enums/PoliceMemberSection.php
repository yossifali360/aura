<?php

declare(strict_types=1);

namespace App\Enums;

enum PoliceMemberSection: string
{
    case MinistryLeadership = 'ministry_leadership';
    case ExecutiveLeadership = 'executive_leadership';
    case Officers = 'officers';
    case Secretaries = 'secretaries';
    case Sergeants = 'sergeants';
    case Corporals = 'corporals';
    case Soldiers = 'soldiers';
    case Academy = 'academy';
}
