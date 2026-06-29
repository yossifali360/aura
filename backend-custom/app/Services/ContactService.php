<?php

declare(strict_types=1);

namespace App\Services;

use App\Http\Requests\ContactRequest;
use App\Models\ContactMessage;
use App\Repositories\ContactMessageRepository;

class ContactService
{
    public function __construct(protected ContactMessageRepository $repository)
    {
    }

    public function store(ContactRequest $request): ContactMessage
    {
        return $this->repository->create($request->validated());
    }
}
