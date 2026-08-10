import type {
    PaginatedResponse,
    Project,
    ProjectFilters,
    ProjectPayload,
} from '@/types/project';
import { api } from './http';

interface SingleProjectResponse {
    data: Project;
}

/**
 * The filter state as query parameters.
 *
 * `undefined` values are dropped by axios, and arrays are serialised as
 * `status[]=planning&status[]=on_hold`, which is what the API expects.
 */
function toParams(filters: ProjectFilters) {
    const search = filters.search.trim();

    return {
        search: search === '' ? undefined : search,
        status: filters.status.length > 0 ? filters.status : undefined,
        priority: filters.priority.length > 0 ? filters.priority : undefined,
        sort: filters.sort,
        direction: filters.direction,
        page: filters.page,
    };
}

export async function listProjects(
    filters: ProjectFilters,
): Promise<PaginatedResponse<Project>> {
    const { data } = await api.get<PaginatedResponse<Project>>('/projects', {
        params: toParams(filters),
    });

    return data;
}

export async function createProject(payload: ProjectPayload): Promise<Project> {
    const { data } = await api.post<SingleProjectResponse>(
        '/projects',
        payload,
    );

    return data.data;
}

export async function updateProject(
    id: number,
    payload: ProjectPayload,
): Promise<Project> {
    const { data } = await api.put<SingleProjectResponse>(
        `/projects/${id}`,
        payload,
    );

    return data.data;
}

export async function deleteProject(id: number): Promise<void> {
    await api.delete(`/projects/${id}`);
}
