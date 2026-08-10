export type ProjectStatus =
    'planning' | 'in_progress' | 'on_hold' | 'completed';

export type ProjectPriority = 'low' | 'medium' | 'high';

/** A project exactly as `ProjectResource` serialises it. */
export interface Project {
    id: number;
    client_name: string;
    project_name: string;
    description: string | null;
    status: ProjectStatus;
    status_label: string;
    priority: ProjectPriority;
    priority_label: string;
    start_date: string | null;
    due_date: string | null;
    is_overdue: boolean;
    created_at: string | null;
    updated_at: string | null;
}

/** A `{value, label}` pair handed down from the backing PHP enum. */
export interface EnumOption<TValue extends string> {
    value: TValue;
    label: string;
}

/** The payload accepted by POST and PUT `/api/projects`. */
export interface ProjectPayload {
    client_name: string;
    project_name: string;
    description: string;
    status: ProjectStatus;
    priority: ProjectPriority;
    start_date: string;
    due_date: string;
}

export type ProjectField = keyof ProjectPayload;

/** Laravel's 422 body: one or more messages per invalid field. */
export type ValidationErrors = Partial<Record<ProjectField, string[]>>;

export type SortColumn =
    | 'client_name'
    | 'project_name'
    | 'status'
    | 'priority'
    | 'start_date'
    | 'due_date'
    | 'created_at';

export type SortDirection = 'asc' | 'desc';

export interface ProjectFilters {
    search: string;
    status: ProjectStatus[];
    priority: ProjectPriority[];
    sort: SortColumn;
    direction: SortDirection;
    page: number;
}

export interface PaginationMeta {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
}

export interface PaginatedResponse<TData> {
    data: TData[];
    meta: PaginationMeta;
}

export interface ProjectsPageProps {
    statusOptions: EnumOption<ProjectStatus>[];
    priorityOptions: EnumOption<ProjectPriority>[];
}
