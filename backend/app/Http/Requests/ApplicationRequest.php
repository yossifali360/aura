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
        $type = $this->input('type');

        if ($type === ApplicationType::Police->value) {
            return [
                'type' => ['required', 'string', Rule::enum(ApplicationType::class)],
                'age' => ['required', 'integer', 'min:17', 'max:99'],
                'character_concept' => ['required', 'string', 'max:100'],
                'why_join' => ['required', 'string', 'max:2000'],
                'experience' => ['nullable', 'string', 'max:2000'],
                'rules_accepted' => ['required', 'accepted'],
            ];
        }

        if ($type === ApplicationType::Server->value) {
            return [
                'type' => ['required', 'string', Rule::enum(ApplicationType::class)],
                'real_name' => ['required', 'string', 'max:100'],
                'age' => ['required', 'integer', 'min:17', 'max:99'],
                'character_concept' => ['required', 'string', 'max:100'],
                'experience' => [
                    'required',
                    'string',
                    'max:500',
                    'url',
                    'regex:/steamcommunity\.com\/(profiles|id)\//i',
                ],
                'why_join' => ['required', 'string', 'max:3000'],
                'rules_accepted' => ['required', 'accepted'],
            ];
        }

        return [
            'type' => ['required', 'string', Rule::enum(ApplicationType::class)],
            'age' => ['required', 'integer', 'min:17', 'max:99'],
            'experience' => ['required', 'string', 'max:2000'],
            'character_concept' => ['required', 'string', 'max:3000'],
            'why_join' => ['required', 'string', 'max:2000'],
            'rules_accepted' => ['required', 'accepted'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->input('type') === ApplicationType::Police->value && ! $this->filled('experience')) {
            $this->merge(['experience' => '']);
        }

        if ($this->input('type') === ApplicationType::Server->value && $this->filled('experience')) {
            $steamLink = preg_replace('#/home/?$#i', '', trim((string) $this->input('experience'))) ?? '';

            $this->merge(['experience' => $steamLink]);
        }
    }
}
