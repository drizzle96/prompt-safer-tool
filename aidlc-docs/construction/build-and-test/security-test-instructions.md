# Security Test Instructions

## Manual Security Checks

- Confirm Safe Review request code sends `transformedText`, not original prompt text.
- Confirm API handlers do not log raw request bodies.
- Confirm `api/local.settings.json` is gitignored.
- Confirm invalid API body shapes return safe JSON errors.
- Confirm Rule Builder warns users to use dummy examples.
- Confirm generated rules require approval before session activation.

## Dependency Check

```bash
npm audit
```

Expected result: 0 vulnerabilities for the current MVP dependency set.