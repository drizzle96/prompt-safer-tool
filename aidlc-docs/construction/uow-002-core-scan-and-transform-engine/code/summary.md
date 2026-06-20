# UOW-002 Code Summary

## Created Application Files

- `src/lib/rules.ts`
- `src/lib/scan.ts`
- `src/lib/transform.ts`
- `src/lib/core.test.ts`
- `src/lib/core.property.test.ts`

## Implemented Behavior

- Built-in rules for email, phone, URL/internal URL, IPv4-like address, bearer token, API key-like, generic secret assignment, and `.env` style secret.
- Conservative internal URL classification.
- Deterministic overlap resolution.
- Transform preview generation.
- Selected, same_type, and all scope transform application.
- End-to-start patching for index shift safety.
- Example tests and partial property-based tests.

## Verification

- `npm run typecheck`: passed.
- `npm test`: passed, 2 test files and 7 tests.
- `npm run build`: passed.
- Editor diagnostics for `src/lib`: no errors found.