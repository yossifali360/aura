<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\PoliceMember */
class PoliceMemberResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'badge_number' => $this->badge_number,
            'name' => $this->name,
            'shoulder_rank' => $this->shoulder_rank,
            'rank' => $this->rank?->value ?? $this->rank,
            'section' => $this->section?->value ?? $this->section,
            'status' => $this->status?->value ?? $this->status,
            'position' => $this->position,
            'discord_username' => $this->discord_username,
            'discord_id' => $this->discord_id,
            'points_exempt' => $this->points_exempt,
            'points' => $this->points,
            'warnings' => $this->warnings,
            'last_promotion_date' => $this->last_promotion_date?->format('Y-m-d'),
            'joined_at' => $this->joined_at?->format('Y-m-d'),
            'specialty_speed' => $this->specialty_speed?->value ?? $this->specialty_speed,
            'specialty_motor' => $this->specialty_motor?->value ?? $this->specialty_motor,
            'specialty_air' => $this->specialty_air?->value ?? $this->specialty_air,
            'specialty_offroad' => $this->specialty_offroad?->value ?? $this->specialty_offroad,
            'specialty_operations' => $this->specialty_operations?->value ?? $this->specialty_operations,
            'specialty_negotiation' => $this->specialty_negotiation?->value ?? $this->specialty_negotiation,
            'specialty_national_security' => $this->specialty_national_security?->value ?? $this->specialty_national_security,
        ];
    }
}
