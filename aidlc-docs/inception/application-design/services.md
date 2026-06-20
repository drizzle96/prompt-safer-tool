# Services - Safe Prompt Guard

## Scan Service

Responsibilities:
- Validate scan text length and custom rule structure.
- Call the core engine to scan built-in and session custom rules.
- Return normalized findings and available transforms.

Orchestration:
1. API handler validates request.
2. Scan Service calls `scanText`.
3. Core engine resolves overlaps and builds previews.
4. API handler returns `ScanResponse`.

## Mask Service

Responsibilities:
- Validate transform mode, depth, scope, finding IDs, and finding ranges.
- Apply transformations with index-shift-safe patching.
- Re-scan transformed text when needed.

Orchestration:
1. API handler validates request.
2. Mask Service calls `applyTransforms`.
3. Core engine transforms selected findings.
4. Service refreshes findings for transformed text.
5. API handler returns `MaskResponse`.

## Rule Builder Service

Responsibilities:
- Pre-scan user-provided dummy examples.
- Reject or warn on real-secret-like input.
- Generate rule candidates through Copilot SDK adapter when available.
- Use deterministic fallback under the same response contract when SDK integration fails or is unconfigured.

Orchestration:
1. Frontend submits dummy example.
2. API pre-scans the input.
3. Service calls Copilot adapter or fallback generator.
4. Service validates the candidate rule.
5. UI previews and requires user approval.

## Rule Preview Service

Responsibilities:
- Validate custom regex safely.
- Apply candidate rule to sample text.
- Return warnings for empty, broad, or suspicious matches.

## Safe Review Service

Responsibilities:
- Accept transformed text only.
- Summarize remaining concerns from ignored findings and residual risky-looking patterns.
- Return a deterministic MVP response.
- Preserve adapter boundary for Azure OpenAI / Microsoft Foundry.

## Frontend State Service

Responsibilities:
- Keep prompt text, transformed text, findings, ignored findings, selected finding, transform options, generated rule, approved session rules, and review result.
- Avoid storing data outside browser session state.

## Error Handling Service Pattern

Responsibilities:
- Convert validation and runtime failures into safe UI/API messages.
- Avoid stack traces or raw user content in responses.
- Fail closed for invalid rule generation, invalid transforms, and unsafe inputs.