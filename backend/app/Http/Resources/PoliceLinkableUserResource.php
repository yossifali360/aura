<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Enums\AdminRole;
use App\Enums\ApplicationType;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\User */
class PoliceLinkableUserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isPoliceAdmin = $this->effectiveAdminRole() === AdminRole::PoliceAdmin;

        return [
            'id' => $this->id,
            'discord_id' => $this->discord_id,
            'username' => $this->username,
            'first_name' => $this->first_name,
            'avatar' => $this->avatar,
            'police_role' => $isPoliceAdmin ? 'police_admin' : 'approved_applicant',
            'has_approved_police_application' => $this->applications
                ->contains(fn ($application) => $application->type === ApplicationType::Police->value
                    && $application->status === 'approved'),
        ];
    }
}
