# Business Rules - UOW-003 API Functions

## Validation Rules

- `text`, `sampleText`, and `transformedText` must be strings.
- Prompt-like strings must be 10,000 characters or fewer.
- Rule examples must be 2,000 characters or fewer.
- `mode`, `depth`, and `scope` must be known enum values.
- Findings and custom rules must be arrays when provided.

## Endpoint Rules

### `/api/scan`
- Runs deterministic scan only.
- Returns `findings`.

### `/api/mask`
- Applies transforms through the core engine.
- Returns `transformedText`, `applied`, and refreshed `findings`.

### `/api/rules/preview`
- Compiles regex safely.
- Returns warnings for invalid, empty, or no-match cases.
- Uses replacement from the candidate rule.

### `/api/safe-review`
- Reviews transformed text only.
- If ignored findings exist, increases concern messaging.
- Returns `riskLevel`, `summary`, `remainingConcerns`, and `recommendation`.

## Safe Error Rules

- Do not expose stack traces.
- Do not echo raw prompt text in error messages.
- Return 400 for invalid JSON or invalid request shape.
- Return 413 for text length violations.