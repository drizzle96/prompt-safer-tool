# Code Generation Plan - UOW-011 Copilot SDK Runtime Integration

## Unit Context

- **Unit**: UOW-011 Copilot SDK Runtime Integration
- **Purpose**: Move Custom Rule Builder from opaque SDK attempt/fallback behavior to explicit Copilot SDK runtime integration with safe diagnostics.
- **Dependencies**: UOW-005 Custom Rule Builder, UOW-010 Safe Output Tab.
- **User Request**: "실제 코 파일럿 SDK 연동을 진행 해 줘"
- **Evaluation Context**: Effective use of Copilot SDK is a primary judging criterion.

## Target Application Paths

- `api/src/services/ruleGenerate.ts`
- `api/ruleGenerate/index.js`
- `api/local.settings.json.example`
- `src/lib/types.ts`
- `src/lib/apiClient.ts`
- `src/App.tsx`
- `README.md`
- `aidlc-docs/construction/uow-011-copilot-sdk-runtime-integration/code/summary.md`

## Generation Steps

- [x] Step 1: Document the Copilot SDK runtime integration request.
- [x] Step 2: Add environment-driven Copilot SDK client configuration.
- [x] Step 3: Support explicit GitHub token, logged-in user mode, custom runtime path, and remote runtime URL.
- [x] Step 4: Return safe SDK/fallback diagnostics in the rule generation response.
- [x] Step 5: Show SDK source/diagnostics in the Custom Rule Builder UI.
- [x] Step 6: Update local settings example and README setup notes.
- [x] Step 7: Run typecheck, tests, deploy build, and API smoke checks.

## Completion Criteria

- When Copilot SDK runtime/auth is configured, rule generation can return `source: "copilot"`.
- When SDK runtime/auth is missing or fails, response explains fallback without exposing secrets.
- High-risk examples are still blocked before any SDK call.
- UI shows whether a rule came from Copilot SDK or fallback.
- `npm run typecheck`, `npm test`, and `npm run build:deploy` pass.
