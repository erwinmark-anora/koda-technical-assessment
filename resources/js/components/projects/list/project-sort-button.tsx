import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SortDirection } from '@/types/project';

interface ProjectSortButtonProps {
    label: string;
    /** Whether the list is currently sorted by this column. */
    active: boolean;
    direction: SortDirection;
    onClick: () => void;
}

/** A clickable column header that shows the current sort direction. */
export function ProjectSortButton({
    label,
    active,
    direction,
    onClick,
}: ProjectSortButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-sort={
                active
                    ? direction === 'asc'
                        ? 'ascending'
                        : 'descending'
                    : 'none'
            }
            className={cn(
                'flex w-full items-center gap-1 px-4 py-3 text-left uppercase transition-colors hover:text-foreground',
                'focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
                active && 'text-foreground',
            )}
        >
            {label}
            {active ? (
                direction === 'asc' ? (
                    <ArrowUpIcon className="size-3" />
                ) : (
                    <ArrowDownIcon className="size-3" />
                )
            ) : null}
        </button>
    );
}
