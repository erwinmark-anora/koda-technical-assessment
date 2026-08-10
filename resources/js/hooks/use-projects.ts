import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError } from '@/lib/api/http';
import { listProjects } from '@/lib/api/projects';
import type {
    PaginationMeta,
    Project,
    ProjectFilters,
    ProjectPriority,
    ProjectStatus,
    SortColumn,
} from '@/types/project';

const SEARCH_DEBOUNCE_MS = 300;

const DEFAULT_FILTERS: ProjectFilters = {
    search: '',
    status: [],
    priority: [],
    sort: 'due_date',
    direction: 'asc',
    page: 1,
};

/**
 * Owns the project list: filter state, loading the data, and the flags the
 * page needs to decide what to render.
 *
 * Keeping this in a hook lets the page and its child components stay purely
 * presentational.
 */
export function useProjects() {
    const [filters, setFilters] = useState<ProjectFilters>(DEFAULT_FILTERS);
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [projects, setProjects] = useState<Project[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [reloadToken, setReloadToken] = useState(0);
    const [loadedQuery, setLoadedQuery] = useState<ProjectFilters | null>(null);

    useEffect(() => {
        const timer = setTimeout(
            () => setDebouncedSearch(filters.search),
            SEARCH_DEBOUNCE_MS,
        );

        return () => clearTimeout(timer);
    }, [filters.search]);

    const { status, priority, sort, direction, page } = filters;

    const query = useMemo<ProjectFilters>(
        () => ({
            search: debouncedSearch,
            status,
            priority,
            sort,
            direction,
            page,
        }),
        [debouncedSearch, status, priority, sort, direction, page],
    );

    const isLoading = loadedQuery !== query;

    useEffect(() => {
        let ignore = false;

        listProjects(query)
            .then((response) => {
                if (ignore) {
                    return;
                }

                setProjects(response.data);
                setMeta(response.meta);
                setError(null);
                setLoadedQuery(query);
            })
            .catch((caught: unknown) => {
                if (ignore) {
                    return;
                }

                setError(
                    caught instanceof ApiError
                        ? caught.message
                        : 'Could not load projects.',
                );
                setLoadedQuery(query);
            });

        return () => {
            ignore = true;
        };
    }, [query, reloadToken]);

    const refresh = useCallback(() => {
        setLoadedQuery(null);
        setReloadToken((token) => token + 1);
    }, []);

    const setSearch = useCallback(
        (search: string) =>
            setFilters((current) => ({ ...current, search, page: 1 })),
        [],
    );

    const toggleStatus = useCallback(
        (value: ProjectStatus) =>
            setFilters((current) => ({
                ...current,
                status: toggle(current.status, value),
                page: 1,
            })),
        [],
    );

    const togglePriority = useCallback(
        (value: ProjectPriority) =>
            setFilters((current) => ({
                ...current,
                priority: toggle(current.priority, value),
                page: 1,
            })),
        [],
    );

    const sortBy = useCallback(
        (column: SortColumn) =>
            setFilters((current) => ({
                ...current,
                sort: column,
                direction:
                    current.sort === column && current.direction === 'asc'
                        ? 'desc'
                        : 'asc',
                page: 1,
            })),
        [],
    );

    const goToPage = useCallback(
        (nextPage: number) =>
            setFilters((current) => ({ ...current, page: nextPage })),
        [],
    );

    const reset = useCallback(() => {
        setFilters(DEFAULT_FILTERS);
        setDebouncedSearch('');
    }, []);

    const hasActiveFilters =
        filters.search !== '' ||
        filters.status.length > 0 ||
        filters.priority.length > 0;

    return {
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
    };
}

function toggle<TValue extends string>(
    values: TValue[],
    value: TValue,
): TValue[] {
    return values.includes(value)
        ? values.filter((existing) => existing !== value)
        : [...values, value];
}
