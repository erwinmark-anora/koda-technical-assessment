import {
    OverdueBadge,
    PriorityBadge,
    StatusBadge,
} from '@/components/projects/list/project-badges';
import { ProjectCardList } from '@/components/projects/list/project-card-list';
import { ProjectRowActions } from '@/components/projects/list/project-row-actions';
import { ProjectSortButton } from '@/components/projects/list/project-sort-button';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Project, ProjectFilters, SortColumn } from '@/types/project';

interface ProjectTableProps {
    projects: Project[];
    filters: ProjectFilters;
    onSort: (column: SortColumn) => void;
    onEdit: (project: Project) => void;
    onDelete: (project: Project) => void;
}

const COLUMNS: { column: SortColumn; label: string }[] = [
    { column: 'client_name', label: 'Client' },
    { column: 'project_name', label: 'Project' },
    { column: 'status', label: 'Status' },
    { column: 'priority', label: 'Priority' },
    { column: 'start_date', label: 'Start date' },
    { column: 'due_date', label: 'Due date' },
];

/**
 * The project list: a sortable table on desktop, cards on mobile.
 *
 * Only one of the two is visible at a time, chosen by Tailwind's `md:`
 * breakpoint.
 */
export function ProjectTable({
    projects,
    filters,
    onSort,
    onEdit,
    onDelete,
}: ProjectTableProps) {
    return (
        <>
            <div className="hidden overflow-hidden rounded-xl border bg-card shadow-xs md:block">
                <table className="w-full text-left text-sm">
                    <thead className="border-b bg-muted/40 text-xs tracking-wide text-muted-foreground uppercase">
                        <tr>
                            {COLUMNS.map(({ column, label }) => (
                                <th key={column} scope="col" className="p-0">
                                    <ProjectSortButton
                                        label={label}
                                        active={filters.sort === column}
                                        direction={filters.direction}
                                        onClick={() => onSort(column)}
                                    />
                                </th>
                            ))}
                            <th scope="col" className="px-4 py-3 text-right">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {projects.map((project) => (
                            <tr
                                key={project.id}
                                className="transition-colors hover:bg-muted/40"
                            >
                                <td className="px-4 py-3 font-medium">
                                    {project.client_name}
                                </td>
                                <td className="max-w-xs px-4 py-3">
                                    <div className="font-medium">
                                        {project.project_name}
                                    </div>
                                    {project.description ? (
                                        <div className="line-clamp-1 text-xs text-muted-foreground">
                                            {project.description}
                                        </div>
                                    ) : null}
                                </td>
                                <td className="px-4 py-3">
                                    <StatusBadge
                                        status={project.status}
                                        label={project.status_label}
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <PriorityBadge
                                        priority={project.priority}
                                        label={project.priority_label}
                                    />
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                                    {formatDate(project.start_date)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={cn(
                                                project.is_overdue
                                                    ? 'font-medium text-red-600 dark:text-red-400'
                                                    : 'text-muted-foreground',
                                            )}
                                        >
                                            {formatDate(project.due_date)}
                                        </span>
                                        {project.is_overdue ? (
                                            <OverdueBadge />
                                        ) : null}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <ProjectRowActions
                                        project={project}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ProjectCardList
                projects={projects}
                onEdit={onEdit}
                onDelete={onDelete}
            />
        </>
    );
}
