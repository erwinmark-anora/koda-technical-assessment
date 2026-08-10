<?php

namespace App\Concerns;

use App\Enums\ProjectPriority;
use App\Enums\ProjectStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

/**
 * The validation contract for writing a project.
 *
 * Store and update share one definition so the two endpoints can never drift
 * apart, which is the sort of gap that lets invalid rows in through the back
 * door.
 */
trait ProjectValidationRules
{
    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    protected function projectRules(): array
    {
        $dueDateRules = ['nullable', 'date'];

        if ($this->hasStartDate()) {
            $dueDateRules[] = 'after_or_equal:start_date';
        }

        return [
            'client_name' => ['required', 'string', 'max:255'],
            'project_name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'status' => ['required', Rule::enum(ProjectStatus::class)],
            'priority' => ['required', Rule::enum(ProjectPriority::class)],
            'start_date' => ['nullable', 'date'],
            'due_date' => $dueDateRules,
        ];
    }

    /**
     * @return array<string, string>
     */
    protected function projectMessages(): array
    {
        return [
            'client_name.required' => 'Client name is required.',
            'project_name.required' => 'Project name is required.',
            'status.required' => 'Status is required.',
            'status.enum' => 'Status must be one of: '.self::labelList(ProjectStatus::class).'.',
            'priority.required' => 'Priority is required.',
            'priority.enum' => 'Priority must be one of: '.self::labelList(ProjectPriority::class).'.',
            'start_date.date' => 'Start date must be a valid date.',
            'due_date.date' => 'Due date must be a valid date.',
            'due_date.after_or_equal' => 'Due date cannot be earlier than the start date.',
        ];
    }

    /**
     * Whether the incoming payload carries a usable start date.
     */
    private function hasStartDate(): bool
    {
        $startDate = $this->input('start_date');

        return is_string($startDate) && trim($startDate) !== '';
    }

    /**
     * A human readable list of the accepted labels for an enum.
     *
     * @param  class-string<ProjectStatus|ProjectPriority>  $enum
     */
    private static function labelList(string $enum): string
    {
        return implode(', ', array_map(
            static fn (array $option): string => $option['label'],
            $enum::options(),
        ));
    }
}
