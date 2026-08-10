<?php

namespace App\Enums\Concerns;

use ValueError;

/**
 * Shared behaviour for the string-backed enums that describe a project.
 *
 * Cases are stored as stable slugs (`in_progress`) while the UI and the
 * seed data speak in human labels ("In Progress"). Keeping the translation
 * in one trait means a new enum only has to declare its cases and labels.
 *
 * @mixin \BackedEnum<string>
 */
trait HasLabels
{
    /**
     * The human readable label for the case.
     */
    abstract public function label(): string;

    /**
     * Every backing value, suitable for an `in:` validation rule.
     *
     * @return list<string>
     */
    public static function values(): array
    {
        return array_map(
            static fn (self $case): string => $case->value,
            self::cases(),
        );
    }

    /**
     * Every case as a `{value, label}` pair for populating front-end selects.
     *
     * @return list<array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(
            static fn (self $case): array => [
                'value' => $case->value,
                'label' => $case->label(),
            ],
            self::cases(),
        );
    }

    /**
     * Resolve a case from either its backing value or its human label.
     *
     * Accepting both lets the seeder consume the supplied `test_data.json`
     * ("In Progress") without a separate translation map.
     *
     * @throws ValueError when the value matches neither a slug nor a label.
     */
    public static function fromValueOrLabel(string $value): self
    {
        $needle = mb_strtolower(trim($value));

        foreach (self::cases() as $case) {
            if (mb_strtolower($case->value) === $needle || mb_strtolower($case->label()) === $needle) {
                return $case;
            }
        }

        throw new ValueError(sprintf(
            '"%s" is not a valid %s. Expected one of: %s.',
            $value,
            class_basename(self::class),
            implode(', ', self::values()),
        ));
    }
}
