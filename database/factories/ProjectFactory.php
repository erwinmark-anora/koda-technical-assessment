<?php

namespace Database\Factories;

use App\Enums\ProjectPriority;
use App\Enums\ProjectStatus;
use App\Models\Project;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
{
    protected $model = Project::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = CarbonImmutable::instance(
            $this->faker->dateTimeBetween('-3 months', '+1 month'),
        )->startOfDay();

        return [
            'client_name' => $this->faker->company(),
            'project_name' => ucfirst(rtrim($this->faker->sentence(3), '.')),
            'description' => $this->faker->optional(0.9)->sentence(12),
            'status' => $this->faker->randomElement(ProjectStatus::cases()),
            'priority' => $this->faker->randomElement(ProjectPriority::cases()),
            'start_date' => $startDate,
            'due_date' => $startDate->addDays($this->faker->numberBetween(14, 120)),
        ];
    }

    public function status(ProjectStatus $status): self
    {
        return $this->state(fn (): array => ['status' => $status]);
    }

    public function priority(ProjectPriority $priority): self
    {
        return $this->state(fn (): array => ['priority' => $priority]);
    }

    /**
     * A project whose due date has already passed and is not complete.
     */
    public function overdue(): self
    {
        return $this->state(fn (): array => [
            'status' => ProjectStatus::InProgress,
            'start_date' => CarbonImmutable::today()->subMonths(2),
            'due_date' => CarbonImmutable::today()->subWeek(),
        ]);
    }
}
