import { AlertCircleIcon, FolderOpenIcon, PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** Skeleton rows shown while the first page (or a new filter) is loading. */
export function ProjectListSkeleton() {
    return (
        <div
            aria-busy="true"
            aria-live="polite"
            className="overflow-hidden rounded-xl border bg-card shadow-xs"
        >
            <span className="sr-only">Loading projects…</span>
            {Array.from({ length: 6 }).map((_, index) => (
                <div
                    key={index}
                    className="flex items-center gap-4 border-b px-4 py-4 last:border-b-0"
                >
                    <div className="h-4 w-1/5 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-2/5 animate-pulse rounded bg-muted" />
                    <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
                    <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
                    <div className="ml-auto h-4 w-24 animate-pulse rounded bg-muted" />
                </div>
            ))}
        </div>
    );
}

/** Nothing matched — the message depends on whether filters are to blame. */
export function ProjectEmptyState({
    hasActiveFilters,
    onCreate,
    onReset,
}: {
    hasActiveFilters: boolean;
    onCreate: () => void;
    onReset: () => void;
}) {
    return (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-card px-6 py-16 text-center">
            <FolderOpenIcon
                aria-hidden="true"
                className="size-8 text-muted-foreground"
            />
            <h3 className="text-lg font-medium">
                {hasActiveFilters ? 'No matching projects' : 'No projects yet'}
            </h3>
            <p className="max-w-sm text-sm text-muted-foreground">
                {hasActiveFilters
                    ? 'Try a different search term, or clear the filters to see everything.'
                    : 'Create your first client project to start tracking its progress.'}
            </p>
            {hasActiveFilters ? (
                <Button variant="outline" onClick={onReset}>
                    Clear filters
                </Button>
            ) : (
                <Button onClick={onCreate}>
                    <PlusIcon />
                    New project
                </Button>
            )}
        </div>
    );
}

/** The list could not be loaded at all. */
export function ProjectErrorState({
    message,
    onRetry,
}: {
    message: string;
    onRetry: () => void;
}) {
    return (
        <div
            role="alert"
            className="flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center dark:border-red-400/30 dark:bg-red-400/10"
        >
            <AlertCircleIcon
                aria-hidden="true"
                className="size-8 text-red-600 dark:text-red-400"
            />
            <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
                Could not load projects
            </h3>
            <p className="max-w-sm text-sm text-red-700 dark:text-red-300">
                {message}
            </p>
            <Button variant="outline" onClick={onRetry}>
                Try again
            </Button>
        </div>
    );
}
