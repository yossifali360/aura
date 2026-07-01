<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'age' => ['required', 'integer', 'min:17', 'max:99'],
            'experience' => ['required', 'string', 'max:2000'],
            'character_concept' => ['required', 'string', 'max:3000'],
            'why_join' => ['required', 'string', 'max:2000'],
            'rules_accepted' => ['required', 'accepted'],
        ];
    }
}
