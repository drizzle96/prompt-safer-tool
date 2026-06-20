# Code Generation Plan - UOW-003 API Functions

## Unit Context

- **Unit**: UOW-003 API Functions
- **Purpose**: Implement HTTP endpoints for scan, mask, rule preview, and safe review.
- **Dependencies**: UOW-001 shared types and UOW-002 core engine.
- **Stories**: US-001, US-003, US-004, US-007, US-009, US-011, US-012.

## Target Application Paths

- `api/src/functions/scan.ts`
- `api/src/functions/mask.ts`
- `api/src/functions/rulePreview.ts`
- `api/src/functions/safeReview.ts`
- `api/src/services/rulePreview.ts`
- `api/src/services/safeReview.ts`
- `api/src/shared/validators.ts`
- `aidlc-docs/construction/uow-003-api-functions/code/summary.md`

## Generation Steps

- [x] Step 1: Create API validation helpers.
- [x] Step 2: Create rule preview service.
- [x] Step 3: Create safe review service.
- [x] Step 4: Create scan API function.
- [x] Step 5: Create mask API function.
- [x] Step 6: Create rules preview API function.
- [x] Step 7: Create safe review API function.
- [x] Step 8: Create UOW-003 code summary documentation.
- [x] Step 9: Run typecheck, build, and test.
- [x] Step 10: Update this plan checklist after each step.

## Completion Criteria

- API files compile.
- Handler code does not log raw prompt data.
- Safe Review contract rejects original text by omission and validation.
- `npm run typecheck`, `npm run build`, and `npm test` pass.