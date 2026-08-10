<?php

namespace App\Http\Controllers;

use App\Enums\ProjectPriority;
use App\Enums\ProjectStatus;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Serves the single page that hosts the tracker UI.
 *
 * The page itself is a thin shell: it renders the React application and hands
 * it the enum options, so the selects and filters are driven by the same
 * source of truth the API validates against. All data flows through the REST
 * API from there.
 */
class ProjectPageController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('projects/index', [
            'statusOptions' => ProjectStatus::options(),
            'priorityOptions' => ProjectPriority::options(),
        ]);
    }
}
