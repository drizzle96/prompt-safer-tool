# Test Case Set - UOW-012 Remove Safe Output Workflow

## Purpose

Define development test cases for removing the Safe Output workflow while preserving the core Prompt Guard, Custom Rule Builder, Copilot SDK diagnostics, and Azure Functions API evidence.

This TC set follows the existing AI-DLC structure:

- Requirements source: `aidlc-docs/inception/requirements/requirements.md`
- Azure addendum source: `aidlc-docs/inception/requirements/azure-cloud-integration-addendum.md`
- Current build/test instructions: `aidlc-docs/construction/build-and-test/`
- Impacted implementation units: UOW-004, UOW-008, UOW-010, UOW-011

## Scope Decision Under Test

Safe Output removal means:

- Remove the top-level `세이프 아웃풋` workspace tab.
- Remove Safe Output Preview UI from the frontend.
- Remove frontend Copy action for the transformed prompt.
- Remove frontend Safe Review action/result from the main user flow.
- Keep Prompt Guard scanning, highlight preview, finding cards, transform controls, Apply, Ignore, Apply All, and Custom Rule Builder.
- Keep the original prompt editor unchanged after transforms.
- Keep applied transforms visible in the detection preview so users can still inspect the safer version inline.
- Keep backend API endpoints only if needed for Azure cloud evidence or future compatibility; no frontend route should depend on Safe Output UI.

Out of scope for this TC set:

- Deleting Azure Functions code.
- Deleting shared scan/transform logic.
- Replacing Copilot SDK integration.
- Adding persistent storage or authentication.

## Traceability

| TC Area | Source Requirement / Design Note |
|---|---|
| Prompt scan remains | FR-001, FR-002, US-001 |
| Inline review remains | FR-005, US-002 |
| Apply/Ignore remains | FR-003, FR-004, FR-012, US-003, US-004, US-005 |
| Safe Output removed | Supersedes FR-014, FR-015, US-006 for UOW-012 |
| Safe Review removed from UI flow | Supersedes FR-018 and E2E Safe Review steps for UOW-012 |
| Custom Rule Builder remains | FR-019 through FR-025, US-008 through US-010 |
| API privacy remains | NFR-002, NFR-003, SECURITY-03, SECURITY-05, SECURITY-09 |
| Azure cloud evidence remains | Azure Cloud Integration Addendum AZ-FR-001 through AZ-FR-005 |

## Unit Test Cases

| ID | Title | Preconditions | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| UT-012-001 | Remove direct Safe Output composition dependency from active UI path | Source code updated for UOW-012 | Run TypeScript typecheck | `src/App.tsx` compiles without `composeSafeOutput`, `runSafeReview`, `SafeReviewResponse`, `review`, or clipboard copy state imports/state unless explicitly retained outside UI | High |
| UT-012-002 | Preserve transform display value helper | Findings and applied choices exist | Call `getFindingDisplayValue` for placeholder, masking, and dummy transform choices | Detection preview can still render transformed values without creating a separate Safe Output string | High |
| UT-012-003 | Preserve scoped finding selection | Multiple findings include two of the same type | Call `getScopedFindingIds` with `selected`, `same_type`, and `all` | Returned IDs match existing behavior | High |
| UT-012-004 | Preserve original prompt after apply | Prompt includes email and IP | Scan, apply transforms as state choices, then inspect source text | Original source text remains unchanged; transformed values appear only in preview state | High |
| UT-012-005 | Reset applied choices when prompt changes | Findings and applied choices exist | Change prompt text | Findings, selected finding, ignored IDs, choices, and applied choices reset | Medium |
| UT-012-006 | No stale review state remains | Safe Review UI removed | Run typecheck and grep references | No frontend `review` state or `safe-review-button` test id remains | Medium |
| UT-012-007 | API client remains tree-shakable after UI removal | API client still exports safe-review for backend compatibility if retained | Run build | Build passes; unused UI removal does not require deleting API client functions immediately | Low |

## Integration Test Cases

| ID | Title | Preconditions | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| IT-012-001 | Prompt scan works after Safe Output removal | App running locally or deployed | Submit demo prompt to `/api/scan` or click Scan | Built-in findings are returned/rendered: email, internal URL, bearer token, env secret, IP address | High |
| IT-012-002 | Apply All updates detection preview only | Scan has pending findings | Select global placeholder mode and click Apply All | Detection preview shows placeholders; original textarea still contains original sensitive values; no Safe Output tab is required | High |
| IT-012-003 | Individual apply still works | Scan has findings | Apply placeholder to one finding | Only selected finding shows transformed value in detection preview; finding card shows applied state | High |
| IT-012-004 | Ignore still warns without Safe Output | Scan has findings | Ignore one finding | Ignored finding is visually marked; status text warns the original value remains; no Safe Output/Safe Review call is made | High |
| IT-012-005 | Custom rule generation remains usable | App can use local fallback or Copilot SDK runtime | Generate rule from `DEMO-2026-0001`, preview it, approve it, rescan demo prompt | `ticket_id` finding appears with built-in findings and can be transformed through Apply All | High |
| IT-012-006 | Copilot SDK diagnostics remain visible | Rule generation response includes metadata | Generate a rule | UI still displays `source`, `engine`, `runtime`, and SDK attempted/configured status | High |
| IT-012-007 | No frontend dependency on `/api/safe-review` | Safe Output UI removed | Use browser devtools or mocked fetch during Scan/Apply/Rule Builder flow | No `/api/safe-review` request is made from the main flow | Medium |
| IT-012-008 | Azure health endpoint remains independent | `/api/health` implemented or planned by Azure addendum | Call `GET /api/health` | Safe JSON status does not depend on Safe Output UI and does not leak secrets | Medium |

## E2E Test Cases

| ID | Title | Preconditions | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| E2E-012-001 | Main Prompt Guard flow without Safe Output | App is running | Open app, click Scan, verify findings, click Apply All | User completes core safety review on the Prompt tab; transformed values appear in detection preview; no navigation to `세이프 아웃풋` is available | High |
| E2E-012-002 | Workspace tabs after removal | App is running | Inspect workspace tablist | Only `프롬프트 안전성` and `커스텀 규칙` are visible unless a new non-Safe-Output tab is intentionally added | High |
| E2E-012-003 | Removed UI controls are absent | App is running | Search UI for `세이프 아웃풋`, `Safe Output Preview`, `Safe Review`, and `Copy` controls | Removed Safe Output controls are absent from the frontend | High |
| E2E-012-004 | Custom Rule Builder end-to-end remains intact | App is running | Open Custom Rules, generate, preview, approve default ticket rule, return to Prompt, scan | `ticket_id` appears in scan results; Apply All transforms it in detection preview | High |
| E2E-012-005 | Source prompt preservation remains intact | App is running | Scan demo prompt, Apply All, inspect prompt textarea and detection preview | Textarea keeps original demo prompt; detection preview shows transformed placeholders | High |
| E2E-012-006 | Prompt change clears transform state | Applied transforms exist | Edit textarea text | Findings and applied states disappear; status asks user to scan again | Medium |
| E2E-012-007 | Mobile layout still usable | App opened under narrow viewport | Run Scan and inspect findings panel and custom rule tab | Controls do not overlap; tab layout remains usable without the removed Safe Output tab | Medium |

## Security and Privacy Test Cases

| ID | Title | Preconditions | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| SEC-012-001 | No raw prompt leaves frontend for Safe Review | Safe Output/Safe Review UI removed | Run main UI flow and inspect network calls | No Safe Review request is sent from UI | High |
| SEC-012-002 | API safe-review rejects originalText if retained | `/api/safe-review` still exists | POST body containing `originalText` | API returns safe 400 response and does not echo raw text | Medium |
| SEC-012-003 | Rule Builder still blocks high-risk examples | Rule Builder available | Enter a secret-like example such as `API_KEY=sk-demo-1234567890`; generate rule | SDK path is not called for high-risk input; response uses fallback/warning path | High |
| SEC-012-004 | API responses remain no-store | APIs available | Call `/api/scan`, `/api/mask`, `/api/rules/preview`, and `/api/health` | JSON responses include `cache-control: no-store` where applicable | Medium |
| SEC-012-005 | No prompt persistence introduced | Code review | Search for localStorage/sessionStorage/DB writes involving prompt text | No long-term or browser persistent storage for raw prompt is introduced | High |

## Regression Test Cases

| ID | Title | Legacy Risk | Expected Result |
|---|---|---|---|
| REG-012-001 | Remove `WorkspaceTab = "output"` path | Old tab route can leave unreachable state | Type union and state transitions no longer include output tab |
| REG-012-002 | Remove output panel styles if unused | Dead CSS can confuse future UI work | `.output-panel` and `.review-panel` are removed or intentionally documented if reused |
| REG-012-003 | Update status copy | Old copy mentions Safe Output | Apply status does not say `Safe Output에 적용했습니다`; it says the detection preview was updated |
| REG-012-004 | Update E2E instructions | Old E2E expects Safe Review and Copy | New E2E flow stops after Prompt Guard and Custom Rule Builder verification |
| REG-012-005 | Update README demo flow | README currently says run Safe Review and copy safe prompt | README no longer instructs users to use removed Safe Output controls |
| REG-012-006 | Update PRD/user stories if product decision is final | FR-014/FR-015/US-006 still mention Safe Output | Requirements are either superseded by this UOW or edited in a follow-up docs pass |

## Manual Smoke Test Script

1. Start the app with `npm run dev`.
2. Open `http://127.0.0.1:5173/`.
3. Confirm there is no `세이프 아웃풋` tab.
4. Click `Scan` on the default demo prompt.
5. Confirm built-in findings appear in the Findings Panel.
6. Set global mode to `플레이스홀더`.
7. Click `모두 적용`.
8. Confirm detection preview shows `[EMAIL]`, `[URL]`, `[BEARER_TOKEN]`, `API_KEY=[SECRET]`, and `[IP_ADDRESS]`.
9. Confirm the original textarea still contains the original demo prompt.
10. Open `커스텀 규칙`.
11. Generate, preview, and approve the default `DEMO-2026-0001` rule.
12. Return to `프롬프트 안전성` and click `Scan`.
13. Confirm `ticket_id` appears and Apply All transforms it to `[TICKET_ID]` in the detection preview.

## Automated Command Set

Run after implementation:

```bash
nvm use 20.19.0
npm ci
npm run typecheck
npm test
npm run build
npm run build:api
```

Expected result:

- Typecheck passes.
- Unit/property tests pass.
- Frontend build passes.
- API build passes.
- No frontend Safe Output tab or Copy/Safe Review controls remain.

## Implementation Notes for Developers

- Prefer removing the Safe Output UI first, then updating tests and docs.
- Keep `getFindingDisplayValue` and `getScopedFindingIds` if the detection preview continues to show transformed values.
- Remove `composeSafeOutput` only if no backend/API test still depends on it.
- Keep `/api/safe-review` only if it remains part of Azure evidence or compatibility; otherwise mark it for a separate API removal UOW.
- Update user-facing status text so it refers to detection preview or applied findings, not Safe Output.
- Do not add storage for transformed prompts as a replacement for Safe Output.
