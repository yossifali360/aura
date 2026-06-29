<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SendApplicationMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'application_ids' => ['required', 'array', 'min:1'],
            'application_ids.*' => ['required', 'integer', 'exists:applications,id'],
            'message' => ['required', 'string', 'min:1', 'max:2000'],
        ];
    }
}
