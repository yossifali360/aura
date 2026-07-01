<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\PoliceMemberSection;
use App\Enums\PoliceMemberStatus;
use App\Enums\PoliceRank;
use App\Enums\PoliceSpecialtyStatus;
use Illuminate\Database\Eloquent\Model;

class PoliceMember extends Model
{
    protected $fillable = [
        'badge_number',
        'name',
        'shoulder_rank',
        'rank',
        'section',
        'status',
        'position',
        'discord_username',
        'discord_id',
        'points_exempt',
        'points',
        'warnings',
        'last_promotion_date',
        'joined_at',
        'specialty_speed',
        'specialty_motor',
        'specialty_air',
        'specialty_offroad',
        'specialty_operations',
        'specialty_negotiation',
        'specialty_national_security',
    ];

    protected function casts(): array
    {
        return [
            'points_exempt' => 'boolean',
            'points' => 'integer',
            'warnings' => 'integer',
            'last_promotion_date' => 'date',
            'joined_at' => 'date',
            'section' => PoliceMemberSection::class,
            'status' => PoliceMemberStatus::class,
            'rank' => PoliceRank::class,
            'specialty_speed' => PoliceSpecialtyStatus::class,
            'specialty_motor' => PoliceSpecialtyStatus::class,
            'specialty_air' => PoliceSpecialtyStatus::class,
            'specialty_offroad' => PoliceSpecialtyStatus::class,
            'specialty_operations' => PoliceSpecialtyStatus::class,
            'specialty_negotiation' => PoliceSpecialtyStatus::class,
            'specialty_national_security' => PoliceSpecialtyStatus::class,
        ];
    }
}
