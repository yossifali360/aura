<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRulesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $localeRules = [
            'title' => ['required', 'string', 'max:255'],
            'subtitle' => ['required', 'string', 'max:500'],
            'content' => ['required', 'string', 'max:50000'],
        ];

        $rules = [];
        foreach (['server', 'police', 'ems'] as $type) {
            foreach (['en', 'ar'] as $locale) {
                foreach ($localeRules as $field => $fieldRules) {
                    $rules["{$type}.{$locale}.{$field}"] = $fieldRules;
                }
            }
        }

        return $rules;
    }
}
