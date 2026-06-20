# Units of Work - Safe Prompt Guard

## Code Organization Strategy

Use a simple greenfield TypeScript layout:

- Root Vite React app for the frontend.
- `api/` for Azure Functions-compatible HTTP endpoints.
- `src/lib/` for shared core logic, types, validation, and adapters.
- `src/components/` for UI components.
- `src/test/` or colocated test files for unit and property-based tests.

## UOW-001 Project Scaffold and Shared Types

Responsibilities:
- Create the React/Vite/TypeScript project scaffold.
- Add Azure Functions-compatible API folder structure.
- Define shared domain types for rules, findings, transforms, API requests, and responses.
- Add project scripts and baseline dependencies.

Primary outputs:
- `package.json`, lock file, TypeScript config, Vite config.
- Shared type definitions.

## UOW-002 Core Scan and Transform Engine

Responsibilities:
- Implement built-in detection rules.
- Implement scan, overlap resolution, transform preview, and mask application.
- Keep logic pure and testable.
- Add example tests and partial PBT with `fast-check`.

Primary outputs:
- Core rule definitions.
- Scan and transform modules.
- Unit and property-based tests.

## UOW-003 API Functions

Responsibilities:
- Implement `/api/scan`.
- Implement `/api/mask`.
- Implement `/api/rules/preview`.
- Implement `/api/safe-review`.
- Add request validation and safe error responses.

Primary outputs:
- Azure Functions HTTP handlers.
- Validation helpers.

## UOW-004 Frontend Prompt Guard UX

Responsibilities:
- Implement prompt input, highlight preview, Global Fix Bar, Findings Panel, Safe Output Preview, Safe Review UI, and Copy.
- Integrate API client with frontend state.
- Support Apply, Ignore, Apply All, selected/same_type/all scopes.

Primary outputs:
- React components and styling.
- API client wrapper.

## UOW-005 Custom Rule Builder and Copilot Adapter

Responsibilities:
- Implement Rule Builder UI.
- Implement pre-scan warnings.
- Implement `/api/rules/generate` adapter boundary for Copilot SDK with deterministic fallback.
- Implement preview, approval, and session custom rules.

Primary outputs:
- Rule generation service and adapter.
- Rule Builder UI integration.

## UOW-006 Verification and Documentation

Responsibilities:
- Add README with local run, test, API, security principles, and deployment notes.
- Run build and tests.
- Document Azure Static Web Apps and Functions readiness.
- Validate demo flow.

Primary outputs:
- README updates.
- Build/test evidence.
- Demo-ready local URL.