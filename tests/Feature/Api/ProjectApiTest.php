<?php

use App\Enums\ProjectPriority;
use App\Enums\ProjectStatus;
use App\Models\Project;

it('lists projects with pagination metadata', function () {
    Project::factory()->count(3)->create();

    $this->getJson('/api/projects')
        ->assertOk()
        ->assertJsonCount(3, 'data')
        ->assertJsonPath('meta.total', 3)
        ->assertJsonStructure([
            'data' => [[
                'id',
                'client_name',
                'project_name',
                'description',
                'status',
                'status_label',
                'priority',
                'priority_label',
                'start_date',
                'due_date',
                'is_overdue',
            ]],
            'meta' => ['current_page', 'last_page', 'per_page', 'total'],
        ]);
});

it('returns a single project', function () {
    $project = Project::factory()->create([
        'client_name' => 'Acme Corporation',
        'project_name' => 'Corporate Website Redesign',
        'status' => ProjectStatus::InProgress,
        'priority' => ProjectPriority::High,
    ]);

    $this->getJson("/api/projects/{$project->id}")
        ->assertOk()
        ->assertJsonPath('data.id', $project->id)
        ->assertJsonPath('data.client_name', 'Acme Corporation')
        ->assertJsonPath('data.status', 'in_progress')
        ->assertJsonPath('data.status_label', 'In Progress')
        ->assertJsonPath('data.priority_label', 'High');
});

it('returns a meaningful 404 for a project that does not exist', function () {
    $this->getJson('/api/projects/9999')
        ->assertNotFound()
        ->assertJsonPath('message', 'No project exists with the id [9999].');
});

it('creates a project', function () {
    $payload = [
        'client_name' => 'GreenLeaf Cafe',
        'project_name' => 'Online Ordering System',
        'description' => 'Develop an online ordering platform for customers.',
        'status' => 'planning',
        'priority' => 'medium',
        'start_date' => '2026-06-10',
        'due_date' => '2026-08-01',
    ];

    $this->postJson('/api/projects', $payload)
        ->assertCreated()
        ->assertJsonPath('data.project_name', 'Online Ordering System')
        ->assertJsonPath('data.status', 'planning')
        ->assertJsonPath('data.start_date', '2026-06-10');

    $this->assertDatabaseHas('projects', [
        'client_name' => 'GreenLeaf Cafe',
        'project_name' => 'Online Ordering System',
        'status' => 'planning',
        'priority' => 'medium',
    ]);
});

it('creates a project without optional fields', function () {
    $this->postJson('/api/projects', [
        'client_name' => 'Solo Client',
        'project_name' => 'Minimal Project',
        'status' => 'planning',
        'priority' => 'low',
    ])
        ->assertCreated()
        ->assertJsonPath('data.description', null)
        ->assertJsonPath('data.start_date', null)
        ->assertJsonPath('data.due_date', null);
});

it('treats cleared optional fields as null', function () {
    // The React form submits empty strings for fields the user cleared;
    // Laravel's ConvertEmptyStringsToNull middleware turns them into nulls
    // before validation runs.
    $this->postJson('/api/projects', [
        'client_name' => 'Solo Client',
        'project_name' => 'Minimal Project',
        'description' => '',
        'status' => 'planning',
        'priority' => 'low',
        'start_date' => '',
        'due_date' => '',
    ])
        ->assertCreated()
        ->assertJsonPath('data.description', null)
        ->assertJsonPath('data.start_date', null)
        ->assertJsonPath('data.due_date', null);
});

it('updates a project', function () {
    $project = Project::factory()->create([
        'status' => ProjectStatus::Planning,
        'priority' => ProjectPriority::Low,
    ]);

    $this->putJson("/api/projects/{$project->id}", [
        'client_name' => 'Bright Realty',
        'project_name' => 'Property Listing Portal',
        'description' => 'Build a portal for managing property listings.',
        'status' => 'completed',
        'priority' => 'high',
        'start_date' => '2026-05-15',
        'due_date' => '2026-07-30',
    ])
        ->assertOk()
        ->assertJsonPath('data.id', $project->id)
        ->assertJsonPath('data.status', 'completed')
        ->assertJsonPath('data.priority', 'high');

    expect($project->refresh())
        ->status->toBe(ProjectStatus::Completed)
        ->priority->toBe(ProjectPriority::High)
        ->client_name->toBe('Bright Realty');
});

it('returns 404 when updating a project that does not exist', function () {
    $this->putJson('/api/projects/9999', [
        'client_name' => 'Nobody',
        'project_name' => 'Nothing',
        'status' => 'planning',
        'priority' => 'low',
    ])->assertNotFound();
});

it('deletes a project', function () {
    $project = Project::factory()->create();

    $this->deleteJson("/api/projects/{$project->id}")
        ->assertNoContent();

    $this->assertDatabaseMissing('projects', ['id' => $project->id]);
});

it('returns 404 when deleting a project that does not exist', function () {
    $this->deleteJson('/api/projects/9999')->assertNotFound();
});

it('answers unknown api endpoints with json', function () {
    $this->getJson('/api/does-not-exist')
        ->assertNotFound()
        ->assertJsonPath('message', 'The requested endpoint does not exist.');
});

it('flags a project past its due date as overdue', function () {
    $overdue = Project::factory()->overdue()->create();
    $completed = Project::factory()->create([
        'status' => ProjectStatus::Completed,
        'start_date' => now()->subMonths(2),
        'due_date' => now()->subWeek(),
    ]);

    $this->getJson("/api/projects/{$overdue->id}")
        ->assertJsonPath('data.is_overdue', true);

    // A finished project is never "overdue", however late it was.
    $this->getJson("/api/projects/{$completed->id}")
        ->assertJsonPath('data.is_overdue', false);
});
