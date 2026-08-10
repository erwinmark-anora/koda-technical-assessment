import axios from 'axios';
import type { AxiosError } from 'axios';
import type { ValidationErrors } from '@/types/project';

/**
 * A non-2xx response from the API.
 *
 * The server always answers with a `message`, so the UI can surface something
 * useful without every call site inventing its own copy.
 */
export class ApiError extends Error {
    public readonly status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

export class ApiValidationError extends ApiError {
    public readonly errors: ValidationErrors;

    constructor(message: string, errors: ValidationErrors) {
        super(message, 422);
        this.name = 'ApiValidationError';
        this.errors = errors;
    }
}

/** The shape Laravel uses for both error and validation responses. */
interface ErrorBody {
    message?: string;
    errors?: ValidationErrors;
}

export const api = axios.create({
    baseURL: '/api',
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
});

/**
 * Turn every failure into one of our typed errors.
 *
 * Doing it once here means components only ever deal with `ApiError` or
 * `ApiValidationError`, never with a raw axios error.
 */
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ErrorBody>) => Promise.reject(toApiError(error)),
);

function toApiError(error: AxiosError<ErrorBody>): ApiError {
    // No response means the request never completed: offline, DNS, CORS.
    if (!error.response) {
        return new ApiError(
            'Could not reach the server. Check your connection and try again.',
            0,
        );
    }

    const { status, data } = error.response;

    // A proxy timeout or an HTML error page will not match ErrorBody.
    const body: ErrorBody =
        typeof data === 'object' && data !== null ? data : {};

    const message = body.message ?? fallbackMessage(status);

    if (status === 422 && body.errors) {
        return new ApiValidationError(message, body.errors);
    }

    return new ApiError(message, status);
}

function fallbackMessage(status: number): string {
    if (status === 404) {
        return 'That project no longer exists.';
    }

    if (status >= 500) {
        return 'Something went wrong on the server. Please try again.';
    }

    return 'The request could not be completed.';
}
