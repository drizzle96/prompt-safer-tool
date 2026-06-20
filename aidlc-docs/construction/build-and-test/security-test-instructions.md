# Security Test Instructions

## Manual Security Checks

- Confirm Safe Review request code sends `transformedText`, not original prompt text.
- Confirm API handlers do not log raw request bodies.
- Confirm `api/local.settings.json` is gitignored.
- Confirm invalid API body shapes return safe JSON errors.
- Confirm Rule Builder warns users to use dummy examples.
- Confirm generated rules require approval before session activation.
- Confirm `GET /api/health` does not expose secrets, tokens, raw prompts, stack traces, or internal paths.
- Confirm `public/staticwebapp.config.json` includes Static Web Apps security headers or a documented deferral.

## Dependency Check

```bash
npm audit
```

Expected result: 0 vulnerabilities for the current MVP dependency set.