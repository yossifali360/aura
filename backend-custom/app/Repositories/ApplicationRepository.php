<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Application;

class ApplicationRepository
{
    public function create(array $data): Application
    {
        return Application::query()->create($data);
    }

    public function findLatestByUserId(int $userId): ?Application
    {
        return Application::query()
            ->where('user_id', $userId)
            ->latest()
            ->first();
    }
}
