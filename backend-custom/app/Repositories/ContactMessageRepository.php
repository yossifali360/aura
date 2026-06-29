<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\ContactMessage;

class ContactMessageRepository
{
    public function create(array $data): ContactMessage
    {
        return ContactMessage::query()->create($data);
    }
}
