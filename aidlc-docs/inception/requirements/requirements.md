# Requirements - Safe Prompt Guard

## Intent Analysis

- **User Request**: 최신 `main` 브랜치에서 PRD 내용을 학습한 뒤 Safe Prompt Guard 구현을 시작한다.
- **Request Type**: New Project / New Feature
- **Scope Estimate**: System-wide greenfield MVP
- **Complexity Estimate**: Moderate to complex, because the MVP spans frontend UX, deterministic scan/mask APIs, session custom rules, Copilot SDK integration, Safe Review, Azure deployment readiness, and security constraints.
- **Requirements Depth**: Comprehensive enough for implementation planning, while staying practical for a hackathon MVP.

## Decisions From Verification Questions

| Area | Decision |
|---|---|
| MVP scope | Implement PRD priority 1 full scope first |
| Safe Review | Start with mock response and keep an Azure OpenAI / Foundry integration interface |
| Copilot SDK Rule Builder | Target real Copilot SDK rule generation integration |
| Security extension | Enabled as blocking constraints where applicable |
| Property-based testing | Partial enforcement for pure functions and serialization round-trips |
| Resiliency baseline | Disabled to prioritize judging criteria and demo velocity |

## Functional Requirements

### FR-001 Prompt Input
The app must provide a prompt input area where the user can paste up to 10,000 characters of text.

### FR-002 Deterministic Scan
The app must scan prompt text with deterministic rules before any AI model involvement.

Built-in detection must cover at least:
- email
- phone number
- URL and internal URL
- IPv4-like address
- bearer token
- API key-like values
- generic token-like values
- `.env` style secrets

### FR-003 Finding Model
Each finding must include id, rule id, type, value, start/end range, severity, reason, status, suggested transform, and available transforms.

### FR-004 Overlap Handling
When findings overlap, the scanner must keep one primary finding using severity, match length, and rule order priority.

### FR-005 Highlight Preview
The UI must show detected risks inline or in a highlight preview that resembles a spell checker workflow.

### FR-006 Findings Panel
The UI must show a findings panel with finding type, severity, reason, current value, preview, transform controls, Apply, and Ignore.

### FR-007 Transform Modes
The app must support three transform modes:
- masking
- dummy data
- placeholder

### FR-008 Transform Depth
Masking and dummy data transforms must support partial and full depth. Placeholder must behave as full replacement.

### FR-009 Apply Scope
The app must support selected, same_type, and all apply scopes.

### FR-010 Mask API
The backend must expose `/api/mask` to apply selected transforms and return transformed text, applied transform previews, and refreshed findings.

### FR-011 Index Shift Safety
Transform application must patch findings from the end of the text toward the beginning to avoid index shift errors.

### FR-012 Apply and Ignore
The user must be able to apply or ignore each finding. Ignored findings remain in the output and must be represented in Safe Review context.

### FR-013 Global Fix Bar
The UI must provide a Global Fix Bar for default transform mode, depth where applicable, finding count, and Apply All.

### FR-014 Safe Output Preview
The UI must show the transformed prompt and keep it copyable.

### FR-015 Copy Result
The app must provide a copy action for the transformed prompt and show a success state.

### FR-016 Safe Review API
The backend must expose `/api/safe-review` that accepts only transformed text and metadata, never the original prompt.

### FR-017 Safe Review Mock First
Safe Review must initially return a deterministic mock-style response while keeping an adapter boundary for later Azure OpenAI / Microsoft Foundry integration.

### FR-018 Safe Review UI
The UI must show risk level, summary, remaining concerns, and recommendation. It must disclose that Safe Review is not a final security guarantee.

### FR-019 Custom Rule Builder Input
The app must provide a Custom Rule Builder area where users enter dummy examples, not real secrets.

### FR-020 Rule Builder Pre-Scan
Custom Rule Builder input must be scanned with built-in rules before rule generation. Secret-like or personal data-like input must trigger a warning or block.

### FR-021 Copilot SDK Rule Generation
The Rule Builder must target real Copilot SDK integration for generating regex rule candidates, replacement placeholders, severity, default transform, test cases, and false positive/false negative notes.

### FR-022 Rule Preview API
The backend must expose `/api/rules/preview` to validate generated or edited rules against sample text.

### FR-023 Custom Rule Approval
Generated rules must not be applied automatically. The user must approve a previewed rule before it is added to the current session.

### FR-024 Session Custom Rules
Approved custom rules must be stored in browser session state and included in subsequent scans.

### FR-025 Unified Finding UX
Custom rule findings must use the same highlight, panel, transform, Apply All, Ignore, and Safe Review flows as built-in findings.

### FR-026 Demo Flow
The app must support the PRD demo flow: create ticket rule, scan demo prompt, partially mask email, placeholder bearer token, apply placeholders to remaining findings, run Safe Review, and copy output.

## API Requirements

| Endpoint | Requirement |
|---|---|
| `POST /api/scan` | Return findings from deterministic built-in and session custom rules |
| `POST /api/mask` | Apply selected transforms with selected/same_type/all scope |
| `POST /api/rules/preview` | Test a rule against sample text and return matches, transformed text, and warnings |
| `POST /api/safe-review` | Review transformed text only and return risk summary fields |

## Non-Functional Requirements

Additional Azure cloud integration requirements are tracked separately in `aidlc-docs/inception/requirements/azure-cloud-integration-addendum.md` to keep this core requirements document focused on the MVP baseline.

### NFR-001 Performance
The app should scan the demo prompt in under 1 second in a local browser and deployed MVP environment.

### NFR-002 Privacy
Original prompts must not be sent to LLMs, stored in a database, or written to long-term logs.

### NFR-003 Security
All API inputs must be validated with explicit type, length, and format checks. Sensitive values must not be logged.

### NFR-004 UX
The primary workflow must be usable as Paste -> Scan -> Fix -> Safe Review -> Copy, with low friction for voice-coding demo conditions.

### NFR-005 Accessibility
Interactive controls must have readable labels, keyboard focus states, and sufficient contrast.

### NFR-006 Maintainability
Scan, transform, preview, and Safe Review logic must be separated into reusable modules shared by API handlers and tests where practical.

### NFR-007 Testability
Core scan and transform functions must be pure or mostly pure so they can be tested independently from UI and API transport.

### NFR-008 Deployment Readiness
The project structure must be compatible with Azure Static Web Apps and Azure Functions.

## Security Requirements

The Security Baseline extension is enabled. Applicable requirements for this MVP are:

| Security Rule | Applicability | Requirement |
|---|---|---|
| SECURITY-03 | Applicable | Do not log prompts, secrets, tokens, PII, or raw request bodies. Use structured safe logs only if logging is added. |
| SECURITY-04 | Applicable for deployed web app | Configure or document required HTTP security headers for Azure Static Web Apps deployment. |
| SECURITY-05 | Applicable | Validate all API request bodies and enforce text length limits. |
| SECURITY-09 | Applicable | Production errors must not expose stack traces or internal paths. |
| SECURITY-10 | Applicable | Use lock files and trusted npm packages. Include dependency audit guidance. |
| SECURITY-11 | Applicable | Keep security-sensitive scan/transform/review logic isolated and consider misuse cases such as pasted real secrets in Rule Builder. |
| SECURITY-15 | Applicable | API handlers must fail closed and return safe user-facing errors. |
| SECURITY-01, SECURITY-02, SECURITY-06, SECURITY-07, SECURITY-08, SECURITY-12, SECURITY-13, SECURITY-14 | N/A for MVP unless added infrastructure/auth/storage requires them | No database, authentication system, custom IAM, load balancer, CDN, or mutable critical data store is planned in the MVP. Re-evaluate if these are introduced. |

No blocking security finding is present in the requirements document because applicable security constraints are explicitly captured as requirements.

## Property-Based Testing Requirements

PBT is partially enabled. Enforced rules are PBT-02, PBT-03, PBT-07, PBT-08, and PBT-09.

| PBT Rule | Applicability | Requirement |
|---|---|---|
| PBT-02 | Applicable where round-trip or serialization helpers exist | Add round-trip PBT for serialization-like helpers if introduced. |
| PBT-03 | Applicable | Add invariant PBT for scan/mask/transform functions, such as no applied original secret remains after placeholder/full masking. |
| PBT-07 | Applicable | Use domain-specific generators for findings, rules, transform modes, and prompt snippets. |
| PBT-08 | Applicable | Configure PBT with reproducible seeds and shrinking enabled. |
| PBT-09 | Applicable | Use `fast-check` for TypeScript property-based tests. |

Advisory PBT rules may be documented later, but only the partial set above is blocking.

## Acceptance Criteria

1. The app can run locally as a web app.
2. The app can scan the PRD demo prompt and find built-in risks.
3. The app can add a session custom ticket rule and include it in scan results.
4. The user can apply selected, same_type, and all transforms.
5. The user can choose masking, dummy, and placeholder transforms.
6. Partial/full variants work for masking and dummy transforms.
7. The transformed output can be copied.
8. Safe Review runs on transformed text only and warns about remaining concerns.
9. Ignored findings are surfaced in Safe Review context.
10. API handlers validate inputs and avoid logging raw prompt content.
11. Core scan/transform logic has example-based tests plus partial PBT coverage.
12. The project remains ready for Azure Static Web Apps and Azure Functions deployment.

## Out of Scope For First Implementation Pass

- Login and user-specific persistence
- Database storage
- Browser extension
- Admin dashboard
- Complete enterprise DLP coverage
- Long-term logging of original prompt data
- Resiliency baseline enforcement beyond basic safe error handling

## Extension Compliance Summary

| Extension | Status | Notes |
|---|---|---|
| Security Baseline | Compliant for Requirements Analysis | Applicable rules are captured as requirements; N/A rules are marked with rationale. |
| Property-Based Testing | Compliant for Requirements Analysis | Partial enforcement mode is captured and `fast-check` is selected. |
| Resiliency Baseline | Disabled | Skipped by user-delegated decision based on judging criteria and MVP velocity. |