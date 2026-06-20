# NFR Design - UOW-005 Custom Rule Builder and Copilot Adapter

## Adapter Design

- Install `@github/copilot-sdk`.
- Create `api/src/services/ruleGenerate.ts`.
- Use dynamic import so local typecheck/build can succeed even when runtime credentials are unavailable.
- Keep fallback generator in the same service.

## Frontend Design

- Add Custom Rule Builder section below the Prompt Guard workspace.
- Generate candidate with API client fallback.
- Preview candidate rule.
- Approve rule into session custom rules.
- Pass session custom rules to scan and mask fallback requests.

## Security Design

- Call deterministic scan on example text before generation.
- If high-severity built-in findings exist, return a warning and fallback-safe response.
- UI copy warns users not to enter real secrets.