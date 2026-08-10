<?php

namespace App\Enums;

use App\Enums\Concerns\HasLabels;

enum ProjectStatus: string
{
    use HasLabels;

    case Planning = 'planning';
    case InProgress = 'in_progress';
    case OnHold = 'on_hold';
    case Completed = 'completed';

    public function label(): string
    {
        return match ($this) {
            self::Planning => 'Planning',
            self::InProgress => 'In Progress',
            self::OnHold => 'On Hold',
            self::Completed => 'Completed',
        };
    }
}
