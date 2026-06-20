# Business Logic Model - UOW-002 Core Scan and Transform Engine

## Core Pipeline

1. **Rule Collection**: Load enabled built-in rules and approved session custom rules.
2. **Match Extraction**: Execute each rule against the source text and produce raw finding candidates.
3. **Finding Normalization**: Attach id, rule id, type, value, start/end range, severity, reason, status, suggested transform, and available transforms.
4. **Overlap Resolution**: Sort by severity, match length, then rule order; keep non-overlapping accepted findings.
5. **Transform Preview**: Build masking, dummy, and placeholder previews for each finding.
6. **Transform Application**: Select target findings by selected, same_type, or all scope and patch from the end of the text.
7. **Refresh Scan**: Re-scan transformed text after mask operations where required.

## Main Algorithms

### Overlap Resolution

Accepted findings must not overlap. Priority order:
1. Higher severity wins.
2. Longer match wins.
3. Earlier rule order wins.
4. Earlier text position wins as final deterministic tie-breaker.

### Transform Application

Transforms are applied from highest `start` index to lowest `start` index. This prevents earlier replacements from shifting later ranges.

### URL Classification

Use conservative internal URL classification. A URL is internal when hostname includes one of:
- `internal`
- `local`
- `corp`
- `prod`
- `dev`
- `stg`
- `stage`
- `private`

Internal URLs default to high severity and placeholder/full replacement recommendation.

## Testable Properties

- Accepted findings do not overlap.
- Every finding has `start < end`.
- Every finding value equals `text.slice(start, end)` before transformation.
- Full masking and placeholder transforms do not contain the original finding value.
- Applying patches from end to start preserves text outside target ranges.