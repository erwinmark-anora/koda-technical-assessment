<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Projects\IndexProjectRequest;
use App\Http\Requests\Projects\StoreProjectRequest;
use App\Http\Requests\Projects\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Services\ProjectService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\Response as HttpStatus;

class ProjectController extends Controller
{
    public function __construct(private ProjectService $projects) {}

    /**
     * GET /api/projects
     */
    public function index(IndexProjectRequest $request): AnonymousResourceCollection
    {
        $projects = $this->projects->paginate($request->filters());

        return ProjectResource::collection($projects);
    }

    /**
     * POST /api/projects
     */
    public function store(StoreProjectRequest $request): JsonResponse
    {
        $project = $this->projects->create($request->validated());

        return ProjectResource::make($project)
            ->response()
            ->setStatusCode(HttpStatus::HTTP_CREATED);
    }

    /**
     * GET /api/projects/{project}
     */
    public function show(int $project): ProjectResource
    {
        return ProjectResource::make($this->projects->findOrFail($project));
    }

    /**
     * PUT /api/projects/{project}
     */
    public function update(UpdateProjectRequest $request, int $project): ProjectResource
    {
        return ProjectResource::make(
            $this->projects->update($project, $request->validated()),
        );
    }

    /**
     * DELETE /api/projects/{project}
     */
    public function destroy(int $project): Response
    {
        $this->projects->delete($project);

        return response()->noContent();
    }
}
