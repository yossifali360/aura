<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\AdminRole;
use App\Http\Requests\SendApplicationMessageRequest;
use App\Http\Requests\UpdateApplicationStatusRequest;
use App\Http\Requests\UpdateApplicationTypesRequest;
use App\Http\Requests\UpdateRulesRequest;
use App\Http\Requests\UpdateUserRoleRequest;
use App\Models\Application;
use App\Models\User;
use App\Repositories\ApplicationRepository;
use App\Repositories\ContactMessageRepository;
use App\Repositories\SettingRepository;
use App\Repositories\UserRepository;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class AdminService
{
    public function __construct(
        protected ApplicationRepository $applicationRepository,
        protected ContactMessageRepository $contactRepository,
        protected UserRepository $userRepository,
        protected SettingRepository $settingRepository,
        protected DiscordBotService $discordBot,
    ) {
    }

    public function stats(User $actor): array
    {
        $role = $this->requireRole($actor);
        $allowedTypes = $role->allowedApplicationTypes();

        $applicationsByStatus = [];
        foreach ($allowedTypes as $type) {
            foreach ($this->applicationRepository->countByStatus($type) as $status => $count) {
                $applicationsByStatus[$status] = ($applicationsByStatus[$status] ?? 0) + $count;
            }
        }

        return [
            'applications_by_status' => $applicationsByStatus,
            'applications_by_type' => $this->applicationRepository->countByType($allowedTypes ?: null),
            'contact_messages' => $role->canViewContacts()
                ? $this->contactRepository->countAll()
                : 0,
        ];
    }

    public function applications(?string $type, ?string $status, User $actor): LengthAwarePaginator
    {
        $role = $this->requireRole($actor);

        if ($type) {
            $this->ensureApplicationType($role, $type);
        } elseif ($role !== AdminRole::SuperAdmin) {
            throw new AuthorizationException(__('Forbidden.'));
        }

        return $this->applicationRepository->paginateForAdmin($type, $status);
    }

    public function updateApplicationStatus(UpdateApplicationStatusRequest $request, int $id, User $actor): Application
    {
        $application = $this->applicationRepository->findById($id);

        if (! $application) {
            throw new ModelNotFoundException(__('Application not found'));
        }

        $this->ensureApplicationType($this->requireRole($actor), $application->type);

        $newStatus = $request->validated('status');
        $previousStatus = $application->status;

        $application = $this->applicationRepository->update($application, ['status' => $newStatus]);
        $application->loadMissing('user');

        if (
            in_array($newStatus, ['approved', 'rejected'], true)
            && $newStatus !== $previousStatus
            && $application->user?->discord_id
        ) {
            $this->discordBot->sendApplicationStatusUpdate($application, $application->user);
        }

        return $application;
    }

    public function deleteApplication(int $id, User $actor): void
    {
        $application = $this->applicationRepository->findById($id);

        if (! $application) {
            throw new ModelNotFoundException(__('Application not found'));
        }

        $this->ensureApplicationType($this->requireRole($actor), $application->type);

        $this->applicationRepository->delete($application);
    }

    public function contacts(User $actor): LengthAwarePaginator
    {
        $this->ensureContactsAccess($this->requireRole($actor));

        return $this->contactRepository->paginateForAdmin();
    }

    public function users(User $actor): Collection
    {
        $this->ensureManageUsers($this->requireRole($actor));

        return $this->userRepository->allOrdered();
    }

    public function updateUserRole(UpdateUserRoleRequest $request, int $id, User $actingUser): User
    {
        $actorRole = $this->requireRole($actingUser);
        $this->ensureManageUsers($actorRole);

        $user = $this->userRepository->findById($id);

        if (! $user) {
            throw new ModelNotFoundException(__('User not found'));
        }

        $newRole = $request->validated('admin_role');
        $targetRole = $newRole ? AdminRole::from($newRole) : null;

        if ($user->isConfiguredSuperAdmin() && $targetRole !== AdminRole::SuperAdmin) {
            throw ValidationException::withMessages([
                'admin_role' => [__('This user is a configured super admin and cannot be demoted.')],
            ]);
        }

        if (! $actorRole->canAssignRole($targetRole)) {
            throw new AuthorizationException(__('You cannot assign this admin role.'));
        }

        if ($user->id === $actingUser->id && $targetRole === null) {
            throw ValidationException::withMessages([
                'admin_role' => [__('You cannot remove your own admin access.')],
            ]);
        }

        return $this->userRepository->update($user, ['admin_role' => $targetRole?->value]);
    }

    public function applicationTypes(User $actor): array
    {
        $this->ensureSettingsAccess($this->requireRole($actor));

        return $this->settingRepository->getApplicationTypes();
    }

    public function updateApplicationTypes(UpdateApplicationTypesRequest $request, User $actor): array
    {
        $this->ensureSettingsAccess($this->requireRole($actor));

        return $this->settingRepository->setApplicationTypes($request->validated());
    }

    public function rules(User $actor): array
    {
        $this->ensureRulesAccess($this->requireRole($actor));

        return $this->settingRepository->getRules();
    }

    public function updateRules(UpdateRulesRequest $request, User $actor): array
    {
        $this->ensureRulesAccess($this->requireRole($actor));

        return $this->settingRepository->setRules($request->validated());
    }

    public function sendApplicationMessages(SendApplicationMessageRequest $request, User $actor): array
    {
        $role = $this->requireRole($actor);
        $ids = $request->validated('application_ids');
        $message = $request->validated('message');

        $applications = $this->applicationRepository->findByIds($ids);

        if ($applications->isEmpty()) {
            throw ValidationException::withMessages([
                'application_ids' => [__('No applications found.')],
            ]);
        }

        foreach ($applications as $application) {
            $this->ensureApplicationType($role, $application->type);
        }

        $discordIds = $applications
            ->map(fn (Application $app) => $app->user?->discord_id)
            ->filter()
            ->values()
            ->all();

        if ($discordIds === []) {
            throw ValidationException::withMessages([
                'application_ids' => [__('Selected applications have no linked Discord users.')],
            ]);
        }

        $result = $this->discordBot->sendBulkDirectMessages($discordIds, $message);

        return [
            'sent' => $result['sent'],
            'failed' => $result['failed'],
            'total' => count($discordIds),
            'failures' => $result['failures'],
        ];
    }

    private function requireRole(User $user): AdminRole
    {
        $role = $user->effectiveAdminRole();

        if (! $role) {
            throw new AuthorizationException(__('Forbidden.'));
        }

        return $role;
    }

    private function ensureApplicationType(AdminRole $role, string $type): void
    {
        if (! $role->canViewApplicationType($type)) {
            throw new AuthorizationException(__('Forbidden.'));
        }
    }

    private function ensureManageUsers(AdminRole $role): void
    {
        if (! $role->canManageUsers()) {
            throw new AuthorizationException(__('Forbidden.'));
        }
    }

    private function ensureSettingsAccess(AdminRole $role): void
    {
        if (! $role->canManageSettings()) {
            throw new AuthorizationException(__('Forbidden.'));
        }
    }

    private function ensureRulesAccess(AdminRole $role): void
    {
        if (! $role->canManageRules()) {
            throw new AuthorizationException(__('Forbidden.'));
        }
    }

    private function ensureContactsAccess(AdminRole $role): void
    {
        if (! $role->canViewContacts()) {
            throw new AuthorizationException(__('Forbidden.'));
        }
    }
}
