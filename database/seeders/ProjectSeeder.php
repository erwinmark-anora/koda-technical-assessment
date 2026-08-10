<?php

namespace Database\Seeders;

use App\Enums\ProjectPriority;
use App\Enums\ProjectStatus;
use App\Models\Project;
use Illuminate\Database\Seeder;
use JsonException;
use RuntimeException;

/**
 * Loads the reference projects supplied with the brief.
 *
 * The source file is `database/data/projects.json`, which is the provided
 * `test_data.json` normalised into a valid JSON array (the original is missing
 * its opening bracket). Seeding is keyed on client + project name so it can be
 * re-run without creating duplicates.
 */
class ProjectSeeder extends Seeder
{
    private const SOURCE = 'data/projects.json';

    public function run(): void
    {
        foreach ($this->records() as $record) {
            Project::query()->updateOrCreate(
                [
                    'client_name' => $record['clientName'],
                    'project_name' => $record['projectName'],
                ],
                [
                    'description' => $record['description'] ?? null,
                    'status' => ProjectStatus::fromValueOrLabel((string) $record['status']),
                    'priority' => ProjectPriority::fromValueOrLabel((string) $record['priority']),
                    'start_date' => $record['startDate'] ?? null,
                    'due_date' => $record['dueDate'] ?? null,
                ],
            );
        }
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function records(): array
    {
        $path = database_path(self::SOURCE);

        if (! is_file($path)) {
            throw new RuntimeException("Seed file [{$path}] is missing.");
        }

        $contents = file_get_contents($path);

        if ($contents === false) {
            throw new RuntimeException("Seed file [{$path}] could not be read.");
        }

        try {
            /** @var list<array<string, mixed>> $decoded */
            $decoded = json_decode($contents, true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException $e) {
            throw new RuntimeException("Seed file [{$path}] is not valid JSON.", previous: $e);
        }

        return $decoded;
    }
}
