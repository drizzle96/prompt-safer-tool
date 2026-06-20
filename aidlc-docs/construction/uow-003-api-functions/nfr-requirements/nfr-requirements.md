# NFR Requirements - UOW-003 API Functions

## Security

- Validate all request bodies before processing.
- Do not log raw request bodies or prompt text.
- Safe Review must receive transformed text only.
- Error responses must be generic and JSON-based.

## Performance

- Endpoints should remain synchronous and fast for MVP prompt length.
- Avoid model calls in scan and mask.

## Maintainability

- Handlers should be thin and call shared services or core modules.
- Validation helpers should be reused across handlers.

## Compatibility

- Use Azure Functions v4 programming model with `@azure/functions`.