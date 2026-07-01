<?php

declare(strict_types=1);

namespace App\Http\Requests;

class UpdatePoliceMemberRequest extends StorePoliceMemberRequest
{
    public function rules(): array
    {
        $id = (int) $this->route('id');

        return $this->memberRules($id);
    }
}
