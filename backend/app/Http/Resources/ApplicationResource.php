<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Application */
class ApplicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'real_name' => $this->real_name,
            'age' => $this->age,
            'experience' => $this->experience,
            'character_concept' => $this->character_concept,
            'why_join' => $this->why_join,
            'rules_accepted' => $this->rules_accepted,
            'status' => $this->status,
            'user' => $this->whenLoaded('user', fn () => UserResource::make($this->user)),
        ];
    }
}
