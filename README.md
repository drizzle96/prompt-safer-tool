# Safe Prompt Guard

Safe Prompt Guard is a web app that helps users sanitize prompts before sending them to AI tools.

It works like a spell checker for sensitive information. Instead of spelling mistakes, it highlights emails, API keys, bearer tokens, internal URLs, IP addresses, `.env` style secrets, and approved custom patterns.

## Demo Flow

1. Open the app.
2. Generate a custom ticket rule from `DEMO-2026-0001` in Custom Rule Builder.
3. Approve the generated rule into the current session.
4. Click Scan on the demo prompt.
5. Review highlighted findings.
6. Apply individual transforms or Apply All.
7. Run Safe Review.
8. Copy the safe prompt.

## Local Development

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173/`.

## Verification

```bash
npm run typecheck
npm test
npm run build
```

## API Endpoints

- `POST /api/scan`
- `POST /api/mask`
- `POST /api/rules/generate`
- `POST /api/rules/preview`
- `POST /api/safe-review`

In local Vite development, the frontend uses local deterministic fallback for demo continuity. In Azure Static Web Apps, the API routes are intended to be served by Azure Functions.

## Security Principles

- Original prompts are not sent to AI models.
- Sensitive information detection is deterministic rule-based.
- Safe Review receives transformed text only.
- Raw prompt request bodies are not logged.
- Generated custom rules are not applied automatically.
- Custom Rule Builder asks users to use dummy examples, not real secrets.
- Approved custom rules are session-only.

## Copilot SDK

The Custom Rule Builder includes a backend adapter for `@github/copilot-sdk`. The adapter attempts Copilot SDK generation and falls back to a deterministic generator under the same response contract when SDK runtime or credentials are unavailable.

To enable live Copilot SDK generation in an API runtime, configure one of these app settings:

- `COPILOT_GITHUB_TOKEN`: GitHub token used by the Copilot SDK runtime. Do not commit this value.
- `COPILOT_USE_LOGGED_IN_USER=true`: use a locally logged-in GitHub/Copilot user for local Functions testing.
- `COPILOT_RUNTIME_URL`: connect to an already-running Copilot runtime. Optionally pair with `COPILOT_RUNTIME_TOKEN`.
- `COPILOT_RUNTIME_PATH`: spawn a custom Copilot runtime executable path.
- `COPILOT_RULE_MODEL`: model used for rule generation. Default is `gpt-5.4-mini`.

To keep model inference on Azure OpenAI / Microsoft Foundry while still orchestrating through Copilot SDK, configure the SDK provider settings:

- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_API_KEY` or `AZURE_OPENAI_BEARER_TOKEN`
- `AZURE_OPENAI_DEPLOYMENT`
- `AZURE_OPENAI_API_VERSION` (defaults to `2024-10-21`)

The equivalent `FOUNDRY_OPENAI_*` names are also accepted.

`COPILOT_RULE_GENERATION_MODE` accepts:

- `auto`: use Copilot SDK only when runtime/auth is configured, otherwise fallback.
- `required`: attempt Copilot SDK and return fallback diagnostics if it fails.
- `fallback`: disable SDK calls and use deterministic fallback only.

Rule generation responses include `generation.engine`, `generation.runtimeMode`, `generation.sdkConfigured`, and `generation.sdkAttempted` so the UI can show whether the result came from Copilot SDK or fallback.

## Azure Readiness

- Frontend: React + Vite TypeScript app suitable for Azure Static Web Apps.
- API: Azure Functions v4 style handlers under `api/src/functions/`.
- Local settings: copy `api/local.settings.json.example` to `api/local.settings.json` for local Functions work. The real local settings file is gitignored.

## Current MVP Notes

- Safe Review is deterministic mock-first with an adapter boundary for Azure OpenAI / Microsoft Foundry.
- Custom rule generation uses Copilot SDK adapter plus fallback.
- No database, login, or long-term prompt storage is included.