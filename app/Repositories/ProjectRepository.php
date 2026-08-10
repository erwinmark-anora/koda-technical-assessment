<?php

namespace App\Repositories;

use App\Contracts\ProjectRepositoryInterface;
use App\Models\Project;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class ProjectRepository implements ProjectRepositoryInterface
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
    public function paginate(array $filters): LengthAwarePaginator
    {
        $builder = Project::query()
            ->when(
                $filters['search'],
                fn (Builder $builder, string $search) => $this->applySearch($builder, $search),
            )
            ->when(
                $filters['statuses'],
                fn (Builder $builder) => $builder->whereIn('status', $filters['statuses']),
            )
            ->when(
                $filters['priorities'],
                fn (Builder $builder) => $builder->whereIn('priority', $filters['priorities']),
            );

        return $this->applySorting($builder, $filters['sort'], $filters['direction'])
            ->paginate($filters['per_page'])
            ->withQueryString();
    }

    public function find(int $id): ?Project
    {
        return Project::query()->find($id);
    }

    /**
     * The model's casts turn the validated strings into enums and dates, so
     * the attributes are handed straight to Eloquent.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function create(array $attributes): Project
    {
        return Project::query()->create($attributes);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function update(Project $project, array $attributes): Project
    {
        $project->fill($attributes)->save();

        return $project->refresh();
    }

    public function delete(Project $project): void
    {
        $project->delete();
    }

    /**
     * Case-insensitive partial match across the free-text columns.
     *
     * @param  Builder<Project>  $builder
     * @return Builder<Project>
     */
    private function applySearch(Builder $builder, string $search): Builder
    {
        // Escape the user's own % and _ so they are matched literally rather
        // than acting as wildcards. LOWER(...) LIKE behaves the same on
        // PostgreSQL and SQLite, unlike PostgreSQL's ILIKE.
        $escaped = str_replace(['\\', '%', '_'], ['\\\\', '\%', '\_'], $search);
        $term = '%'.mb_strtolower($escaped).'%';

        return $builder->where(function (Builder $builder) use ($term): void {
            $builder->whereRaw('LOWER(client_name) LIKE ?', [$term])
                ->orWhereRaw('LOWER(project_name) LIKE ?', [$term])
                ->orWhereRaw('LOWER(description) LIKE ?', [$term]);
        });
    }

    /**
     * Status and priority are stored as slugs, so sorting them alphabetically
     * would be meaningless ("high" before "low" before "medium"). Both are
     * mapped to a CASE expression that restores their real world order.
     *
     * @param  Builder<Project>  $builder
     * @param  'asc'|'desc'  $direction
     * @return Builder<Project>
     */
    private function applySorting(Builder $builder, string $sort, string $direction): Builder
    {
        // IndexProjectRequest has already rejected any column or direction
        // that is not on its allow-list, so neither can inject SQL here.
        $sorted = match ($sort) {
            'priority' => $builder->orderByRaw(
                "CASE priority WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END {$direction}"
            ),
            'status' => $builder->orderByRaw(
                "CASE status WHEN 'planning' THEN 1 WHEN 'in_progress' THEN 2 WHEN 'on_hold' THEN 3 ELSE 4 END {$direction}"
            ),
            default => $builder->orderBy($sort, $direction),
        };

        // A deterministic tie-breaker keeps pagination stable when the sorted
        // column holds duplicates.
        return $sorted->orderBy('id', 'desc');
    }
}
