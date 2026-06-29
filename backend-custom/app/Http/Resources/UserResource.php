<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\User */
class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'discord_id' => $this->discord_id,
            'username' => $this->username,
            'first_name' => $this->first_name,
            'email' => $this->email,
            'avatar' => $this->avatar,
        ];
    }
}
