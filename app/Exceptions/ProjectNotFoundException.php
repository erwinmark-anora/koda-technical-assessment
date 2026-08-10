<?php

namespace App\Exceptions;

use RuntimeException;

/**
 * Raised when a project is requested by an id that does not exist.
 *
 * Carrying our own exception (rather than leaking Eloquent's
 * ModelNotFoundException) keeps the storage engine out of the HTTP layer and
 * lets us render a consistent error body.
 */
class ProjectNotFoundException extends RuntimeException
{
    public static function withId(int $id): self
    {
        return new self("No project exists with the id [{$id}].");
    }
}
