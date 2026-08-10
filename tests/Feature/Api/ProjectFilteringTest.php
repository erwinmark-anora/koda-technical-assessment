<?php

use App\Enums\ProjectPriority;
use App\Enums\ProjectStatus;
use App\Models\Project;

it('searches across client name, project name and description', function () {
    Project::factory()->create([
        'client_name' => 'Bright Realty',
        'project_name' => 'Property Listing Portal',
        'description' => 'Build a portal for managing property listings.',
    ]);
    Project::factory()->create([
        'client_name' => 'Nova Fitness',
        'project_name' => 'Mobile App MVP',
        'description' => 'Fitness tracking application.',
    ]);

    $this->getJson('/api/projects?search=realty')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.client_name', 'Bright Realty');

    $this->getJson('/api/projects?search=mobile')
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.project_name', 'Mobile App MVP');

    $this->getJson('/api/projects?search=tracking')
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.project_name', 'Mobile App MVP');
});

it('searches case insensitively', function () {
    Project::factory()->create(['client_name' => 'GreenLeaf Cafe']);

    $this->getJson('/api/projects?search=GREENLEAF')
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

it('treats wildcard characters in a search term literally', function () {
    Project::factory()->create(['client_name' => 'Acme Corporation']);

    // Without escaping, "%" would match every row.
    $this->getJson('/api/projects?search=%')
        ->assertOk()
        ->assertJsonCount(0, 'data');
});

it('filters by status', function () {
    Project::factory()->status(ProjectStatus::Planning)->count(2)->create();
    Project::factory()->status(ProjectStatus::Completed)->create();

    $this->getJson('/api/projects?status[]=planning')
        ->assertOk()
        ->assertJsonCount(2, 'data');
});

it('filters by several statuses at once', function () {
    Project::factory()->status(ProjectStatus::Planning)->create();
    Project::factory()->status(ProjectStatus::OnHold)->create();
    Project::factory()->status(ProjectStatus::Completed)->create();

    $this->getJson('/api/projects?status[]=planning&status[]=on_hold')
        ->assertOk()
        ->assertJsonCount(2, 'data');
});

it('filters by priority', function () {
    Project::factory()->priority(ProjectPriority::High)->count(2)->create();
    Project::factory()->priority(ProjectPriority::Low)->create();

    $this->getJson('/api/projects?priority[]=high')
        ->assertOk()
        ->assertJsonCount(2, 'data');
});

it('combines search, status and priority filters', function () {
    Project::factory()->create([
        'client_name' => 'Acme Corporation',
        'status' => ProjectStatus::InProgress,
        'priority' => ProjectPriority::High,
    ]);
    Project::factory()->create([
        'client_name' => 'Acme Corporation',
        'status' => ProjectStatus::Completed,
        'priority' => ProjectPriority::High,
    ]);

    $this->getJson('/api/projects?search=acme&status[]=in_progress&priority[]=high')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.status', 'in_progress');
});

it('rejects an unknown filter value', function () {
    Project::factory()->count(2)->create();

    // Reads are validated the same way writes are, so an invalid filter gets
    // the same 422 a POST with an invalid status would.
    $this->getJson('/api/projects?status[]=not-a-status')
        ->assertStatus(422)
        ->assertJsonValidationErrors('status.0');
});

it('accepts filters as a comma separated list', function () {
    Project::factory()->status(ProjectStatus::Planning)->create();
    Project::factory()->status(ProjectStatus::OnHold)->create();
    Project::factory()->status(ProjectStatus::Completed)->create();

    $this->getJson('/api/projects?status=planning,on_hold')
        ->assertOk()
        ->assertJsonCount(2, 'data');
});

it('sorts by priority using its real world order, not alphabetically', function () {
    Project::factory()->priority(ProjectPriority::Low)->create();
    Project::factory()->priority(ProjectPriority::High)->create();
    Project::factory()->priority(ProjectPriority::Medium)->create();

    $this->getJson('/api/projects?sort=priority&direction=desc')
        ->assertOk()
        ->assertJsonPath('data.0.priority', 'high')
        ->assertJsonPath('data.1.priority', 'medium')
        ->assertJsonPath('data.2.priority', 'low');

    $this->getJson('/api/projects?sort=priority&direction=asc')
        ->assertJsonPath('data.0.priority', 'low')
        ->assertJsonPath('data.2.priority', 'high');
});

it('sorts by status following the project lifecycle', function () {
    Project::factory()->status(ProjectStatus::Completed)->create();
    Project::factory()->status(ProjectStatus::Planning)->create();

    $this->getJson('/api/projects?sort=status&direction=asc')
        ->assertOk()
        ->assertJsonPath('data.0.status', 'planning')
        ->assertJsonPath('data.1.status', 'completed');
});

it('sorts by due date', function () {
    Project::factory()->create(['due_date' => '2026-09-01']);
    Project::factory()->create(['due_date' => '2026-07-01']);

    $this->getJson('/api/projects?sort=due_date&direction=asc')
        ->assertOk()
        ->assertJsonPath('data.0.due_date', '2026-07-01');
});

it('rejects a sort column that is not on the allow-list', function () {
    Project::factory()->count(2)->create();

    // Guards against SQL injection through the sort parameter: the column
    // never reaches the query builder at all.
    $this->getJson('/api/projects?sort=projects.id;drop table projects')
        ->assertStatus(422)
        ->assertJsonValidationErrors('sort');

    $this->assertDatabaseCount('projects', 2);
});

it('rejects an unknown sort direction', function () {
    $this->getJson('/api/projects?direction=sideways')
        ->assertStatus(422)
        ->assertJsonValidationErrors('direction');
});

it('paginates and limits the page size', function () {
    Project::factory()->count(30)->create();

    $this->getJson('/api/projects?per_page=10')
        ->assertOk()
        ->assertJsonCount(10, 'data')
        ->assertJsonPath('meta.last_page', 3);

    // per_page is capped so a client cannot ask for the whole table at once.
    $this->getJson('/api/projects?per_page=5000')
        ->assertStatus(422)
        ->assertJsonValidationErrors('per_page');
});
