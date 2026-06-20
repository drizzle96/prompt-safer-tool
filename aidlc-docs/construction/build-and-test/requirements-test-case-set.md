# Requirements-Based Test Case Set - Safe Prompt Guard Without Safe Output

## Purpose

This test case set is generated from `aidlc-docs/inception/requirements/requirements.md`, with the current development decision that the Safe Output workflow is treated as removed. It validates the remaining product scope: Prompt Guard scanning, detection preview, Findings Panel, transforms, Custom Rule Builder, Copilot SDK diagnostics, Azure Functions APIs, security, and deployment readiness.

The Safe Output tab, Safe Output Preview, frontend Copy action, and frontend Safe Review workflow are intentionally excluded. If backend `/api/safe-review` remains for compatibility or Azure evidence, it is tested only as an API privacy/security surface, not as a user-facing workflow.

Related UOW-specific TC set: `aidlc-docs/construction/uow-012-remove-safe-output-workflow/test-cases/test-case-set.md`.

## Test Levels

| Level | Focus |
|---|---|
| Unit | Pure scan, overlap, transform, validation, and helper behavior |
| Property-Based | Invariants for scan ranges, overlap safety, and secret removal after full transforms |
| API Integration | Azure Functions-compatible handlers and request validation |
| Frontend Integration | React workflow state, tabs, findings, transforms, custom rules, Copilot SDK diagnostics |
| E2E | User-visible journey from prompt scan to inline transformed preview and custom rule scan |
| Security | Privacy, safe errors, no raw logging, unsafe input rejection |
| Deployment | Azure Static Web Apps and Azure Functions readiness |

## Requirement Traceability Matrix

Safe Output-related UI requirements are intentionally excluded in this TC set:

| Original Requirement | This TC Set Decision |
|---|---|
| FR-014 Safe Output Preview | Excluded. Transformed values are verified in detection preview instead. |
| FR-015 Copy Result | Excluded. No frontend copy action is tested. |
| FR-018 Safe Review UI | Excluded. No frontend Safe Review action/result is tested. |

| Requirement | Primary Test IDs |
|---|---|
| FR-001 Prompt Input | FE-001, FE-002, SEC-004 |
| FR-002 Deterministic Scan | UT-001, UT-002, API-001, E2E-001 |
| FR-003 Finding Model | UT-003, API-001 |
| FR-004 Overlap Handling | UT-004, PBT-001 |
| FR-005 Highlight Preview | FE-003, E2E-001 |
| FR-006 Findings Panel | FE-004, E2E-001 |
| FR-007 Transform Modes | UT-005, API-002, FE-005 |
| FR-008 Transform Depth | UT-006, API-002, FE-006 |
| FR-009 Apply Scope | UT-007, API-003, FE-007 |
| FR-010 Mask API | API-002, API-003 |
| FR-011 Index Shift Safety | UT-008, PBT-003 |
| FR-012 Apply and Ignore | FE-008, FE-009, API-004 |
| FR-013 Global Fix Bar | FE-010, E2E-002 |
| FR-016 Safe Review API | API-004, SEC-002, only if endpoint is retained |
| FR-017 Safe Review Mock First | API-005, only if endpoint is retained |
| FR-019 Rule Builder Input | FE-011, SEC-003 |
| FR-020 Rule Builder Pre-Scan | API-006, SEC-003 |
| FR-021 Copilot SDK Rule Generation | API-007, FE-012 |
| FR-022 Rule Preview API | API-008, FE-013 |
| FR-023 Custom Rule Approval | FE-014, E2E-004 |
| FR-024 Session Custom Rules | FE-015, E2E-004 |
| FR-025 Unified Finding UX | FE-016, E2E-004 |
| FR-026 Demo Flow | E2E-005, adjusted to stop at inline transformed preview |
| NFR-001 Performance | PERF-001 |
| NFR-002 Privacy | SEC-002, SEC-005, SEC-006 |
| NFR-003 Security | SEC-004, SEC-007, API-009 |
| NFR-004 UX | E2E-005, FE-017 |
| NFR-005 Accessibility | A11Y-001, A11Y-002 |
| NFR-006 Maintainability | MAINT-001 |
| NFR-007 Testability | UT-009, PBT-001 through PBT-004 |
| NFR-008 Deployment Readiness | DEP-001, DEP-002 |
| Azure Cloud Addendum | DEP-003, API-010, SEC-008 |

## Unit Test Cases

| ID | Requirement | Title | Test Data | Steps | Expected Result | Priority |
|---|---|---|---|---|---|---|
| UT-001 | FR-002 | Detect all required built-in risk types | Demo prompt with email, phone, URL, internal URL, IP, bearer token, API key, generic token, env secret | Call `scanText` | Findings include each required built-in type supported by the product | High |
| UT-002 | FR-002 | Scan is deterministic and local | Same text scanned twice | Call `scanText` twice | Finding count, type, value, range, severity, and reason are stable | High |
| UT-003 | FR-003 | Finding model is complete | Any detected email | Inspect finding object | Finding includes id, ruleId, type, value, start, end, severity, reason, status, suggestedTransform, and availableTransforms | High |
| UT-004 | FR-004 | Higher-priority overlap wins | Text containing `Authorization: Bearer abc.def.ghi` | Call `scanText` | Only bearer token finding remains; generic token overlap is removed | High |
| UT-005 | FR-007 | Transform modes generate expected previews | Email, IP, token, URL findings | Call `buildTransformPreviews` | Masking, dummy, and placeholder previews exist where applicable | High |
| UT-006 | FR-008 | Transform depth is respected | Email and IP findings | Call `transformValue` with partial/full masking and dummy | Partial leaves safe structure; full removes original value | High |
| UT-007 | FR-009 | Apply scopes select correct targets | Two emails and one IP | Call `getScopedFindingIds` or API mask selection helper | `selected`, `same_type`, and `all` select expected IDs | High |
| UT-008 | FR-011 | Transform patches avoid index shifts | Prompt with multiple findings | Apply all transforms | Result text replaces all intended ranges without corrupting surrounding text | High |
| UT-009 | NFR-007 | Core logic remains testable without UI/API | Scan and transform modules | Import and test modules directly | Tests run without React, DOM, fetch, or Azure Functions runtime | Medium |
| UT-010 | FR-020 | Rule example validation enforces length | Example > 2,000 chars | Call `validateRuleExample` | Validation fails with 413-style status | Medium |
| UT-011 | SECURITY-09 | Error sanitization avoids internal detail fallback | Unknown thrown value | Call `sanitizeError` | Safe generic error is returned | Medium |
| UT-012 | UOW-012 | Active UI path has no Safe Output dependency | Updated frontend code | Run typecheck and inspect imports | `src/App.tsx` does not require Safe Output tab, frontend copy state, or Safe Review UI state | High |

## Property-Based Test Cases

| ID | Requirement | Property | Generator | Expected Invariant | Priority |
|---|---|---|---|---|---|
| PBT-001 | FR-004, PBT-03 | Accepted findings never overlap | Arrays of secret-like snippets and separators | For every adjacent finding, previous end is <= next start | High |
| PBT-002 | FR-003, PBT-03 | Finding ranges match source slices | Arrays of emails, URLs, tokens, env secrets, IPs | `text.slice(start, end) === finding.value` for every finding | High |
| PBT-003 | FR-011, PBT-03 | Full masking removes original selected values | Arrays of secret-like snippets | Transformed text does not contain any applied original value | High |
| PBT-004 | PBT-07, PBT-09 | Domain generators cover supported finding families | Domain-specific arbitrary prompt snippets | Generated samples include at least email, bearer token, env secret, internal URL, IP | Medium |
| PBT-005 | PBT-08 | PBT failures are reproducible | Fixed seed configuration | Run property suite twice | Same failing seed can be replayed if a failure occurs | Low |

## API Integration Test Cases

| ID | Requirement | Endpoint | Request | Expected Result | Priority |
|---|---|---|---|---|---|
| API-001 | FR-002, FR-003 | `POST /api/scan` | `{ "text": DEMO_PROMPT }` | 200 JSON with normalized findings and available transforms | High |
| API-002 | FR-010 | `POST /api/mask` | Text, findings, `mode: "placeholder"`, `scope: "all"` | 200 JSON with transformedText, applied previews, refreshed findings | High |
| API-003 | FR-009 | `POST /api/mask` | Same findings with `selected`, `same_type`, `all` | Each scope transforms only expected findings | High |
| API-004 | FR-016 | `POST /api/safe-review`, if retained | Body includes `originalText` | 400 safe JSON error; original text is not echoed | Medium |
| API-005 | FR-017 | `POST /api/safe-review`, if retained | Valid transformedText only | Deterministic riskLevel, summary, remainingConcerns, recommendation are returned | Low |
| API-006 | FR-020 | `POST /api/rules/generate` | Secret-like dummy example | Response blocks SDK path or returns warning/fallback metadata | High |
| API-007 | FR-021 | `POST /api/rules/generate` | `우리 회사 티켓 번호는 DEMO-2026-0001 형식입니다.` | Response includes rule, tests, warnings, falsePositiveRisk, falseNegativeRisk, generation metadata | High |
| API-008 | FR-022 | `POST /api/rules/preview` | Candidate rule and sample text | Response includes matched, transformedText, matches, warnings | High |
| API-009 | NFR-003, SECURITY-05 | All POST APIs | Invalid body shapes and too-long text | Safe 400/413 JSON errors with no stack traces | High |
| API-010 | Azure Addendum | `GET /api/health`, once implemented | No request body | Safe JSON status proves API is alive and does not leak secrets | Medium |
| API-011 | NFR-002 | All JSON APIs | Valid requests | Response includes `cache-control: no-store` where applicable | Medium |

## Frontend Integration Test Cases

| ID | Requirement | Title | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| FE-001 | FR-001 | Prompt input accepts demo text | Render app and inspect prompt textarea | Textarea exists and contains/accepts up to 10,000 chars | High |
| FE-002 | FR-001 | Prompt change resets scan state | Scan prompt, apply transform, edit prompt | Findings, selected finding, ignored IDs, applied choices, and review reset | High |
| FE-003 | FR-005 | Highlight preview renders detected findings | Click Scan | Risk values appear as highlighted/selectable spans or buttons | High |
| FE-004 | FR-006 | Findings panel displays required details | Click Scan | Each finding card shows severity, type, reason, value, transform controls, Apply, Ignore | High |
| FE-005 | FR-007 | Finding transform mode control works | Change a finding mode | Available UI updates according to selected mode | Medium |
| FE-006 | FR-008 | Depth control hides for placeholder | Select placeholder mode | Partial/full depth control is hidden or ignored | Medium |
| FE-007 | FR-009 | Scope control supports all scopes | Open finding scope selector | selected, same_type, all are available | Medium |
| FE-008 | FR-012 | Individual apply updates preview state | Click Apply on one finding | Finding card shows applied state and detection preview displays transformed value | High |
| FE-009 | FR-012 | Ignore updates state and warning | Click Ignore on one finding | Finding is marked ignored and status warns original value remains | High |
| FE-010 | FR-013 | Global Fix Bar applies all pending findings | Click Scan, choose global mode, click Apply All | All pending findings are applied and detection preview shows transformed values | High |
| FE-011 | FR-019 | Rule Builder asks for dummy examples | Open Custom Rules tab | UI warns not to enter real secrets/customer data | High |
| FE-012 | FR-021 | Rule generation metadata is visible | Click Generate Rule | UI shows source, engine, runtime, and SDK attempted/configured status | High |
| FE-013 | FR-022 | Rule preview displays transformed sample | Generate then preview rule | Preview shows matched status and transformed sample text | High |
| FE-014 | FR-023 | Rule approval is explicit | Generate rule but do not approve | Rule is not added to session until approval button is clicked | High |
| FE-015 | FR-024 | Approved custom rule affects next scan | Approve DEMO ticket rule and scan prompt | `ticket_id` appears in findings | High |
| FE-016 | FR-025 | Custom findings share built-in UX | Approved custom finding exists | Inspect finding card and Apply All behavior | Custom finding has same controls and transform behavior as built-ins | High |
| FE-017 | NFR-004 | Flow remains low friction without Safe Output | Run prompt scan, apply all, inspect preview, use custom rule flow | Primary actions are discoverable and status messages are concise | Medium |
| FE-018 | UOW-012 | Safe Output UI is absent | Render app and inspect tabs/buttons | No `세이프 아웃풋` tab, Safe Output Preview, Copy button, or frontend Safe Review button is visible | High |

## E2E Test Cases

| ID | Requirement | Scenario | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| E2E-001 | FR-001 through FR-006 | Scan and review demo prompt | Open app, click Scan | Findings and detection preview appear for built-in risks | High |
| E2E-002 | FR-007 through FR-013 | Apply all placeholders inline | Click Scan, set global placeholder, click Apply All | Detection preview shows `[EMAIL]`, `[URL]`, `[BEARER_TOKEN]`, `API_KEY=[SECRET]`, and `[IP_ADDRESS]` | High |
| E2E-003 | UOW-012 | Safe Output path is removed | Inspect workspace tabs and primary actions | No Safe Output tab, Copy action, or frontend Safe Review action appears | High |
| E2E-004 | FR-019 through FR-025 | Custom Rule Builder journey | Generate DEMO ticket rule, preview, approve, rescan, apply all | `ticket_id` is found and transformed with built-in findings in detection preview | High |
| E2E-005 | FR-026 adjusted | Full non-Safe-Output demo flow | Run create rule -> scan -> review findings -> apply all -> inspect detection preview | Flow completes without console errors or broken UI | High |
| E2E-006 | NFR-005 | Narrow viewport smoke test | Open app at mobile width and run Scan | Controls remain reachable and text does not overlap | Medium |
| E2E-007 | FR-001 | Prompt edit clears prior results | Scan, apply all, edit prompt | Detection preview and findings reset until user scans again | Medium |

## Security and Trust Test Cases

| ID | Requirement | Title | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| SEC-001 | FR-012, NFR-002 | Ignored findings remain visible and local | Ignore a finding after Scan | UI warns original value remains; no Safe Output/Safe Review call is required | High |
| SEC-002 | FR-016, NFR-002 | Safe Review API never accepts original prompt if retained | POST `originalText` to safe-review | Safe error response; original text not echoed | Medium |
| SEC-003 | FR-020, SECURITY-11 | Rule Builder handles real-secret-like input safely | Submit secret-like example to rule generation | SDK call is blocked or warning/fallback path is returned | High |
| SEC-004 | NFR-003, SECURITY-05 | Length limits are enforced | Submit prompt > 10,000 chars and rule pattern > 500 chars | API returns safe 413-style validation response | High |
| SEC-005 | NFR-002, SECURITY-03 | No raw prompt logging | Review API handlers and services | No `console.log` or structured logs include raw prompt/request bodies | High |
| SEC-006 | NFR-002 | No prompt persistence introduced | Search code for localStorage/sessionStorage/DB prompt writes | No long-term or browser persistent raw prompt storage is introduced | High |
| SEC-007 | SECURITY-09, SECURITY-15 | Invalid JSON returns safe error | Send invalid JSON/body types to APIs | No stack trace, internal path, token, or prompt content appears | High |
| SEC-008 | SECURITY-04 | Deployment security headers configured or documented | Inspect `public/staticwebapp.config.json` and README/addendum | Required headers exist or deferral is documented | Medium |
| SEC-009 | SECURITY-10 | Dependency audit is clean | Run `npm audit --audit-level=moderate` | 0 moderate-or-higher vulnerabilities or documented mitigation | Medium |

## Performance Test Cases

| ID | Requirement | Title | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| PERF-001 | NFR-001 | Demo prompt scan under 1 second | Time `scanText({ text: DEMO_PROMPT })` locally and deployed scan API | Demo scan completes under 1 second in normal conditions | Medium |
| PERF-002 | NFR-001 | 10,000 char validation path stays responsive | Submit max-length allowed prompt | Request completes without UI freeze or server timeout | Low |

## Accessibility Test Cases

| ID | Requirement | Title | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| A11Y-001 | NFR-005 | Main controls have accessible labels | Inspect prompt input, tabs, Scan, Apply All, finding controls | Controls have labels, roles, or visible text | Medium |
| A11Y-002 | NFR-005 | Keyboard navigation reaches core actions | Use keyboard only through Scan, findings, tabs, rule builder | Focus order is usable and active tab state is perceivable | Medium |
| A11Y-003 | NFR-005 | Status updates are understandable | Trigger scan/apply/error states | Status text is visible and concise; future improvement may add `aria-live` | Low |

## Deployment Readiness Test Cases

| ID | Requirement | Title | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| DEP-001 | NFR-008 | Build frontend and API for Azure | Run `npm run build` and `npm run build:api` | Both builds pass | High |
| DEP-002 | NFR-008 | Static Web Apps config excludes API from fallback | Inspect `public/staticwebapp.config.json` | `/api/*` is excluded from SPA navigation fallback and Node 20 API runtime is configured | High |
| DEP-003 | Azure Addendum | Health endpoint exposes safe status | Call `GET /api/health` after implementation | Safe JSON status proves API is alive without leaking secrets | Medium |

## Maintainability Test Cases

| ID | Requirement | Title | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| MAINT-001 | NFR-006 | Core modules stay separated | Inspect `src/lib` and `api/src` imports | Scan, transform, validation, rule preview, rule generation, and API handlers remain separated | Medium |
| MAINT-002 | UOW-012 | Dead Safe Output frontend code is removed | Search frontend code for Safe Output UI symbols | Removed UI symbols are absent or explicitly marked for compatibility if retained | High |

## Manual Smoke Test Script

1. Use Node 20.19.0 or newer.
2. Run `npm ci`.
3. Run `npm run typecheck`.
4. Run `npm test`.
5. Run `npm run build`.
6. Run `npm run build:api`.
7. Start the app with `npm run dev`.
8. Open `http://127.0.0.1:5173/`.
9. Confirm there is no Safe Output tab or Copy/Safe Review UI action.
10. Click `Scan` on the default demo prompt.
11. Verify built-in findings appear.
12. Set global mode to placeholder and click `모두 적용`.
13. Verify transformed placeholder values appear in the detection preview.
14. Verify the original prompt textarea remains unchanged.
15. Generate, preview, and approve the default DEMO ticket rule.
16. Scan again and verify `ticket_id` appears.
17. Apply all placeholders and verify `[TICKET_ID]` appears in detection preview.

## Automated Command Set

```bash
nvm use 20.19.0
npm ci
npm run typecheck
npm test
npm run build
npm run build:api
npm audit --audit-level=moderate
```

Expected result:

- Typecheck passes.
- Unit and property-based tests pass.
- Frontend production build passes.
- API TypeScript build passes.
- Dependency audit has no moderate-or-higher vulnerabilities or has documented mitigation.
- Frontend no longer exposes Safe Output tab, Copy action, or Safe Review UI action.

## Exit Criteria

The non-Safe-Output requirements scope is test-complete when:

- All High-priority unit, API, frontend, E2E, and security cases pass or have accepted deferrals.
- The adjusted demo flow passes locally without Safe Output.
- Azure deployment readiness checks pass.
- Custom Rule Builder works through either live Copilot SDK or clear fallback diagnostics.
- No test evidence shows raw original prompts being stored, logged, echoed in errors, or sent to AI models for detection.
