# Components - Safe Prompt Guard

## Component C1: Web App Shell

Purpose: Host the React/Vite single-page experience and coordinate page-level state.

Responsibilities:
- Render header, tab or section navigation, main Prompt Guard workspace, Custom Rule Builder, and output/review areas.
- Keep session custom rules, selected finding, transformed text, ignored findings, and review state in client state.
- Call API client methods rather than embedding business logic in UI components.

Interfaces:
- User events from buttons, inputs, segmented controls, and finding cards.
- API client calls for scan, mask, rule generation, rule preview, and safe review.

## Component C2: Prompt Guard UI

Purpose: Provide the spell-checker-like prompt sanitization workflow.

Responsibilities:
- Capture original prompt text.
- Display highlighted findings.
- Provide Global Fix Bar, Findings Panel, transform controls, Apply, Ignore, and Copy.
- Display Safe Output Preview and Safe Review output.

Interfaces:
- Receives normalized findings and transform previews.
- Emits scan, apply, ignore, safe review, and copy actions.

## Component C3: Custom Rule Builder UI

Purpose: Let users generate, preview, approve, and use session custom rules.

Responsibilities:
- Warn users not to enter real secrets or customer data.
- Send dummy examples for pre-scan and rule generation.
- Display generated regex, replacement, severity, default transform, tests, and warnings.
- Preview candidate rules and add approved rules to session state.

Interfaces:
- Calls rule generation and preview API client methods.
- Emits approved `Rule` objects to the app shell.

## Component C4: API Client

Purpose: Provide typed frontend access to backend API functions.

Responsibilities:
- Wrap `/api/scan`, `/api/mask`, `/api/rules/generate`, `/api/rules/preview`, and `/api/safe-review`.
- Normalize safe error handling for the UI.
- Avoid logging raw prompt text.

Interfaces:
- TypeScript request and response contracts shared with API functions where practical.

## Component C5: Core Detection and Transform Engine

Purpose: Provide deterministic, testable scan and transform logic.

Responsibilities:
- Define built-in rules.
- Execute scans against built-in and custom rules.
- Resolve overlaps by severity, match length, then rule order.
- Generate transform previews.
- Apply transforms by selected, same_type, or all scope.
- Re-scan transformed text where needed.

Interfaces:
- Pure TypeScript functions used by API handlers and tests.

## Component C6: API Functions

Purpose: Expose MVP backend behavior through Azure Functions-compatible HTTP endpoints.

Responsibilities:
- Validate request bodies and length limits.
- Call core scan/transform/rule preview/review services.
- Return safe error responses.
- Avoid raw prompt logging.

Interfaces:
- HTTP endpoints under `/api/*`.

## Component C7: Rule Builder Service and Copilot Adapter

Purpose: Generate custom rule candidates while isolating Copilot SDK integration.

Responsibilities:
- Pre-scan dummy examples before generation.
- Call Copilot SDK when configured and available.
- Provide deterministic fallback under the same contract if SDK integration is unavailable.
- Return rule candidate, test cases, and warnings.

Interfaces:
- `generateRuleCandidate` service method.
- Adapter contract hidden behind backend API.

## Component C8: Safe Review Service

Purpose: Produce final residual-risk guidance using transformed text only.

Responsibilities:
- Accept transformed text, applied transforms, and ignored metadata.
- Return deterministic MVP review response initially.
- Keep an Azure OpenAI / Microsoft Foundry adapter boundary for later integration.
- Never accept or forward original prompt text.

Interfaces:
- `reviewTransformedText` service method.

## Component C9: Test Suite

Purpose: Verify core behavior and implementation safety.

Responsibilities:
- Example-based tests for demo prompt and API behavior.
- Partial property-based tests with `fast-check` for core scan/transform invariants.
- Ensure no original values remain after placeholder/full masking where applicable.