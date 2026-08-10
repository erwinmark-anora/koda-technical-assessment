<?php

use App\Enums\ProjectPriority;
use App\Enums\ProjectStatus;

it('exposes every status as a validation-ready list of values', function () {
    expect(ProjectStatus::values())
        ->toBe(['planning', 'in_progress', 'on_hold', 'completed']);
});

it('exposes every priority as a validation-ready list of values', function () {
    expect(ProjectPriority::values())->toBe(['low', 'medium', 'high']);
});

it('pairs each case with a human label for the UI', function () {
    expect(ProjectStatus::options())->toBe([
        ['value' => 'planning', 'label' => 'Planning'],
        ['value' => 'in_progress', 'label' => 'In Progress'],
        ['value' => 'on_hold', 'label' => 'On Hold'],
        ['value' => 'completed', 'label' => 'Completed'],
    ]);
});

it('resolves a case from its slug', function () {
    expect(ProjectStatus::fromValueOrLabel('in_progress'))
        ->toBe(ProjectStatus::InProgress);
});

it('resolves a case from the human label used in the seed data', function () {
    expect(ProjectStatus::fromValueOrLabel('In Progress'))
        ->toBe(ProjectStatus::InProgress)
        ->and(ProjectStatus::fromValueOrLabel('On Hold'))
        ->toBe(ProjectStatus::OnHold)
        ->and(ProjectPriority::fromValueOrLabel('Medium'))
        ->toBe(ProjectPriority::Medium);
});

it('resolves a case regardless of casing or padding', function () {
    expect(ProjectStatus::fromValueOrLabel('  in progress  '))
        ->toBe(ProjectStatus::InProgress);
});

it('rejects a value that is neither a slug nor a label', function () {
    expect(fn () => ProjectStatus::fromValueOrLabel('nonsense'))
        ->toThrow(ValueError::class);
});
