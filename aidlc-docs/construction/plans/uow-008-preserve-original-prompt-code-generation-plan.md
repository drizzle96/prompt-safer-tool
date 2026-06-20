# Code Generation Plan - UOW-008 Preserve Original Prompt

## Unit Context

- **Unit**: UOW-008 Preserve Original Prompt
- **Purpose**: Keep the user's original prompt unchanged while reflecting transforms only in the Safe Output Preview.
- **Dependencies**: UOW-002 core transform engine, UOW-004 frontend UX, UOW-007 tabbed workspace.
- **User Request**: "원본 프롬프트는 수정 결과를 반영 하지 않아줬음 좋겠어요"

## Target Application Paths

- `src/App.tsx`
- `src/lib/output.ts`
- `src/lib/core.test.ts`
- `src/styles.css`
- `aidlc-docs/construction/uow-008-preserve-original-prompt/code/summary.md`

## Generation Steps

- [x] Step 1: Document the requested behavior as a new UOW.
- [x] Step 2: Introduce a Safe Output composer that derives transformed output from original text plus applied choices.
- [x] Step 3: Update the frontend state model so the prompt editor owns original text only.
- [x] Step 4: Route Apply, Apply All, Ignore, Safe Review, and Copy through Safe Output state.
- [x] Step 5: Add regression tests for preserving original text while composing transformed output.
- [x] Step 6: Run typecheck, tests, and production deploy build.

## Completion Criteria

- Applying a finding does not mutate the prompt textarea value.
- Safe Output Preview reflects selected transforms.
- Copy copies Safe Output, not the original prompt.
- Safe Review reviews Safe Output, not the original prompt.
- Scan always scans the current original prompt.
- `npm run typecheck`, `npm test`, and `npm run build:deploy` pass.
