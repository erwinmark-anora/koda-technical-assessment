<?php

namespace App\Http\Requests\Projects;

use App\Enums\ProjectPriority;
use App\Enums\ProjectStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Validates the query string of `GET /api/projects`.
 */
class IndexProjectRequest extends FormRequest
{
    /** Sorting is only allowed on these columns. */
    public const SORTABLE_COLUMNS = [
        'client_name',
        'project_name',
        'status',
        'priority',
        'start_date',
        'due_date',
        'created_at',
    ];

    public const DEFAULT_PER_PAGE = 15;

    public const MAX_PER_PAGE = 100;

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['array'],
            'status.*' => [Rule::enum(ProjectStatus::class)],
            'priority' => ['array'],
            'priority.*' => [Rule::enum(ProjectPriority::class)],
            'sort' => ['nullable', Rule::in(self::SORTABLE_COLUMNS)],
            'direction' => ['nullable', Rule::in(['asc', 'desc'])],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:'.self::MAX_PER_PAGE],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'status.*' => 'Status filter must be one of: '.implode(', ', ProjectStatus::values()).'.',
            'priority.*' => 'Priority filter must be one of: '.implode(', ', ProjectPriority::values()).'.',
            'sort.in' => 'Projects can only be sorted by: '.implode(', ', self::SORTABLE_COLUMNS).'.',
            'direction.in' => 'Sort direction must be asc or desc.',
            'per_page.max' => 'At most '.self::MAX_PER_PAGE.' projects can be requested at once.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'status' => self::toList($this->input('status')),
            'priority' => self::toList($this->input('priority')),
        ]);
    }

    /**
     * The listing options, with defaults applied.
     *
     * @return array{
     *     search: string|null,
     *     statuses: list<string>,
     *     priorities: list<string>,
     *     sort: string,
     *     direction: 'asc'|'desc',
     *     per_page: int
     * }
     */
    public function filters(): array
    {
        $validated = $this->validated();

        $search = is_string($validated['search'] ?? null)
            ? trim($validated['search'])
            : '';

        return [
            'search' => $search === '' ? null : $search,
            'statuses' => self::toList($validated['status'] ?? []),
            'priorities' => self::toList($validated['priority'] ?? []),
            'sort' => is_string($validated['sort'] ?? null) ? $validated['sort'] : 'created_at',
            'direction' => ($validated['direction'] ?? 'desc') === 'asc' ? 'asc' : 'desc',
            'per_page' => (int) ($validated['per_page'] ?? self::DEFAULT_PER_PAGE),
        ];
    }

    /**
     * @return list<string>
     */
    private static function toList(mixed $value): array
    {
        if (is_string($value)) {
            $value = explode(',', $value);
        }

        if (! is_array($value)) {
            return [];
        }

        $strings = [];

        foreach ($value as $item) {
            if (! is_string($item) && ! is_int($item)) {
                continue;
            }

            $trimmed = trim((string) $item);

            if ($trimmed !== '') {
                $strings[] = $trimmed;
            }
        }

        return $strings;
    }
}
