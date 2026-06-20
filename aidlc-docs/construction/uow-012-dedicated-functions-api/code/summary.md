# UOW-012 Code Summary - Dedicated Functions API

## Summary

Prepared the app to use a dedicated Azure Functions API instead of Static Web Apps managed Functions for production API execution. This is needed because Copilot SDK depends on a platform-specific Copilot CLI package that is too large and platform-specific for the current SWA managed Functions packaging path.

## Implementation Notes

- Added `VITE_API_BASE_URL` support to the frontend API client.
- Kept local Vite deterministic fallback behavior unchanged.
- Production builds can now point API calls to an external Function App URL while keeping the same `/api/...` route shape.

## Verification

Pending after implementation in this session:

- `npm run typecheck`
- `npm test`
- `npm run build:deploy`
- Dedicated Function App smoke tests
