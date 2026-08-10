import { Head } from '@inertiajs/react';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { DeleteProjectDialog } from '@/components/projects/delete/delete-project-dialog';
import { ProjectFilters } from '@/components/projects/filters/project-filters';
import { ProjectFormDialog } from '@/components/projects/form/project-form-dialog';
import {
    ProjectEmptyState,
    ProjectErrorState,
    ProjectListSkeleton,
} from '@/components/projects/list/project-list-states';
import { ProjectPagination } from '@/components/projects/list/project-pagination';
import { ProjectTable } from '@/components/projects/list/project-table';
import { Button } from '@/components/ui/button';
import { useProjects } from '@/hooks/use-projects';
import { pluralise } from '@/lib/format';
import type { Project, ProjectsPageProps } from '@/types/project';

/**
 * The Client Project Tracker.
 *
 * The page itself only wires things together: `useProjects` owns the data and
 * filter state, the dialogs own their own submission, and this component
 * decides which of the list states to show and refreshes after a write.
 */
export default function ProjectsIndex({
    statusOptions,
    priorityOptions,
}: ProjectsPageProps) {
    const {
        projects,
        meta,
        filters,
        isLoading,
        error,
        hasActiveFilters,
        setSearch,
        toggleStatus,
        togglePriority,
        sortBy,
        goToPage,
        reset,
        refresh,
    } = useProjects();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editing, setEditing] = useState<Project | null>(null);
    const [deleting, setDeleting] = useState<Project | null>(null);

    function openCreateForm() {
        setEditing(null);
        setIsFormOpen(true);
    }

    function openEditForm(project: Project) {
        setEditing(project);
        setIsFormOpen(true);
    }

    function handleSaved(project: Project, mode: 'created' | 'updated') {
        toast.success(
            mode === 'created'
                ? `“${project.project_name}” was created.`
                : `“${project.project_name}” was updated.`,
        );
        refresh();
    }

    function handleDeleted(project: Project) {
        toast.success(`“${project.project_name}” was deleted.`);
        setDeleting(null);
        refresh();
    }

    return (
        <div className="min-h-screen bg-background">
            <Head title="Projects" />

            <header className="border-b bg-card">
                <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Client Project Tracker
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {meta
                                ? `${pluralise(meta.total, 'project')} tracked`
                                : 'Loading projects…'}
                        </p>
                    </div>

                    <Button onClick={openCreateForm}>
                        <PlusIcon />
                        New project
                    </Button>
                </div>
            </header>

            <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
                <ProjectFilters
                    filters={filters}
                    statusOptions={statusOptions}
                    priorityOptions={priorityOptions}
                    hasActiveFilters={hasActiveFilters}
                    onSearchChange={setSearch}
                    onToggleStatus={toggleStatus}
                    onTogglePriority={togglePriority}
                    onReset={reset}
                />

                {renderList()}
            </main>

            <ProjectFormDialog
                open={isFormOpen}
                project={editing}
                statusOptions={statusOptions}
                priorityOptions={priorityOptions}
                onOpenChange={setIsFormOpen}
                onSaved={handleSaved}
            />

            <DeleteProjectDialog
                project={deleting}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleting(null);
                    }
                }}
                onDeleted={handleDeleted}
            />
        </div>
    );

    function renderList() {
        // Loading wins over a previous error, so retrying shows progress
        // rather than leaving the failure on screen.
        if (isLoading) {
            return <ProjectListSkeleton />;
        }

        if (error) {
            return <ProjectErrorState message={error} onRetry={refresh} />;
        }

        if (projects.length === 0) {
            return (
                <ProjectEmptyState
                    hasActiveFilters={hasActiveFilters}
                    onCreate={openCreateForm}
                    onReset={reset}
                />
            );
        }

        return (
            <>
                <ProjectTable
                    projects={projects}
                    filters={filters}
                    onSort={sortBy}
                    onEdit={openEditForm}
                    onDelete={setDeleting}
                />
                {meta ? (
                    <ProjectPagination meta={meta} onPageChange={goToPage} />
                ) : null}
            </>
        );
    }
}
