# E2E Test Instructions

## Demo E2E Flow

1. Start the app with `npm run dev`.
2. Open `http://127.0.0.1:5173/`.
3. In Custom Rule Builder, keep the default `DEMO-2026-0001` dummy example.
4. Click Generate Rule.
5. Click Preview.
6. Click 세션에 추가.
7. Click Scan.
8. Verify 6 findings appear, including `ticket_id`.
9. Click 모두 적용.
10. Verify pending findings disappear and placeholders are shown.
11. Click Safe Review.
12. Verify low-risk guidance appears.
13. Click Copy.

## Expected Output Pattern

- `DEMO-2026-0001` becomes `[TICKET_ID]` after custom rule transform.
- `dev.owner@example.com` becomes `[EMAIL]` with global placeholder mode.
- Internal URL becomes `[URL]`.
- Bearer token becomes `[BEARER_TOKEN]`.
- `API_KEY=...` becomes `API_KEY=[SECRET]`.
- IP address becomes `[IP_ADDRESS]`.