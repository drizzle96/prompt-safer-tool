# Code Generation Plan - UOW-012 Dedicated Functions API

## Unit Context

- **Unit**: UOW-012 Dedicated Functions API
- **Purpose**: Move API execution away from Static Web Apps managed Functions to a dedicated Azure Functions app so Copilot SDK runtime packages can be installed on Linux during deployment.
- **Dependencies**: UOW-011 Copilot SDK Runtime Integration.
- **Decision**: Use option 2 from the production SDK blocker: separate Azure Functions/App Service API.

## Target Application Paths

- `src/lib/constants.ts`
- `src/lib/apiClient.ts`
- `README.md`
- `aidlc-docs/construction/uow-012-dedicated-functions-api/code/summary.md`

## Generation Steps

- [x] Step 1: Document the dedicated API deployment decision.
- [x] Step 2: Add frontend support for `VITE_API_BASE_URL` so production can call a dedicated Function App.
- [x] Step 3: Create Azure storage and a Linux Node 20 Function App.
- [x] Step 4: Configure Function App app settings for Copilot SDK and CORS.
- [x] Step 5: Deploy API with remote Linux dependency installation.
- [x] Step 6: Rebuild/redeploy Static Web Apps frontend with the dedicated API base URL.
- [x] Step 7: Verify Custom Rule Builder returns Copilot SDK diagnostics from production.

## Completion Criteria

- Static Web Apps frontend calls the dedicated Function App API.
- Dedicated Function App installs Linux-compatible Copilot SDK runtime dependencies.
- Production `/api/rules/generate` can reach the SDK path with explicit token settings.
- Existing scan/mask/safe-review endpoints continue to work.
- `npm run typecheck`, `npm test`, and `npm run build:deploy` pass.
