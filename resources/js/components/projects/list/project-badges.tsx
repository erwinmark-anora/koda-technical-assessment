import { cn } from '@/lib/utils';
import type { ProjectPriority, ProjectStatus } from '@/types/project';

/**
 * Status and priority are the two things a project manager scans for, so each
 * value gets a consistent colour rather than a uniform grey pill.
 */
const STATUS_STYLES: Record<ProjectStatus, string> = {
    planning:
        'bg-slate-100 text-slate-700 ring-slate-600/20 dark:bg-slate-400/10 dark:text-slate-300 dark:ring-slate-400/30',
    in_progress:
        'bg-blue-50 text-blue-700 ring-blue-700/20 dark:bg-blue-400/10 dark:text-blue-300 dark:ring-blue-400/30',
    on_hold:
        'bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/30',
    completed:
        'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/30',
};

const PRIORITY_STYLES: Record<ProjectPriority, string> = {
    low: 'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-400/10 dark:text-slate-400 dark:ring-slate-400/30',
    medium: 'bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-400/10 dark:text-orange-300 dark:ring-orange-400/30',
    high: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/30',
};

const PILL =
    'inline-flex w-fit shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset';

export function StatusBadge({
    status,
    label,
}: {
    status: ProjectStatus;
    label: string;
}) {
    return <span className={cn(PILL, STATUS_STYLES[status])}>{label}</span>;
}

export function PriorityBadge({
    priority,
    label,
}: {
    priority: ProjectPriority;
    label: string;
}) {
    return (
        <span className={cn(PILL, PRIORITY_STYLES[priority])}>
            {priority === 'high' ? (
                <span
                    aria-hidden="true"
                    className="mr-1 size-1.5 rounded-full bg-current"
                />
            ) : null}
            {label}
        </span>
    );
}

/** Flags a project that is past its due date and not yet complete. */
export function OverdueBadge() {
    return (
        <span
            className={cn(
                PILL,
                'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-400/10 dark:text-red-300 dark:ring-red-400/30',
            )}
        >
            Overdue
        </span>
    );
}
