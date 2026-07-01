<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\PoliceMemberSection;
use App\Enums\PoliceMemberStatus;
use App\Enums\PoliceRank;
use App\Enums\PoliceSpecialtyStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePoliceMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return $this->memberRules();
    }

    /**
     * @return array<string, mixed>
     */
    protected function memberRules(?int $ignoreId = null): array
    {
        return [
            'badge_number' => [
                'required',
                'string',
                'max:20',
                Rule::unique('police_members', 'badge_number')->ignore($ignoreId),
            ],
            'name' => ['required', 'string', 'max:120'],
            'shoulder_rank' => ['nullable', 'string', 'max:60'],
            'rank' => ['required', 'string', Rule::enum(PoliceRank::class)],
            'section' => ['required', 'string', Rule::enum(PoliceMemberSection::class)],
            'status' => ['required', 'string', Rule::enum(PoliceMemberStatus::class)],
            'position' => ['nullable', 'string', 'max:255'],
            'discord_username' => ['nullable', 'string', 'max:80'],
            'discord_id' => [
                'nullable',
                'string',
                'max:32',
                'regex:/^\d{17,20}$/',
                Rule::unique('police_members', 'discord_id')->ignore($ignoreId),
            ],
            'points_exempt' => ['sometimes', 'boolean'],
            'points' => ['nullable', 'integer', 'min:0', 'max:999999'],
            'warnings' => ['sometimes', 'integer', 'min:0', 'max:255'],
            'last_promotion_date' => ['nullable', 'date'],
            'joined_at' => ['nullable', 'date'],
            'specialty_speed' => ['sometimes', 'string', Rule::enum(PoliceSpecialtyStatus::class)],
            'specialty_motor' => ['sometimes', 'string', Rule::enum(PoliceSpecialtyStatus::class)],
            'specialty_air' => ['sometimes', 'string', Rule::enum(PoliceSpecialtyStatus::class)],
            'specialty_offroad' => ['sometimes', 'string', Rule::enum(PoliceSpecialtyStatus::class)],
            'specialty_operations' => ['sometimes', 'string', Rule::enum(PoliceSpecialtyStatus::class)],
            'specialty_negotiation' => ['sometimes', 'string', Rule::enum(PoliceSpecialtyStatus::class)],
            'specialty_national_security' => ['sometimes', 'string', Rule::enum(PoliceSpecialtyStatus::class)],
        ];
    }
}
