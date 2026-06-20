# NFR Requirements - UOW-002 Core Scan and Transform Engine

## Performance

- Demo prompt scan should complete well under 1 second in local and deployed MVP environments.
- Core functions should avoid unnecessary async work and external calls.
- Regex rules should be bounded and deterministic enough for MVP prompt length limits.

## Security and Privacy

- Core scan and transform functions must not log raw prompt text.
- Core engine must not call AI or external services.
- Full masking and placeholder transforms must remove the original value from transformed output for that finding.
- Invalid ranges or transform parameters must fail closed.

## Reliability

- Overlap resolution must be deterministic.
- Transform application must patch from the end of the string.
- Core functions should handle empty input, no findings, and ignored/applied statuses safely.

## Testability

- Core functions must be pure or mostly pure.
- Example-based tests must cover the PRD demo prompt.
- Partial PBT must use `fast-check`.
- PBT must include domain-specific generators for prompt snippets, findings, and transform requests.

## Maintainability

- Built-in rules should be declared in one module.
- Transform strategies should be separated enough to add new finding types later.
- Custom rules should use the same scan pipeline as built-in rules.

## NFR Compliance

| Rule | Status | Notes |
|---|---|---|
| SECURITY-03 | Applicable | No prompt logging in core. |
| SECURITY-05 | Supported | Validation helpers and API handlers enforce request constraints; core still guards ranges. |
| SECURITY-11 | Applicable | Security-sensitive logic lives in core engine. |
| SECURITY-15 | Applicable | Invalid transform input fails closed. |
| PBT-03 | Applicable | Invariant tests required. |
| PBT-07 | Applicable | Domain-specific generators required. |
| PBT-08 | Applicable | `fast-check` shrinking and seeds used by framework. |
| PBT-09 | Satisfied | `fast-check` selected and installed. |