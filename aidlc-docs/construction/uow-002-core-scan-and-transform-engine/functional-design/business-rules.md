# Business Rules - UOW-002 Core Scan and Transform Engine

## Detection Rules

- Email uses the PRD email regex and medium severity.
- Phone-like values use the PRD phone regex and medium severity.
- URL uses the PRD URL regex and medium severity by default.
- Internal URL uses URL detection plus conservative hostname classification and high severity.
- IPv4-like values use the PRD IPv4-like regex and medium severity.
- Bearer token uses the PRD bearer token regex and high severity.
- API key-like values use case-insensitive key/secret/token assignment detection and high severity.
- Generic token-like values are high severity when they match secret-like assignments not captured by more specific rules.
- `.env` style secret is high severity and line-oriented.

## Transform Recommendation Rules

- Email: masking partial.
- Phone: masking partial.
- URL: dummy partial.
- Internal URL: placeholder full.
- IPv4-like address: masking partial.
- Bearer token: placeholder full.
- API key-like: placeholder full.
- Generic token-like: placeholder full.
- `.env` secret: placeholder full.
- Custom rule: use the rule default transform.

## Transform Output Rules

- Placeholder uses `[TYPE]` style tokens, with known names such as `[EMAIL]`, `[URL]`, `[INTERNAL_URL]`, `[IP_ADDRESS]`, `[BEARER_TOKEN]`, and `[API_KEY]`.
- Full masking returns `*` repeated to the original value length.
- Partial masking keeps minimal context only where useful.
- Dummy transforms return non-sensitive example values.
- Placeholder ignores depth.

## Scope Rules

- `selected` applies only provided finding IDs.
- `same_type` applies all pending findings with the same type as the selected finding IDs.
- `all` applies all pending findings.
- Ignored and already applied findings are not transformed again.

## Error Rules

- Invalid transform mode, depth, scope, or finding ID fails closed.
- Findings with invalid ranges are ignored or rejected rather than patched.
- Core logic must not log raw text.