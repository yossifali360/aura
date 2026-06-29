<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\ContactMessage;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ContactMessageRepository
{
    public function create(array $data): ContactMessage
    {
        return ContactMessage::query()->create($data);
    }

    public function paginateForAdmin(int $perPage = 15): LengthAwarePaginator
    {
        return ContactMessage::query()->latest()->paginate($perPage);
    }

    public function countAll(): int
    {
        return ContactMessage::query()->count();
    }
}
