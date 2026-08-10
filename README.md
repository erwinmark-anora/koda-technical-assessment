# Client Project Tracker

A small full-stack application for a digital agency to track client projects,
their status, priority and dates.

Built with **Laravel 13** (REST API) + **React 19** (single-page UI) +
**PostgreSQL 18**, fully containerised with **Laravel Sail**.

---

## Table of contents

- [Technology choices](#technology-choices)
- [Setup](#setup)
- [Running the application](#running-the-application)
- [API reference](#api-reference)
- [Validation rules](#validation-rules)
- [Architecture](#architecture)
- [Testing](#testing)
- [Assumptions](#assumptions)
- [Bonus features](#bonus-features)

---

## Technology choices

| Layer | Choice | Why |
| --- | --- | --- |
| Backend | Laravel 13 (PHP 8.4) | Form requests, Eloquent, API resources and a DI container cover most of this brief out of the box, so the code that remains is the code that is actually specific to the problem. |
| Frontend | React 19 + TypeScript | Requested. Types across the API boundary catch a whole class of mistakes at compile time. |
| Styling | Tailwind CSS v4 | Requested. Utility classes keep layout decisions next to the markup, and the shadcn/ui primitives already present in the starter kit give accessible dialogs and selects for free. |
| Database | PostgreSQL 18 | Requested. Strict typing, real `date` columns and dependable indexing. |
| Container | Laravel Sail | Requested. One command boots the app and the database at matching versions on any machine. |
| Page shell | Inertia | Already wired into the starter kit. It is used only to render the single page and hand the React app its enum options — all project data flows through the REST API. |

---

## Setup

### Prerequisites

- Docker (Docker Desktop, or Docker Engine inside WSL2 on Windows)
- Nothing else — PHP, Node and PostgreSQL all run inside the containers

### 1. Environment file

```bash
cp .env.example .env
```

The defaults already point at the containerised database:

```env
DB_CONNECTION=pgsql
DB_HOST=pgsql
DB_PORT=5432
DB_DATABASE=laravel
DB_USERNAME=sail
DB_PASSWORD=password
APP_PORT=8000
```

### 2. Start the containers

```bash
./vendor/bin/sail up -d
```

First run builds the PHP image, which takes a few minutes. Subsequent starts
are immediate.

> If `vendor/` is not present yet (fresh clone), install dependencies first with
> a throwaway container:
>
> ```bash
> docker run --rm -v "$(pwd)":/opt -w /opt laravelsail/php85-composer:latest \
>     composer install --ignore-platform-reqs
> ```

### 3. Application key, database and assets

```bash
./vendor/bin/sail artisan key:generate
./vendor/bin/sail artisan migrate --seed
./vendor/bin/sail npm install
./vendor/bin/sail npm run build
```

`migrate --seed` loads the twelve reference projects from the supplied
`test_data.json`.

### 4. Open the app

<http://localhost:8000>

### Windows note

If Docker Engine runs inside WSL2 rather than Docker Desktop, run the commands
from a WSL shell in the project directory, e.g.

```bash
cd /mnt/c/path/to/koda-technical-assessment
docker compose up -d
docker compose exec laravel.test php artisan migrate --seed
```

---

## Running the application

| Task | Command |
| --- | --- |
| Start | `./vendor/bin/sail up -d` |
| Stop | `./vendor/bin/sail down` |
| Frontend dev server (hot reload) | `./vendor/bin/sail npm run dev` |
| Production asset build | `./vendor/bin/sail npm run build` |
| Tests | `./vendor/bin/sail pest` |
| Re-seed the reference data | `./vendor/bin/sail artisan db:seed --class=ProjectSeeder` |
| Reset the database | `./vendor/bin/sail artisan migrate:fresh --seed` |
| psql shell | `./vendor/bin/sail psql` |

---

## API reference

All endpoints are mounted under Laravel's conventional `/api` prefix and
return JSON.

| Brief | Implemented as | Success |
| --- | --- | --- |
| `GET /projects` | `GET /api/projects` | `200` |
| `GET /projects/:id` | `GET /api/projects/{id}` | `200` |
| `POST /projects` | `POST /api/projects` | `201` |
| `PUT /projects/:id` | `PUT /api/projects/{id}` | `200` |
| `DELETE /projects/:id` | `DELETE /api/projects/{id}` | `204` |

### Project representation

```json
{
    "id": 1,
    "client_name": "Acme Corporation",
    "project_name": "Corporate Website Redesign",
    "description": "Redesign and modernize the company's corporate website.",
    "status": "in_progress",
    "status_label": "In Progress",
    "priority": "high",
    "priority_label": "High",
    "start_date": "2026-06-01",
    "due_date": "2026-07-15",
    "is_overdue": true,
    "created_at": "2026-08-10T05:11:40+00:00",
    "updated_at": "2026-08-10T05:11:40+00:00"
}
```

Status and priority are stored and accepted as **slugs**; each is returned
alongside a `_label` for display:

| Status slug | Label | | Priority slug | Label |
| --- | --- | --- | --- | --- |
| `planning` | Planning | | `low` | Low |
| `in_progress` | In Progress | | `medium` | Medium |
| `on_hold` | On Hold | | `high` | High |
| `completed` | Completed | | | |

`is_overdue` is derived, not stored: a project is overdue when its due date has
passed and its status is not `completed`.

### Query parameters on `GET /api/projects`

| Parameter | Example | Notes |
| --- | --- | --- |
| `search` | `?search=portal` | Case-insensitive partial match on client name, project name and description. |
| `status` | `?status[]=planning&status[]=on_hold` | Repeatable, or comma separated. |
| `priority` | `?priority[]=high` | Repeatable, or comma separated. |
| `sort` | `?sort=due_date` | One of `client_name`, `project_name`, `status`, `priority`, `start_date`, `due_date`, `created_at`. Defaults to `created_at`. |
| `direction` | `?direction=desc` | `asc` or `desc`. Defaults to `desc`. |
| `per_page` | `?per_page=25` | Defaults to 15, maximum 100. |
| `page` | `?page=2` | |

Sorting by `priority` or `status` orders by real-world rank (High → Medium →
Low), not alphabetically.

The query string is validated by
[`IndexProjectRequest`](app/Http/Requests/Projects/IndexProjectRequest.php), so
reads are checked exactly like writes: an unknown sort column, filter value or
oversized `per_page` returns `422` with a readable message rather than being
silently corrected. This is also what keeps a crafted `?sort=` away from the
query builder.

### Examples

```bash
# List
curl http://localhost:8000/api/projects

# Search and filter
curl "http://localhost:8000/api/projects?search=portal&status[]=planning&priority[]=high"

# Create
curl -X POST http://localhost:8000/api/projects \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
        "client_name": "Koda Ltd",
        "project_name": "Assessment Demo",
        "description": "Created via the REST API.",
        "status": "planning",
        "priority": "high",
        "start_date": "2026-09-01",
        "due_date": "2026-10-01"
      }'

# Update (full replace)
curl -X PUT http://localhost:8000/api/projects/1 \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{ "client_name": "Acme", "project_name": "Redesign",
        "status": "completed", "priority": "medium" }'

# Delete
curl -X DELETE http://localhost:8000/api/projects/1
```

### Error responses

| Situation | Status | Body |
| --- | --- | --- |
| Validation failed | `422` | `{"message": "...", "errors": {"field": ["..."]}}` |
| Project not found | `404` | `{"message": "No project exists with the id [9999]."}` |
| Unknown API route | `404` | `{"message": "The requested endpoint does not exist."}` |

---

## Validation rules

| Field | Rules |
| --- | --- |
| `client_name` | required, string, max 255 |
| `project_name` | required, string, max 255 |
| `description` | optional, string, max 5000 |
| `status` | required, one of the four status slugs |
| `priority` | required, one of the three priority slugs |
| `start_date` | optional, valid date |
| `due_date` | optional, valid date, **not earlier than `start_date`** |

Messages are written for humans, e.g.
`"Due date cannot be earlier than the start date."` and
`"Status must be one of: Planning, In Progress, On Hold, Completed."`

Store and update share a single rule definition
([`ProjectValidationRules`](app/Concerns/ProjectValidationRules.php)) so the two
endpoints cannot drift apart. The same rules are mirrored client-side in
[`validate-project.ts`](resources/js/lib/validate-project.ts) for instant
feedback — the server remains the authority and re-validates every request.

---

## Architecture

The guiding rule is that each layer depends on the one below it through an
interface, never on a concrete implementation.

```
HTTP            ProjectController          thin; validates, delegates, serialises
                ├── IndexProjectRequest    validates the query string
                ├── StoreProjectRequest    validates the payload
                ├── UpdateProjectRequest
                └── ProjectResource        serialisation

Application     ProjectService             use cases; depends on ProjectRepositoryInterface

Domain          Project (model)            ProjectStatus / ProjectPriority (enums)

Persistence     ProjectRepositoryInterface
                └── ProjectRepository      search, filters, sorting, paging
```

### Where SOLID shows up

- **Single responsibility** — the controller only handles HTTP; validation lives
  in form requests, serialisation in the resource, use cases in the service, and
  everything that touches the database in the repository.
- **Open/closed** — adding a fifth status means adding one case to
  [`ProjectStatus`](app/Enums/ProjectStatus.php). Its validation rule, its error
  message, its API label and its filter chip in the UI all follow automatically,
  because every one of them is derived from the enum rather than hardcoded.
- **Liskov substitution** — any implementation of
  `ProjectRepositoryInterface` can replace the Eloquent one; the service calls
  the contract and never inspects the concrete type.
- **Interface segregation** —
  [`ProjectRepositoryInterface`](app/Contracts/ProjectRepositoryInterface.php)
  exposes only the five operations the application actually performs, rather
  than a generic CRUD-everything interface.
- **Dependency inversion** — `ProjectService` depends on
  `ProjectRepositoryInterface`; the Eloquent implementation is bound in
  [`AppServiceProvider`](app/Providers/AppServiceProvider.php). Swapping the
  storage engine touches one line.

### Frontend structure

```
resources/js/
├── pages/projects/index.tsx           composition only: which state to render
├── hooks/use-projects.ts              filter state, debounced search, fetching
├── lib/api/http.ts                    axios instance; normalises every failure into a typed error
├── lib/api/projects.ts                the five endpoints
├── lib/validate-project.ts            client-side mirror of the server rules
├── lib/format.ts                      date formatting
├── types/project.ts                   the API contract in TypeScript
└── components/projects/            one folder per thing the page does
    ├── list/
    │   ├── project-table.tsx          desktop table
    │   ├── project-card-list.tsx      mobile layout
    │   ├── project-sort-button.tsx    sortable column header
    │   ├── project-row-actions.tsx    edit / delete buttons
    │   ├── project-badges.tsx         status / priority / overdue pills
    │   ├── project-pagination.tsx
    │   └── project-list-states.tsx    loading / empty / error
    ├── filters/
    │   └── project-filters.tsx        search and filter chips
    ├── form/
    │   ├── project-form-dialog.tsx    dialog shell
    │   ├── project-form.tsx           the fields and submit logic
    │   └── form-field.tsx             label + input + error
    └── delete/
        └── delete-project-dialog.tsx  confirmation
```

One component per file. Data fetching is isolated in `use-projects`, so the
page and its children stay presentational. The search box is debounced by
300 ms, and a response is discarded if the filters changed while it was in
flight, so fast typing cannot produce out-of-order results.

---

## Testing

```bash
./vendor/bin/sail pest
```

83 tests covering:

| File | Covers |
| --- | --- |
| `tests/Feature/Api/ProjectApiTest.php` | All five endpoints, status codes, response shape, 404s, overdue derivation |
| `tests/Feature/Api/ProjectValidationTest.php` | Every validation rule, including exact error messages and multi-field failures |
| `tests/Feature/Api/ProjectFilteringTest.php` | Search, filters, combined filters, sort ordering, pagination, SQL-injection and LIKE-wildcard safety |
| `tests/Feature/ProjectSeederTest.php` | Reference data loads correctly and is idempotent |
| `tests/Unit/ProjectEnumTest.php` | Enum values, labels, label↔slug resolution, priority weighting |

Tests run against a real PostgreSQL `testing` database created by the Sail
container, so the SQL behaviour under test is the SQL that runs in production.

Also available:

```bash
./vendor/bin/sail composer lint         # Pint (PHP formatting)
./vendor/bin/sail composer types:check  # PHPStan level 7
./vendor/bin/sail npm run lint          # ESLint
./vendor/bin/sail npm run types:check   # tsc
```

---

## Assumptions

1. **`/api` prefix.** The brief lists `GET /projects`; the API is served at
   `/api/projects` because `/` serves the UI. The mapping is one-to-one.
2. **Slugs over labels.** Status and priority are persisted as `in_progress`
   rather than `"In Progress"`, which keeps the database stable if the wording
   ever changes. Each response carries a `_label` so no consumer has to
   translate. The seeder accepts either form, so the supplied `test_data.json`
   loads unchanged.
3. **Only two fields are required.** The brief requires client name and project
   name and says status and priority must be *valid* — so status and priority
   are required with a valid value, while description, start date and due date
   are optional.
4. **`PUT` replaces.** Following REST semantics, `PUT` expects the complete
   resource and validates the same rules as `POST`. There is no partial-update
   endpoint.
5. **Due date without a start date is allowed.** The ordering rule only applies
   when both dates are present.
6. **No authentication.** Listed as optional in the brief. The tracker and the
   API are open so they can be reviewed without credentials. The starter kit's
   auth scaffolding is left in place but unused — adding `->middleware('auth')`
   to the API routes is all that would be needed.
7. **`test_data.json` is normalised, not modified.** The supplied file is not
   valid JSON (it has no opening `[`). It is left untouched; the seeder reads a
   corrected copy at `database/data/projects.json` with identical content.
8. **`id` values from the seed data are not forced.** Postgres assigns the
   identity column so its sequence stays consistent; on a fresh database the ids
   land on 1–12 anyway.

---

## Bonus features

Implemented beyond the core requirements:

- **Search** across client name, project name and description
- **Filtering** by status and priority, multi-select and combinable
- **Sorting** on every column, with meaningful ordering for status and priority
- **Pagination** with a server-side page-size cap
- **Unit and feature tests** (83)
- **Docker setup** via Laravel Sail
- Overdue detection, responsive mobile layout, loading/empty/error states,
  optimistic-feeling toasts, dark mode, keyboard-accessible dialogs and filters
