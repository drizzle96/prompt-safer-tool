# Code Generation Plan - UOW-005 Custom Rule Builder and Copilot Adapter

## Unit Context

- **Unit**: UOW-005 Custom Rule Builder and Copilot Adapter
- **Purpose**: Implement custom rule generation, preview, approval, and session scan integration.
- **Dependencies**: UOW-001 through UOW-004.
- **Stories**: US-008, US-009, US-010.

## Target Application Paths

- `package.json`
- `api/src/services/ruleGenerate.ts`
- `api/src/functions/ruleGenerate.ts`
- `src/lib/apiClient.ts`
- `src/App.tsx`
- `src/styles.css`
- `aidlc-docs/construction/uow-005-custom-rule-builder-and-copilot-adapter/code/summary.md`

## Generation Steps

- [x] Step 1: Install and pin `@github/copilot-sdk`.
- [x] Step 2: Implement rule generation service with Copilot SDK adapter and deterministic fallback.
- [x] Step 3: Implement `/api/rules/generate` function.
- [x] Step 4: Extend API client for generate and preview with local fallback.
- [x] Step 5: Extend frontend state to include session custom rules and pass them to scan/mask.
- [x] Step 6: Add Custom Rule Builder UI with generate, preview, approve.
- [x] Step 7: Update styling and summary docs.
- [x] Step 8: Run typecheck, build, and test.
- [x] Step 9: Browser verify custom rule demo flow.
- [ ] Step 10: Update this plan checklist after each step.

## Completion Criteria

- `DEMO-2026-0001` can generate a ticket rule.
- Preview shows a transformed sample.
- Approved custom rule appears in subsequent Scan findings.
- `npm run typecheck`, `npm run build`, and `npm test` pass.