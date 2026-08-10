import { SearchIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type {
    EnumOption,
    ProjectFilters as Filters,
    ProjectPriority,
    ProjectStatus,
} from '@/types/project';

interface ProjectFiltersProps {
    filters: Filters;
    statusOptions: EnumOption<ProjectStatus>[];
    priorityOptions: EnumOption<ProjectPriority>[];
    hasActiveFilters: boolean;
    onSearchChange: (value: string) => void;
    onToggleStatus: (value: ProjectStatus) => void;
    onTogglePriority: (value: ProjectPriority) => void;
    onReset: () => void;
}

/**
 * Search plus multi-select status and priority chips.
 *
 * Chips rather than dropdowns: with four and three options respectively, the
 * whole filter state stays visible at a glance and toggles in one click.
 */
export function ProjectFilters({
    filters,
    statusOptions,
    priorityOptions,
    hasActiveFilters,
    onSearchChange,
    onToggleStatus,
    onTogglePriority,
    onReset,
}: ProjectFiltersProps) {
    return (
        <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-xs">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <SearchIcon
                        aria-hidden="true"
                        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                        type="search"
                        value={filters.search}
                        aria-label="Search projects"
                        placeholder="Search client, project or description…"
                        className="pl-9"
                        onChange={(event) => onSearchChange(event.target.value)}
                    />
                </div>

                {hasActiveFilters ? (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="self-start sm:self-auto"
                        onClick={onReset}
                    >
                        <XIcon />
                        Clear filters
                    </Button>
                ) : null}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
                <FilterGroup label="Status">
                    {statusOptions.map((option) => (
                        <FilterChip
                            key={option.value}
                            label={option.label}
                            active={filters.status.includes(option.value)}
                            onClick={() => onToggleStatus(option.value)}
                        />
                    ))}
                </FilterGroup>

                <FilterGroup label="Priority">
                    {priorityOptions.map((option) => (
                        <FilterChip
                            key={option.value}
                            label={option.label}
                            active={filters.priority.includes(option.value)}
                            onClick={() => onTogglePriority(option.value)}
                        />
                    ))}
                </FilterGroup>
            </div>
        </div>
    );
}

function FilterGroup({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {label}
            </span>
            {children}
        </div>
    );
}

function FilterChip({
    label,
    active,
    onClick,
}: {
    label: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            aria-pressed={active}
            onClick={onClick}
            className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                'focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
                active
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
        >
            {label}
        </button>
    );
}
