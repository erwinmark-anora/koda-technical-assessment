<?php

use App\Enums\ProjectPriority;
use App\Enums\ProjectStatus;
use App\Models\Project;
use Database\Seeders\ProjectSeeder;

it('loads the reference projects supplied with the brief', function () {
    $this->seed(ProjectSeeder::class);

    expect(Project::query()->count())->toBe(12);

    $acme = Project::query()
        ->where('project_name', 'Corporate Website Redesign')
        ->sole();

    // The source file speaks in labels ("In Progress"); the column stores slugs.
    expect($acme)
        ->client_name->toBe('Acme Corporation')
        ->status->toBe(ProjectStatus::InProgress)
        ->priority->toBe(ProjectPriority::High)
        ->and($acme->start_date?->toDateString())->toBe('2026-06-01')
        ->and($acme->due_date?->toDateString())->toBe('2026-07-15');
});

it('can be re-run without duplicating projects', function () {
    $this->seed(ProjectSeeder::class);
    $this->seed(ProjectSeeder::class);

    expect(Project::query()->count())->toBe(12);
});
