<?php

namespace App\Models;

use App\Enums\ProjectPriority;
use App\Enums\ProjectStatus;
use Carbon\CarbonImmutable;
use Database\Factories\ProjectFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $client_name
 * @property string $project_name
 * @property string|null $description
 * @property ProjectStatus $status
 * @property ProjectPriority $priority
 * @property CarbonImmutable|null $start_date
 * @property CarbonImmutable|null $due_date
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
#[Fillable([
    'client_name',
    'project_name',
    'description',
    'status',
    'priority',
    'start_date',
    'due_date',
])]
class Project extends Model
{
    /** @use HasFactory<ProjectFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => ProjectStatus::class,
            'priority' => ProjectPriority::class,
            'start_date' => 'immutable_date',
            'due_date' => 'immutable_date',
        ];
    }

    /**
     * Whether the project has passed its due date without being completed.
     */
    public function isOverdue(): bool
    {
        return $this->due_date !== null
            && $this->status !== ProjectStatus::Completed
            && $this->due_date->isBefore(CarbonImmutable::today());
    }
}
