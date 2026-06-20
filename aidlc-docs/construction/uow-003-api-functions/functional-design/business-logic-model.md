# Business Logic Model - UOW-003 API Functions

## API Boundary Model

UOW-003 exposes core behavior through HTTP functions:

- `/api/scan`: validates text and custom rules, then returns findings.
- `/api/mask`: validates transform request, applies selected transforms, and returns transformed text.
- `/api/rules/preview`: validates a candidate rule and sample text, then returns match and transformed preview.
- `/api/safe-review`: accepts transformed text only and returns deterministic residual-risk guidance.

## Request Handling Pipeline

1. Parse JSON body.
2. Validate request shape and text length.
3. Call service/core function.
4. Return JSON response.
5. On invalid input, fail closed with a safe generic response.

## Business Rules

- Raw prompt text must not be logged.
- Safe Review must not accept an `originalText` field.
- Rule preview must not execute invalid regex patterns.
- All API responses must be JSON.
- Request validation belongs at the API boundary; core logic still protects against invalid ranges.