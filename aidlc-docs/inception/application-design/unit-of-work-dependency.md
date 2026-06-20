# Unit of Work Dependencies

## Dependency Matrix

| Unit | Depends On | Blocks |
|---|---|---|
| UOW-001 Project Scaffold and Shared Types | None | All other units |
| UOW-002 Core Scan and Transform Engine | UOW-001 | UOW-003, UOW-004, UOW-005, UOW-006 |
| UOW-003 API Functions | UOW-001, UOW-002 | UOW-004, UOW-006 |
| UOW-004 Frontend Prompt Guard UX | UOW-001, UOW-002, UOW-003 | UOW-006 |
| UOW-005 Custom Rule Builder and Copilot Adapter | UOW-001, UOW-002, UOW-003 | UOW-004, UOW-006 |
| UOW-006 Verification and Documentation | UOW-001 through UOW-005 | Final readiness |

## Recommended Sequence

1. UOW-001 Project Scaffold and Shared Types
2. UOW-002 Core Scan and Transform Engine
3. UOW-003 API Functions
4. UOW-004 Frontend Prompt Guard UX
5. UOW-005 Custom Rule Builder and Copilot Adapter
6. UOW-006 Verification and Documentation

## Parallelization Notes

Because this is a single-developer hackathon implementation, sequence is more useful than parallel ownership. After UOW-002 is stable, API and frontend can be developed in short alternating slices.

## Boundary Validation

- Core logic must not import React or Azure Functions runtime.
- UI must not import server-only Copilot SDK modules.
- API functions must use shared types and validation helpers.
- Rule generation adapter must degrade gracefully without breaking Rule Builder UI.