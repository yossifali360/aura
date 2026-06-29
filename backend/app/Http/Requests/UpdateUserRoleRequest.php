<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\AdminRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'admin_role' => ['nullable', 'string', Rule::enum(AdminRole::class)],
        ];
    }
}
