import { ProjectForm } from '@/components/projects/form/project-form';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type {
    EnumOption,
    Project,
    ProjectPriority,
    ProjectStatus,
} from '@/types/project';

interface ProjectFormDialogProps {
    open: boolean;
    /** The project being edited, or null to create a new one. */
    project: Project | null;
    statusOptions: EnumOption<ProjectStatus>[];
    priorityOptions: EnumOption<ProjectPriority>[];
    onOpenChange: (open: boolean) => void;
    onSaved: (project: Project, mode: 'created' | 'updated') => void;
}

/**
 * The dialog wrapper around the project form.
 *
 * The form is a child keyed by project id, so opening the dialog (or switching
 * to a different project) remounts it. That resets the fields and any stale
 * error messages for free, with no effect needed.
 */
export function ProjectFormDialog({
    open,
    project,
    statusOptions,
    priorityOptions,
    onOpenChange,
    onSaved,
}: ProjectFormDialogProps) {
    const isEditing = project !== null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Edit project' : 'New project'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Update the details for this client project.'
                            : 'Track a new project for one of your clients.'}
                    </DialogDescription>
                </DialogHeader>

                {open ? (
                    <ProjectForm
                        key={project?.id ?? 'new'}
                        project={project}
                        statusOptions={statusOptions}
                        priorityOptions={priorityOptions}
                        onCancel={() => onOpenChange(false)}
                        onSaved={(saved, mode) => {
                            onSaved(saved, mode);
                            onOpenChange(false);
                        }}
                    />
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
