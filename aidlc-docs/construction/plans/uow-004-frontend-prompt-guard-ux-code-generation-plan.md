# Code Generation Plan - UOW-004 Frontend Prompt Guard UX

## Unit Context

- **Unit**: UOW-004 Frontend Prompt Guard UX
- **Purpose**: Implement the main user-facing Prompt Guard flow.
- **Dependencies**: UOW-001 shared types, UOW-002 core engine, UOW-003 API contracts.
- **Stories**: US-001 through US-007, US-010 partial.

## Target Application Paths

- `src/lib/apiClient.ts`
- `src/App.tsx`
- `src/styles.css`
- `aidlc-docs/construction/uow-004-frontend-prompt-guard-ux/code/summary.md`

## Generation Steps

- [x] Step 1: Implement frontend API client with local fallback.
- [x] Step 2: Replace minimal `App.tsx` with Prompt Guard UI state and interactions.
- [x] Step 3: Implement highlight preview, findings panel, transform controls, Apply, Ignore, Apply All.
- [x] Step 4: Implement Safe Output Preview, Safe Review, and Copy.
- [x] Step 5: Update responsive CSS for the full tool surface.
- [x] Step 6: Create UOW-004 code summary documentation.
- [x] Step 7: Run typecheck, build, and test.
- [x] Step 8: Update this plan checklist after each step.

## Completion Criteria

- Local UI can scan the demo prompt.
- Individual and global transforms update output.
- Safe Review mock displays result from transformed text.
- Copy action is available.
- `npm run typecheck`, `npm run build`, and `npm test` pass.