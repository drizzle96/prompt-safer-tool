# Code Generation Plan - UOW-007 Tabbed Workspace Separation

## Unit Context

- **Unit**: UOW-007 Tabbed Workspace Separation
- **Purpose**: Reduce page length and separate the primary prompt safety workflow from custom rule creation.
- **Dependencies**: UOW-004 frontend UX, UOW-005 custom rule builder.
- **Stories**: Supports the demo/operator workflow by making the tool easier to scan during presentation and repeated use.

## Target Application Paths

- `src/App.tsx`
- `src/styles.css`
- `aidlc-docs/construction/uow-007-tabbed-workspace/code/summary.md`

## Generation Steps

- [x] Step 1: Add a tab state model for Prompt Safety and Custom Rules.
- [x] Step 2: Move scan, findings, safe output, Safe Review, and Copy into the Prompt Safety tab.
- [x] Step 3: Move Custom Rule Builder and Rule Preview into the Custom Rules tab.
- [x] Step 4: Add accessible tab controls with stable panel IDs and visible selected state.
- [x] Step 5: Adjust CSS so inactive workflow content no longer contributes to page length.
- [x] Step 6: Run typecheck, tests, and production build.

## Completion Criteria

- First tab contains prompt safety scan, transform, review, and copy workflow.
- Second tab contains custom rule generation, preview, approval, and session rule count.
- Switching tabs preserves current prompt text, findings, generated rules, previews, and status.
- `npm run typecheck`, `npm test`, and `npm run build` pass.
