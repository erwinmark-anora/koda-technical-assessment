import { PencilIcon, Trash2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Project } from '@/types/project';

interface ProjectRowActionsProps {
    project: Project;
    onEdit: (project: Project) => void;
    onDelete: (project: Project) => void;
}

/**
 * Edit and delete buttons for a single project.
 *
 * Shared by the desktop table and the mobile card list. The labels name the
 * project so screen readers do not announce a dozen identical "Edit" buttons.
 */
export function ProjectRowActions({
    project,
    onEdit,
    onDelete,
}: ProjectRowActionsProps) {
    return (
        <div className="flex shrink-0 items-center justify-end gap-1">
            <Button
                variant="ghost"
                size="icon"
                aria-label={`Edit ${project.project_name}`}
                onClick={() => onEdit(project)}
            >
                <PencilIcon />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                aria-label={`Delete ${project.project_name}`}
                className="text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(project)}
            >
                <Trash2Icon />
            </Button>
        </div>
    );
}
