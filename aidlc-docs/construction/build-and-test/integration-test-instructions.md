# Integration Test Instructions

## API Integration Checks

When Azure Functions local runtime is configured, verify:

1. `POST /api/scan` returns findings.
2. `POST /api/mask` returns transformed text.
3. `POST /api/rules/generate` returns a rule candidate.
4. `POST /api/rules/preview` returns preview output.
5. `POST /api/safe-review` accepts transformed text only.

## Frontend Integration Checks

In Vite local development:

1. Open `http://127.0.0.1:5173/`.
2. Click Scan.
3. Click Apply All.
4. Click Safe Review.
5. Use Custom Rule Builder to generate, preview, approve, and rescan.

The frontend uses deterministic local fallback in Vite dev mode, so it remains demo-ready without a running Functions host.