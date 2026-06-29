<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Application;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ApplicationRepository
{
    public function create(array $data): Application
    {
        return Application::query()->create($data);
    }

    public function findLatestByUserIdAndType(int $userId, string $type): ?Application
    {
        return Application::query()
            ->where('user_id', $userId)
            ->where('type', $type)
            ->latest()
            ->first();
    }

    public function findActiveByUserIdAndType(int $userId, string $type): ?Application
    {
        return Application::query()
            ->where('user_id', $userId)
            ->where('type', $type)
            ->whereIn('status', ['pending', 'approved'])
            ->latest()
            ->first();
    }

    public function findById(int $id): ?Application
    {
        return Application::query()->find($id);
    }

    public function findByIds(array $ids): \Illuminate\Support\Collection
    {
        return Application::query()
            ->with('user')
            ->whereIn('id', $ids)
            ->get();
    }

    public function update(Application $application, array $data): Application
    {
        $application->update($data);

        return $application->fresh(['user']);
    }

    public function delete(Application $application): void
    {
        $application->delete();
    }

    public function paginateForAdmin(?string $type, ?string $status, int $perPage = 15): LengthAwarePaginator
    {
        return Application::query()
            ->with('user')
            ->when($type, fn ($q) => $q->where('type', $type))
            ->when($status, fn ($q) => $q->where('status', $status))
            ->latest()
            ->paginate($perPage);
    }

    public function countByStatus(?string $type = null): array
    {
        return Application::query()
            ->when($type, fn ($q) => $q->where('type', $type))
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status')
            ->all();
    }

    public function countByType(?array $types = null): array
    {
        return Application::query()
            ->when($types, fn ($q) => $q->whereIn('type', $types))
            ->selectRaw('type, count(*) as total')
            ->groupBy('type')
            ->pluck('total', 'type')
            ->all();
    }
}
