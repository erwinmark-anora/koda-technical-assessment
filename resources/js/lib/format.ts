const DATE_FORMAT = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
});

/**
 * Render an API date (`YYYY-MM-DD`) for display.
 *
 * The string is split manually rather than passed to `new Date()`, which would
 * read it as UTC midnight and shift the day backwards for anyone west of
 * Greenwich.
 */
export function formatDate(value: string | null): string {
    if (!value) {
        return '—';
    }

    const [year, month, day] = value.split('-').map(Number);

    if (!year || !month || !day) {
        return value;
    }

    return DATE_FORMAT.format(new Date(year, month - 1, day));
}

/** `12 projects` / `1 project` */
export function pluralise(count: number, singular: string): string {
    return `${count} ${singular}${count === 1 ? '' : 's'}`;
}
