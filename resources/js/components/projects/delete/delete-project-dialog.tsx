import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { ApiError } from '@/lib/api/http';
import { deleteProject } from '@/lib/api/projects';
import type { Project } from '@/types/project';

interface DeleteProjectDialogProps {
    /** The project awaiting confirmation, or null when the dialog is closed. */
    project: Project | null;
    onOpenChange: (open: boolean) => void;
    onDeleted: (project: Project) => void;
}

/**
 * Deleting is irreversible, so it goes through an explicit confirmation that
 * names the project being removed.
 */
export function DeleteProjectDialog({
    project,
    onOpenChange,
    onDeleted,
}: DeleteProjectDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleDelete() {
        if (!project) {
            return;
        }

        setIsDeleting(true);
        setError(null);

        try {
            await deleteProject(project.id);
            onDeleted(project);
            onOpenChange(false);
        } catch (caught) {
            setError(
                caught instanceof ApiError
                    ? caught.message
                    : 'The project could not be deleted.',
            );
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <Dialog
            open={project !== null}
            onOpenChange={(open) => {
                if (!open) {
                    setError(null);
                }

                onOpenChange(open);
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete project</DialogTitle>
                    <DialogDescription>
                        This permanently deletes{' '}
                        <span className="font-medium text-foreground">
                            {project?.project_name}
                        </span>{' '}
                        for {project?.client_name}. This cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                {error ? (
                    <p
                        role="alert"
                        className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-400/10 dark:text-red-300"
                    >
                        {error}
                    </p>
                ) : null}

                <DialogFooter>
                    <Button
                        variant="outline"
                        disabled={isDeleting}
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        disabled={isDeleting}
                        onClick={handleDelete}
                    >
                        {isDeleting ? <Spinner /> : null}
                        Delete project
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
