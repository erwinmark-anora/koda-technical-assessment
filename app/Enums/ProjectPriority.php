<?php

namespace App\Enums;

use App\Enums\Concerns\HasLabels;

enum ProjectPriority: string
{
    use HasLabels;

    case Low = 'low';
    case Medium = 'medium';
    case High = 'high';

    public function label(): string
    {
        return match ($this) {
            self::Low => 'Low',
            self::Medium => 'Medium',
            self::High => 'High',
        };
    }
}
