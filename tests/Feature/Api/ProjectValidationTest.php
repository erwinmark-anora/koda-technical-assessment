<?php

use App\Models\Project;

/**
 * A payload that passes every rule, so each test can break exactly one thing.
 *
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function validProjectPayload(array $overrides = []): array
{
    return array_merge([
        'client_name' => 'Acme Corporation',
        'project_name' => 'Corporate Website Redesign',
        'description' => 'Redesign and modernize the corporate website.',
        'status' => 'in_progress',
        'priority' => 'high',
        'start_date' => '2026-06-01',
        'due_date' => '2026-07-15',
    ], $overrides);
}

it('requires a client name', function () {
    $this->postJson('/api/projects', validProjectPayload(['client_name' => '']))
        ->assertStatus(422)
        ->assertJsonValidationErrors('client_name')
        ->assertJsonPath('errors.client_name.0', 'Client name is required.');
});

it('requires a project name', function () {
    $this->postJson('/api/projects', validProjectPayload(['project_name' => '']))
        ->assertStatus(422)
        ->assertJsonValidationErrors('project_name')
        ->assertJsonPath('errors.project_name.0', 'Project name is required.');
});

it('rejects an invalid status', function () {
    $this->postJson('/api/projects', validProjectPayload(['status' => 'nonsense']))
        ->assertStatus(422)
        ->assertJsonValidationErrors('status')
        ->assertJsonPath(
            'errors.status.0',
            'Status must be one of: Planning, In Progress, On Hold, Completed.',
        );
});

it('rejects an invalid priority', function () {
    $this->postJson('/api/projects', validProjectPayload(['priority' => 'urgent']))
        ->assertStatus(422)
        ->assertJsonValidationErrors('priority')
        ->assertJsonPath(
            'errors.priority.0',
            'Priority must be one of: Low, Medium, High.',
        );
});

it('rejects a due date earlier than the start date', function () {
    $this->postJson('/api/projects', validProjectPayload([
        'start_date' => '2026-06-10',
        'due_date' => '2026-06-01',
    ]))
        ->assertStatus(422)
        ->assertJsonValidationErrors('due_date')
        ->assertJsonPath(
            'errors.due_date.0',
            'Due date cannot be earlier than the start date.',
        );
});

it('accepts a due date equal to the start date', function () {
    $this->postJson('/api/projects', validProjectPayload([
        'start_date' => '2026-06-10',
        'due_date' => '2026-06-10',
    ]))->assertCreated();
});

it('accepts a due date without a start date', function () {
    $this->postJson('/api/projects', validProjectPayload([
        'start_date' => null,
        'due_date' => '2026-06-10',
    ]))->assertCreated();
});

it('rejects a malformed date', function () {
    $this->postJson('/api/projects', validProjectPayload(['due_date' => 'not-a-date']))
        ->assertStatus(422)
        ->assertJsonValidationErrors('due_date');
});

it('rejects names longer than the column allows', function () {
    $this->postJson('/api/projects', validProjectPayload([
        'client_name' => str_repeat('a', 256),
    ]))
        ->assertStatus(422)
        ->assertJsonValidationErrors('client_name');
});

it('reports every invalid field at once', function () {
    $this->postJson('/api/projects', [
        'client_name' => '',
        'project_name' => '',
        'status' => 'nope',
        'priority' => 'nope',
        'start_date' => '2026-06-10',
        'due_date' => '2026-06-01',
    ])
        ->assertStatus(422)
        ->assertJsonValidationErrors([
            'client_name',
            'project_name',
            'status',
            'priority',
            'due_date',
        ]);
});

it('applies the same rules when updating', function () {
    $project = Project::factory()->create();

    $this->putJson("/api/projects/{$project->id}", validProjectPayload([
        'client_name' => '',
        'status' => 'nonsense',
    ]))
        ->assertStatus(422)
        ->assertJsonValidationErrors(['client_name', 'status']);
});
