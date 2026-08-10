import type { ProjectPayload, ValidationErrors } from '@/types/project';

/**
 * A client-side mirror of the server's rules, for instant feedback.
 *
 * The API remains the authority — it re-validates every request and its 422
 * response is merged over whatever this produced. This exists purely so the
 * user does not have to wait for a round trip to learn a field is empty.
 */
export function validateProject(values: ProjectPayload): ValidationErrors {
    const errors: ValidationErrors = {};

    if (values.client_name.trim() === '') {
        errors.client_name = ['Client name is required.'];
    } else if (values.client_name.trim().length > 255) {
        errors.client_name = ['Client name may not exceed 255 characters.'];
    }

    if (values.project_name.trim() === '') {
        errors.project_name = ['Project name is required.'];
    } else if (values.project_name.trim().length > 255) {
        errors.project_name = ['Project name may not exceed 255 characters.'];
    }

    if (values.description.length > 5000) {
        errors.description = ['Description may not exceed 5000 characters.'];
    }

    if (
        values.start_date !== '' &&
        values.due_date !== '' &&
        values.due_date < values.start_date
    ) {
        // Both are ISO `YYYY-MM-DD`, so a lexicographic compare is a date compare.
        errors.due_date = ['Due date cannot be earlier than the start date.'];
    }

    return errors;
}

export function hasErrors(errors: ValidationErrors): boolean {
    return Object.keys(errors).length > 0;
}
