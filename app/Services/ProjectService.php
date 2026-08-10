<?php

namespace App\Services;

use App\Contracts\ProjectRepositoryInterface;
use App\Exceptions\ProjectNotFoundException;
use App\Models\Project;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Application service for the project use cases.
 *
 * Controllers stay thin by delegating here, and the service in turn depends
 * only on the {@see ProjectRepositoryInterface} abstraction.
 */
class ProjectService
{
    public function __construct(private ProjectRepositoryInterface $repository) {}

    /**
     * @param  array{
     *     search: string|null,
     *     statuses: list<string>,
     *     priorities: list<string>,
     *     sort: string,
     *     direction: 'asc'|'desc',
     *     per_page: int
     * }  $filters
     * @return LengthAwarePaginator<int, Project>
     */
    public function paginate(array $filters): LengthAwarePaginator
    {
        return $this->repository->paginate($filters);
    }

    /**
     * @throws ProjectNotFoundException
     */
    public function findOrFail(int $id): Project
    {
        $project = $this->repository->find($id);

        if ($project === null) {
            throw ProjectNotFoundException::withId($id);
        }

        return $project;
    }

    /**
     * @param  array<string, mixed>  $attributes  Validated project attributes.
     */
    public function create(array $attributes): Project
    {
        return $this->repository->create($attributes);
    }

    /**
     * @param  array<string, mixed>  $attributes  Validated project attributes.
     *
     * @throws ProjectNotFoundException
     */
    public function update(int $id, array $attributes): Project
    {
        return $this->repository->update($this->findOrFail($id), $attributes);
    }

    /**
     * @throws ProjectNotFoundException
     */
    public function delete(int $id): void
    {
        $this->repository->delete($this->findOrFail($id));
    }
}
