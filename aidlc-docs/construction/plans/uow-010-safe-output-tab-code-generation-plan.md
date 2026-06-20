# Code Generation Plan - UOW-010 Safe Output Tab

## Unit Context

- **Unit**: UOW-010 Safe Output Tab
- **Purpose**: Move Safe Output Preview into its own top-level workspace tab.
- **Dependencies**: UOW-007 tabbed workspace, UOW-008 preserve original prompt, UOW-009 detection preview label.
- **User Request**: "세이프 아웃풋 프리뷰 기능도 탭으로 분리 해 줘"

## Target Application Paths

- `src/App.tsx`
- `src/styles.css`
- `aidlc-docs/construction/uow-010-safe-output-tab/code/summary.md`

## Generation Steps

- [x] Step 1: Document the new tab separation request as a UOW.
- [x] Step 2: Add a top-level Safe Output tab between Prompt Safety and Custom Rules.
- [x] Step 3: Move Safe Output Preview, Safe Review, Copy, review result, and status into the Safe Output tab.
- [x] Step 4: Add tab badge state for applied output items.
- [x] Step 5: Keep original prompt preservation and detection preview behavior unchanged.
- [x] Step 6: Run typecheck, tests, deploy build, and browser verification.

## Completion Criteria

- Prompt Safety tab contains source prompt, detection preview, finding list, and transform controls.
- Safe Output tab contains output preview, Safe Review, Copy, review result, and status.
- Custom Rules tab remains unchanged.
- Applying transforms updates the Safe Output tab content without mutating the source prompt.
- `npm run typecheck`, `npm test`, and `npm run build:deploy` pass.
