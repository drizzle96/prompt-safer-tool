# User Stories - Safe Prompt Guard

## Story Breakdown Approach

Stories use a hybrid approach:
- Main Prompt Guard flow is organized by user journey.
- Custom Rule Builder and API behavior are organized by feature.
- Security and test criteria are explicit acceptance criteria rather than long story prose.

## Epic E1: Prompt Guard Journey

### US-001 Paste and Scan Prompt
As a developer handling an operational incident, I want to paste a prompt and scan it for risky values, so that I can see what should be transformed before sending it to an AI tool.

Acceptance criteria:
- The user can paste text into the prompt input.
- The user can run Scan manually.
- The scanner detects email, phone, URL/internal URL, IPv4-like address, bearer token, API key-like, generic token-like, and `.env` style secret patterns.
- Scan is deterministic and does not call an LLM.
- API inputs enforce type and length validation.

### US-002 Review Inline Findings
As a user, I want risky values highlighted like spelling issues, so that I can review the prompt without learning a security scanner interface.

Acceptance criteria:
- Findings appear in a highlight preview or equivalent inline review area.
- Each finding shows type, severity, reason, and current status.
- Custom rule findings and built-in findings use the same visual treatment.

### US-003 Apply Individual Transform
As a user, I want to choose a transform for an individual finding, so that I can preserve useful context while hiding sensitive data.

Acceptance criteria:
- The user can choose masking, dummy data, or placeholder.
- Masking and dummy data support partial and full depth.
- Placeholder performs full replacement.
- The user sees a before/after preview before applying.

### US-004 Apply Findings by Scope
As a user, I want to apply a transform to one finding, the same type, or all findings, so that I can move quickly when many risks are present.

Acceptance criteria:
- Scope values selected, same_type, and all are supported.
- Apply All is available from the Global Fix Bar.
- Transform application patches from the end of the text to avoid index shift errors.
- After applying, remaining findings are refreshed.

### US-005 Ignore a Finding
As a user, I want to ignore a finding, so that I can keep intentional context in the final prompt.

Acceptance criteria:
- The user can mark a finding as ignored.
- Ignored findings remain in the output text.
- Safe Review receives ignored finding count or type metadata.
- The UI warns that ignored values remain in the prompt.

### US-006 Copy Safe Output
As a user, I want to copy the transformed prompt, so that I can paste it into my AI tool.

Acceptance criteria:
- The transformed prompt appears in Safe Output Preview.
- Copy action copies the transformed prompt.
- The UI shows a copy success state.

## Epic E2: Safe Review

### US-007 Run Safe Review on Transformed Text
As a user, I want Safe Review to check only the transformed prompt, so that the app can provide a final reminder without exposing original sensitive text to an AI model.

Acceptance criteria:
- `/api/safe-review` accepts `transformedText` and metadata only.
- Original prompt text is not sent to Safe Review.
- MVP can use a deterministic mock response.
- The code keeps an adapter boundary for later Azure OpenAI / Microsoft Foundry integration.
- Review output includes risk level, summary, remaining concerns, and recommendation.
- Review output states that it is assistive, not a final security guarantee.

## Epic E3: Custom Rule Builder

### US-008 Generate a Custom Rule From a Dummy Example
As a developer or operations user, I want to generate a custom rule from a dummy example, so that company-specific ticket IDs or system codes can be detected without manually writing regex.

Acceptance criteria:
- The UI warns users not to enter real secrets or customer data.
- Rule Builder input is pre-scanned with built-in rules.
- Secret-like input blocks or warns before rule generation.
- Copilot SDK integration is targeted for rule candidate generation.
- Generated rule output includes regex pattern, replacement, severity, default transform, test cases, and false positive/false negative notes.

### US-009 Preview and Approve a Custom Rule
As a user, I want to preview a generated custom rule before applying it, so that broad or unsafe regex patterns do not affect my scan results automatically.

Acceptance criteria:
- `/api/rules/preview` tests a rule against sample text.
- Preview returns matched status, transformed text, matches, and warnings.
- Rules are not added automatically.
- User approval is required before adding a rule to the current session.

### US-010 Use Session Custom Rules in Scan
As a user, I want approved custom rules to apply to the current session, so that my next scan finds organization-specific patterns.

Acceptance criteria:
- Approved rules are kept in browser session state.
- Subsequent scan includes approved custom rules.
- Custom findings appear in the Findings Panel and Apply All flow.

## Epic E4: API and Core Logic

### US-011 Use Scan API
As the frontend, I want `/api/scan` to return normalized findings, so that UI state can be driven from one consistent model.

Acceptance criteria:
- Request body is validated.
- Text length limit is enforced.
- Overlapping findings are resolved by severity, match length, then rule order.
- Response includes suggested and available transforms.
- Raw prompt content is not logged.

### US-012 Use Mask API
As the frontend, I want `/api/mask` to apply transformations consistently, so that individual and bulk actions use the same backend behavior.

Acceptance criteria:
- Request body is validated.
- Mode, depth, scope, finding IDs, and findings are checked before applying.
- Transform application is deterministic.
- Response includes transformed text and applied transform previews.
- Error responses are safe and do not expose stack traces.

## Cross-Cutting Acceptance Criteria

- Original prompts are not sent to LLMs.
- Original prompts are not persisted to a database.
- Raw prompt request bodies are not logged.
- The app uses a lock file and trusted npm dependencies.
- Core scan and transform logic has example-based tests.
- Partial PBT coverage uses `fast-check` for scan/transform invariants and domain-specific generators.
- The app structure remains compatible with Azure Static Web Apps and Azure Functions.