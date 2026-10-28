# Suggested API Contract

Use this contract as a common reference for frontend-only, backend-only, and full-stack tracks. You may extend it; document deviations.

Base path: `/api`

## Authentication
- `POST /auth/signup` — `{ "firstName": "Asha", "lastName": "Sharma", "email": "asha@example.com", "password": "example-password" }`
- `POST /auth/login` — `{ "email": "asha@example.com", "password": "example-password" }`
- `POST /auth/logout` — invalidate/clear the session as appropriate.

Use a secure cookie or token-based approach and explain the choice. Never store plain-text passwords.

## Habits
- `GET /habits?status=active|archived`
- `POST /habits` — `{ "name": "Read", "description": "Read for 20 minutes", "startDate": "2026-10-01", "frequency": "DAILY" }`
- `GET /habits/:id`
- `PATCH /habits/:id`
- `DELETE /habits/:id` — document what happens to history.
- `POST /habits/:id/archive`
- `POST /habits/:id/unarchive` — optional.

## Completion records
- `GET /habits/:id/completions?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `PUT /habits/:id/completions/:date` — marking the same habit/date twice must not create duplicates.
- `DELETE /habits/:id/completions/:date` — undo completion.

Use calendar dates (`YYYY-MM-DD`) consistently rather than timestamps for completion days.

## Dashboard
- `GET /dashboard/stats?from=YYYY-MM-DD&to=YYYY-MM-DD`
- Define the completion-rate denominator and document it.

## Example error shape
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Name is required",
    "details": { "name": "This field is required" }
  }
}
```

Use appropriate status codes, e.g. 400 for invalid input, 401 for unauthenticated requests, 404 when a record is missing or not accessible, and 409 for conflicts where appropriate.
