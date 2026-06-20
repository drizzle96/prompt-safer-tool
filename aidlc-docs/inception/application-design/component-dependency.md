# Component Dependencies - Safe Prompt Guard

## Dependency Matrix

| Component | Depends On | Notes |
|---|---|---|
| Web App Shell | Prompt Guard UI, Custom Rule Builder UI, API Client | Owns top-level session state. |
| Prompt Guard UI | API Client, shared types | Does not implement scan/mask business logic. |
| Custom Rule Builder UI | API Client, shared types | Adds approved rules to session state only. |
| API Client | Shared types | Wraps HTTP calls and safe errors. |
| API Functions | Services, validation helpers, shared types | Azure Functions-compatible boundary. |
| Scan Service | Core Detection Engine | No LLM calls. |
| Mask Service | Core Detection Engine | Applies transforms and refreshes findings. |
| Rule Builder Service | Core Detection Engine, Copilot Adapter, fallback generator | Pre-scans input before generation. |
| Rule Preview Service | Core Detection Engine | Validates and applies custom rules. |
| Safe Review Service | Safe Review Adapter, shared types | Receives transformed text only. |
| Test Suite | Core Detection Engine, services | Covers example tests and partial PBT. |

## Communication Patterns

- UI communicates with backend through typed API client functions.
- API functions call services, not UI modules.
- Services call pure core functions where possible.
- Copilot SDK is isolated behind backend adapter contract.
- Safe Review AI adapter is isolated behind review service contract.

## Data Flow Summary

### Scan Flow
Prompt text and session rules go from UI to `/api/scan`. The scan service calls the core engine and returns findings. The UI highlights findings and updates the panel.

### Mask Flow
The UI sends text, findings, mode, depth, and scope to `/api/mask`. The mask service applies transformations from the end of the text and returns transformed text plus refreshed findings.

### Custom Rule Flow
The UI sends a dummy example to `/api/rules/generate`. The service pre-scans the input, calls the Copilot adapter or fallback, validates the candidate, and returns a previewable rule. The user must approve it before it enters session rules.

### Safe Review Flow
The UI sends transformed text and metadata to `/api/safe-review`. The service never receives the original prompt. It returns risk level, summary, remaining concerns, and recommendation.

## Coupling Constraints

- UI must not import server-only Copilot SDK modules.
- Core scan and transform logic must not depend on React or Azure Functions runtime.
- API handlers must not log raw request bodies.
- Safe Review must not accept original prompt text in its request contract.