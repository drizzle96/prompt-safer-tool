# Code Generation Plan - UOW-002 Core Scan and Transform Engine

## Unit Context

- **Unit**: UOW-002 Core Scan and Transform Engine
- **Purpose**: Implement deterministic scan, overlap resolution, transform preview, transform application, and tests.
- **Dependencies**: UOW-001 shared types and scaffold.
- **Stories**: US-001, US-003, US-004, US-008, US-010, US-011, US-012.

## Target Application Paths

- `src/lib/rules.ts`
- `src/lib/scan.ts`
- `src/lib/transform.ts`
- `src/lib/core.test.ts`
- `src/lib/core.property.test.ts`
- `aidlc-docs/construction/uow-002-core-scan-and-transform-engine/code/summary.md`

## Generation Steps

- [x] Step 1: Implement built-in rules in `src/lib/rules.ts`.
- [x] Step 2: Implement scan pipeline and overlap resolution in `src/lib/scan.ts`.
- [x] Step 3: Implement transform previews and transform application in `src/lib/transform.ts`.
- [x] Step 4: Add example-based tests for demo prompt, overlap behavior, and transform behavior in `src/lib/core.test.ts`.
- [x] Step 5: Add partial property-based tests in `src/lib/core.property.test.ts`.
- [x] Step 6: Create UOW-002 code summary documentation.
- [x] Step 7: Run typecheck, build, and test.
- [x] Step 8: Update this plan checklist after each step.

## Security Requirements

- Core modules must not log raw prompt text.
- Full masking and placeholder transforms must remove original finding values.
- Invalid ranges must not corrupt output.

## PBT Requirements

- Use `fast-check`.
- Cover non-overlap invariant.
- Cover valid finding range invariant.
- Cover full masking and placeholder original-value removal invariant.

## Completion Criteria

- Core scan and transform modules compile.
- Demo prompt detects built-in risks.
- `npm test` passes with example and property-based tests.
- `npm run typecheck` and `npm run build` pass.