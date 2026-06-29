<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\ApplicationType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', 'string', Rule::enum(ApplicationType::class)],
            'age' => ['required', 'integer', 'min:16', 'max:99'],
            'experience' => ['required', 'string', 'max:2000'],
            'character_concept' => ['required', 'string', 'max:3000'],
            'why_join' => ['required', 'string', 'max:2000'],
            'rules_accepted' => ['required', 'accepted'],
        ];
    }
}
