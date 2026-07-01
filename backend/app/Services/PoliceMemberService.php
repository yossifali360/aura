<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\AdminRole;
use App\Enums\PoliceMemberSection;
use App\Enums\PoliceMemberStatus;
use App\Enums\PoliceRank;
use App\Enums\PoliceSpecialtyStatus;
use App\Http\Requests\StorePoliceMemberRequest;
use App\Http\Requests\UpdatePoliceMemberRequest;
use App\Models\PoliceMember;
use App\Models\User;
use App\Repositories\PoliceMemberRepository;
use App\Repositories\UserRepository;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Collection;

class PoliceMemberService
{
    public function __construct(
        protected PoliceMemberRepository $repository,
        protected UserRepository $userRepository,
    ) {
    }

    public function rosterForPublic(): array
    {
        $members = $this->repository->activeOrdered();

        return $this->groupBySection($members);
    }

    public function rosterForAdmin(User $actor): Collection
    {
        $this->ensureManageAccess($actor);

        return $this->repository->allOrdered();
    }

    public function linkableUsers(User $actor, ?int $exceptMemberId = null): Collection
    {
        $this->ensureManageAccess($actor);

        return $this->userRepository->linkableForPoliceRoster($exceptMemberId);
    }

    public function profileForUser(User $user): ?PoliceMember
    {
        if (! $user->discord_id) {
            return null;
        }

        return $this->repository->findByDiscordId($user->discord_id);
    }

    public function store(StorePoliceMemberRequest $request, User $actor): PoliceMember
    {
        $this->ensureManageAccess($actor);

        return $this->repository->create($this->normalizePayload($request->validated()));
    }

    public function update(UpdatePoliceMemberRequest $request, int $id, User $actor): PoliceMember
    {
        $this->ensureManageAccess($actor);

        $member = $this->repository->findById($id);

        if (! $member) {
            throw new ModelNotFoundException(__('Police member not found.'));
        }

        return $this->repository->update($member, $this->normalizePayload($request->validated()));
    }

    public function destroy(int $id, User $actor): void
    {
        $this->ensureManageAccess($actor);

        $member = $this->repository->findById($id);

        if (! $member) {
            throw new ModelNotFoundException(__('Police member not found.'));
        }

        $this->repository->delete($member);
    }

    public function options(): array
    {
        return [
            'sections' => array_map(fn (PoliceMemberSection $s) => $s->value, PoliceMemberSection::cases()),
            'statuses' => array_map(fn (PoliceMemberStatus $s) => $s->value, PoliceMemberStatus::cases()),
            'ranks' => array_map(fn (PoliceRank $r) => $r->value, PoliceRank::cases()),
            'specialty_statuses' => array_map(fn (PoliceSpecialtyStatus $s) => $s->value, PoliceSpecialtyStatus::cases()),
            'specialty_fields' => [
                'specialty_speed',
                'specialty_motor',
                'specialty_air',
                'specialty_offroad',
                'specialty_operations',
                'specialty_negotiation',
                'specialty_national_security',
            ],
        ];
    }

    private function ensureManageAccess(User $actor): void
    {
        $role = $actor->effectiveAdminRole();

        if (! in_array($role, [AdminRole::SuperAdmin, AdminRole::PoliceAdmin], true)) {
            throw new AuthorizationException(__('Forbidden.'));
        }
    }

  /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function normalizePayload(array $payload): array
    {
        if (array_key_exists('points_exempt', $payload) && $payload['points_exempt']) {
            $payload['points'] = null;
        }

        foreach ([
            'specialty_speed',
            'specialty_motor',
            'specialty_air',
            'specialty_offroad',
            'specialty_operations',
            'specialty_negotiation',
            'specialty_national_security',
        ] as $field) {
            $payload[$field] = $payload[$field] ?? PoliceSpecialtyStatus::None->value;
        }

        return $payload;
    }

    /**
     * @return array<string, list<PoliceMember>>
     */
    private function groupBySection(Collection $members): array
    {
        $grouped = [];

        foreach (PoliceMemberSection::cases() as $section) {
            $grouped[$section->value] = [];
        }

        foreach ($members as $member) {
            $key = $member->section instanceof PoliceMemberSection
                ? $member->section->value
                : (string) $member->section;
            $grouped[$key][] = $member;
        }

        return $grouped;
    }
}
