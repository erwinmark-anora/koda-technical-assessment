import {
    OverdueBadge,
    PriorityBadge,
    StatusBadge,
} from '@/components/projects/list/project-badges';
import { ProjectRowActions } from '@/components/projects/list/project-row-actions';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Project } from '@/types/project';

interface ProjectCardListProps {
    projects: Project[];
    onEdit: (project: Project) => void;
    onDelete: (project: Project) => void;
}

/**
 * The mobile layout for the project list.
 *
 * A table cannot survive a narrow viewport, so small screens get the same data
 * as stacked cards rather than a grid that scrolls sideways.
 */
export function ProjectCardList({
    projects,
    onEdit,
    onDelete,
}: ProjectCardListProps) {
    return (
        <ul className="flex flex-col gap-3 md:hidden">
            {projects.map((project) => (
                <li
                    key={project.id}
                    className="rounded-xl border bg-card p-4 shadow-xs"
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">
                                {project.client_name}
                            </p>
                            <h3 className="font-medium">
                                {project.project_name}
                            </h3>
                        </div>
                        <ProjectRowActions
                            project={project}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    </div>

                    {project.description ? (
                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                            {project.description}
                        </p>
                    ) : null}

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <StatusBadge
                            status={project.status}
                            label={project.status_label}
                        />
                        <PriorityBadge
                            priority={project.priority}
                            label={project.priority_label}
                        />
                        {project.is_overdue ? <OverdueBadge /> : null}
                    </div>

                    <dl className="mt-3 grid grid-cols-2 gap-2 border-t pt-3 text-sm">
                        <div>
                            <dt className="text-xs text-muted-foreground">
                                Start date
                            </dt>
                            <dd>{formatDate(project.start_date)}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-muted-foreground">
                                Due date
                            </dt>
                            <dd
                                className={cn(
                                    project.is_overdue &&
                                        'font-medium text-red-600 dark:text-red-400',
                                )}
                            >
                                {formatDate(project.due_date)}
                            </dd>
                        </div>
                    </dl>
                </li>
            ))}
        </ul>
    );
}
