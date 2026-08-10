import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PaginationMeta } from '@/types/project';

interface ProjectPaginationProps {
    meta: PaginationMeta;
    onPageChange: (page: number) => void;
}

export function ProjectPagination({
    meta,
    onPageChange,
}: ProjectPaginationProps) {
    if (meta.last_page <= 1) {
        return null;
    }

    return (
        <nav
            aria-label="Pagination"
            className="flex flex-col items-center justify-between gap-3 sm:flex-row"
        >
            <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{meta.from ?? 0}</span> to{' '}
                <span className="font-medium">{meta.to ?? 0}</span> of{' '}
                <span className="font-medium">{meta.total}</span>
            </p>

            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={meta.current_page <= 1}
                    onClick={() => onPageChange(meta.current_page - 1)}
                >
                    <ChevronLeftIcon />
                    Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                    Page {meta.current_page} of {meta.last_page}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={meta.current_page >= meta.last_page}
                    onClick={() => onPageChange(meta.current_page + 1)}
                >
                    Next
                    <ChevronRightIcon />
                </Button>
            </div>
        </nav>
    );
}
