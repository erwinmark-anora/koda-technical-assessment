<?php

namespace App\Contracts;

use App\Models\Project;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface ProjectRepositoryInterface
{
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
    public function paginate(array $filters): LengthAwarePaginator;

    public function find(int $id): ?Project;

    /**
     * @param  array<string, mixed>  $attributes  Validated project attributes.
     */
    public function create(array $attributes): Project;

    /**
     * @param  array<string, mixed>  $attributes  Validated project attributes.
     */
    public function update(Project $project, array $attributes): Project;

    public function delete(Project $project): void;
}
