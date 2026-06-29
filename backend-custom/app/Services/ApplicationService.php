<?php

declare(strict_types=1);

namespace App\Services;

use App\Http\Requests\ApplicationRequest;
use App\Models\Application;
use App\Models\User;
use App\Repositories\ApplicationRepository;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

class ApplicationService
{
    public function __construct(protected ApplicationRepository $repository)
    {
    }

    public function store(ApplicationRequest $request, User $user): Application
    {
        $existing = $this->repository->findLatestByUserId($user->id);

        if ($existing && in_array($existing->status, ['pending', 'approved'], true)) {
            throw ValidationException::withMessages([
                'application' => [__('You already have an active application.')],
            ]);
        }

        return $this->repository->create([
            ...$request->validated(),
            'user_id' => $user->id,
            'status' => 'pending',
        ]);
    }

    public function getLatestForUser(User $user): Application
    {
        $application = $this->repository->findLatestByUserId($user->id);

        if (! $application) {
            throw new ModelNotFoundException(__('Application not found'));
        }

        return $application;
    }
}
