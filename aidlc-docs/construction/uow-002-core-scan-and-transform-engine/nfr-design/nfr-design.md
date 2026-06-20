# NFR Design - UOW-002 Core Scan and Transform Engine

## Performance Design

- Keep scan synchronous and in-memory for MVP prompt size.
- Compile regex definitions once through static rule declarations.
- Avoid nested full-text rescans inside each individual rule.
- Re-scan only after batch mask application, not after every patch.

## Security Design

- Core functions accept strings and structured finding data only.
- Core functions do not perform logging.
- Full masking and placeholder transforms are treated as sensitive-value removal operations.
- Invalid range, invalid mode, invalid scope, or missing selected finding returns safe empty/no-op results or validation errors at service boundary.

## Validation Design

- API layer validates request shape.
- Core layer validates finding ranges before patching.
- Rule preview validates regex compilation and flags empty/broad matches in UOW-005.

## PBT Design

Use `fast-check` tests in UOW-002 for:
- Overlap resolution returns non-overlapping findings.
- Accepted finding ranges are valid and match the source slice.
- Placeholder and full masking do not contain original finding values.
- Applying transformations from end to start preserves untouched text segments.

Generator strategy:
- Generate safe prompt text snippets.
- Generate non-overlapping and overlapping finding ranges.
- Generate transform modes, depths, and scopes from enums.

## Maintainability Design

Recommended code modules:
- `src/lib/rules.ts`: built-in rules and severity recommendations.
- `src/lib/scan.ts`: scan pipeline and overlap resolution.
- `src/lib/transform.ts`: transform preview and transform application.
- `src/lib/core.test.ts`: example tests for demo and edge cases.
- `src/lib/core.property.test.ts`: partial PBT tests.

## Compliance Summary

| Rule | Status | Design Choice |
|---|---|---|
| SECURITY-03 | Compliant | Core has no logging side effects. |
| SECURITY-05 | Compliant | API validates shape; core guards ranges before patching. |
| SECURITY-11 | Compliant | Security-sensitive scan/transform logic isolated in core modules. |
| SECURITY-15 | Compliant | Invalid inputs fail closed. |
| PBT-03 | Compliant | Invariant properties identified. |
| PBT-07 | Compliant | Domain generator strategy documented. |
| PBT-08 | Compliant | `fast-check` provides shrinking and reproducibility. |
| PBT-09 | Compliant | `fast-check` selected. |