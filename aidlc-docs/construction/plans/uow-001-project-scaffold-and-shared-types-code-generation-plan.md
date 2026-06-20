# Code Generation Plan - UOW-001 Project Scaffold and Shared Types

## Unit Context

- **Unit**: UOW-001 Project Scaffold and Shared Types
- **Purpose**: Establish the application scaffold, scripts, baseline dependencies, shared TypeScript types, and Azure Functions-compatible API folder shape.
- **Dependencies**: None
- **Blocks**: UOW-002 through UOW-006
- **Stories Supported**: Enables all stories by providing shared project structure and contracts.

## Design Stage Decisions

- Functional Design: Skipped for this unit because it contains scaffold and shared contracts, not business behavior.
- NFR Requirements: Existing requirements apply; no additional unit-specific NFR decisions needed before scaffold.
- NFR Design: Core security/testability boundaries are already captured in Application Design.
- Infrastructure Design: Detailed Azure mapping will be handled before deployment-specific code and docs; this unit only creates `api/` shape.

## Target Application Paths

- `package.json`
- `index.html`
- `tsconfig.json`
- `tsconfig.node.json`
- `vite.config.ts`
- `vitest.config.ts`
- `src/main.tsx`
- `src/App.tsx`
- `src/styles.css`
- `src/lib/types.ts`
- `src/lib/constants.ts`
- `src/lib/validation.ts`
- `api/host.json`
- `api/local.settings.json.example`
- `api/src/shared/http.ts`
- `aidlc-docs/construction/uow-001-project-scaffold-and-shared-types/code/summary.md`

## Generation Steps

- [x] Step 1: Create package and TypeScript/Vite/Vitest configuration files.
- [x] Step 2: Create minimal React entry files and base CSS shell.
- [x] Step 3: Create shared domain types for rules, findings, transforms, API requests, API responses, and rule generation.
- [x] Step 4: Create shared constants for limits, demo prompt, and API route names.
- [x] Step 5: Create lightweight validation helpers for string bounds and enum checks.
- [x] Step 6: Create Azure Functions-compatible `api/` baseline files and shared HTTP helpers.
- [x] Step 7: Create unit code summary documentation under `aidlc-docs/construction/uow-001-project-scaffold-and-shared-types/code/summary.md`.
- [x] Step 8: Update this plan checklist after each step is generated.

## Security Requirements

- No raw prompt content should be logged.
- `local.settings.json` must not be committed; only an example file is generated.
- Input limit constants must support API validation in later units.

## PBT Requirements

- This unit selects `fast-check` as a dev dependency for later core tests.
- No property tests are required in UOW-001 because no business logic is implemented yet.

## Completion Criteria

- Scaffold files exist in the workspace root and `api/`.
- Shared types compile as TypeScript.
- The project has scripts for dev, build, preview, and test.
- The unit summary document exists.