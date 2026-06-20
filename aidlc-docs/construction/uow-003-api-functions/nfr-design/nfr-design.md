# NFR Design - UOW-003 API Functions

## Handler Design

- Use `app.http` handlers under `api/src/functions/`.
- Keep parsing and validation near the handler boundary.
- Use shared `jsonResponse` and `safeErrorResponse` helpers.

## Security Design

- Never log request bodies.
- Reject `originalText` on Safe Review request shape.
- Use `cache-control: no-store` in JSON responses.

## Validation Design

- Validate text lengths with existing helpers.
- Validate enums with shared enum guards.
- Validate arrays with local type guards.

## Testing Design

- Add API service tests around pure handler helper functions where practical in later integration.
- UOW-003 verification relies on TypeScript, build, and current core tests.