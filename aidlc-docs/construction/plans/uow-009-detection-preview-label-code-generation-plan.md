# Code Generation Plan - UOW-009 Detection Preview Label

## Unit Context

- **Unit**: UOW-009 Detection Preview Label
- **Purpose**: Add a visible label UI above the detection result preview area.
- **Dependencies**: UOW-007 tabbed workspace, UOW-008 preserve original prompt behavior.
- **User Request**: "검출 결과 미리 보기 텍스트 에어리어 위에 라벨 UI 추가"

## Target Application Paths

- `src/App.tsx`
- `src/styles.css`
- `aidlc-docs/construction/uow-009-detection-preview-label/code/summary.md`

## Generation Steps

- [x] Step 1: Document the UI label request as a new UOW.
- [x] Step 2: Add a visible label above the detection preview region.
- [x] Step 3: Connect the label to the preview region with accessible labeling.
- [x] Step 4: Add compact status text that distinguishes source prompt and detection preview.
- [x] Step 5: Run typecheck, tests, and deploy build.

## Completion Criteria

- A visible label appears directly above the detection preview area.
- The label makes it clear that this area is the detection result preview, not the original prompt input.
- The existing original-input preservation behavior remains unchanged.
- `npm run typecheck`, `npm test`, and `npm run build:deploy` pass.
