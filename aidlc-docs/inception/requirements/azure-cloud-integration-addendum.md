# Additional Feature Requirements - Azure Cloud Integration

## Purpose

This addendum keeps the main PRD concise while documenting low-risk Azure cloud integration improvements for judging criterion 3, "Azure AI & Cloud Integration." The goal is not to force Azure OpenAI or Microsoft Foundry into an unclear use case. The goal is to show that Azure is a meaningful runtime layer for Safe Prompt Guard.

## Positioning

Safe Prompt Guard should present Azure as the privacy-preserving serverless processing layer for the product:

- Azure Static Web Apps hosts the React/Vite frontend.
- Azure Functions runs the production API surface.
- The API performs deterministic scan, mask, custom rule preview, safe review, and runtime diagnostics.
- Original prompts are processed per request only. They are not stored, cached, or logged as raw prompt data.
- Azure OpenAI or Microsoft Foundry remains optional. It is not required for the core safety workflow.

Recommended judging statement:

> Azure is not used as a decorative model call. It is the serverless privacy boundary that processes prompt-safety actions without storing raw prompts.

## Functional Requirements

### AZ-FR-001 Health Diagnostics Endpoint

The backend should expose `GET /api/health` so automated judging can confirm the deployed Azure Functions API is alive.

The response should be safe to expose publicly and must not include secrets, tokens, raw prompts, internal file paths, or stack traces.

Suggested response shape:

```json
{
  "service": "safe-prompt-guard-api",
  "status": "ok",
  "runtime": "azure-functions-node20",
  "endpoints": [
    "/api/scan",
    "/api/mask",
    "/api/rules/generate",
    "/api/rules/preview",
    "/api/safe-review"
  ],
  "privacy": {
    "storesPrompts": false,
    "logsRawPrompts": false,
    "safeReviewAcceptsOriginalText": false
  },
  "copilot": {
    "generationMode": "auto",
    "sdkConfigured": true
  }
}
```

### AZ-FR-002 Azure API Evidence in Documentation

The README should include a short "Azure Cloud Integration" section near the top with:

- Submission URL placeholder or deployed URL.
- Azure Static Web Apps frontend statement.
- Azure Functions backend statement.
- Production API routes.
- `/api/health` verification command.
- Privacy statement: prompts are processed per request, not stored, and not logged raw.

### AZ-FR-003 Static Web App Security Headers

The deployed frontend should configure security headers through `public/staticwebapp.config.json` where practical:

- `Content-Security-Policy`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: no-referrer`
- `Permissions-Policy`

These headers support both Azure cloud integration and Responsible AI, Security & Trust scoring.

### AZ-FR-004 Cloud API Privacy Contract

Every production API response should preserve the existing privacy contract:

- Do not return raw request bodies in errors.
- Use `cache-control: no-store` for JSON API responses.
- Reject `originalText` in Safe Review requests.
- Enforce prompt and rule input length limits.
- Keep generated custom rules session-only unless a future storage feature is explicitly added.

### AZ-FR-005 Optional Azure AI Provider Statement

The product should not claim Azure OpenAI or Microsoft Foundry as mandatory unless a live provider is configured. Documentation and UI diagnostics should distinguish:

- Core Azure cloud integration: Static Web Apps + Functions.
- Core AI integration: Copilot SDK Custom Rule Builder.
- Optional model provider: Azure OpenAI or Microsoft Foundry for Copilot SDK provider routing or future safe-output review.

## Acceptance Criteria

1. A deployed app URL serves the frontend from Azure Static Web Apps.
2. `GET /api/health` returns a safe JSON status payload from Azure Functions.
3. `POST /api/scan` works from the deployed URL.
4. `POST /api/rules/preview` works from the deployed URL.
5. API responses include `cache-control: no-store`.
6. The Static Web Apps config includes security headers or documents why any header is deferred.
7. The README explains that Azure Functions is the serverless privacy boundary for scan, mask, rule preview, safe review, and diagnostics.

## Out of Scope

- Adding Cosmos DB or Azure Storage for prompt persistence.
- Sending raw original prompts to Azure AI services for detection.
- Making Azure OpenAI or Microsoft Foundry mandatory for the MVP.
- Adding authentication or organization policy management during this addendum.
