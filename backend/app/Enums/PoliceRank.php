<?php

declare(strict_types=1);

namespace App\Enums;

enum PoliceRank: string
{
    case InteriorMinister = 'interior_minister';
    case DeputyInteriorMinister = 'deputy_interior_minister';
    case FirstAssistantInteriorMinister = 'first_assistant_interior_minister';
    case General = 'general';
    case Brigadier = 'brigadier';
    case Colonel = 'colonel';
    case LieutenantColonel = 'lieutenant_colonel';
    case Major = 'major';
    case Captain = 'captain';
    case FirstLieutenant = 'first_lieutenant';
    case Lieutenant = 'lieutenant';
    case PoliceSecretary = 'police_secretary';
    case FirstSergeant = 'first_sergeant';
    case Sergeant = 'sergeant';
    case FirstCorporal = 'first_corporal';
    case Corporal = 'corporal';
    case FirstSoldier = 'first_soldier';
    case Soldier = 'soldier';
    case Trainee = 'trainee';
}
