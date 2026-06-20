# Business Logic Model - UOW-005 Custom Rule Builder and Copilot Adapter

## Rule Builder Flow

1. User enters a dummy example.
2. Input is pre-scanned with deterministic rules.
3. If secret-like values are found, generation is blocked or warned.
4. Backend adapter attempts Copilot SDK rule generation.
5. If SDK is unavailable, deterministic fallback returns a candidate.
6. User previews the candidate rule.
7. User approves rule into browser session state.
8. Subsequent scans include the approved rule.

## Adapter Contract

The UI and API use one contract regardless of generation source:
- rule
- tests
- warnings
- falsePositiveRisk
- falseNegativeRisk
- source: `copilot` or `fallback`

## Business Rules

- Actual secrets should not be used in Rule Builder.
- Generated rules are never auto-applied.
- Approved custom rules are session-only.
- Copilot SDK is isolated in backend adapter code.