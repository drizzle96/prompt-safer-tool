# NFR Requirements - UOW-005 Custom Rule Builder and Copilot Adapter

## Security

- Pre-scan examples before Copilot SDK generation.
- Do not send detected real secrets to Copilot SDK.
- Do not log examples.
- Do not automatically activate generated rules.

## Reliability

- Copilot SDK failures must fall back to deterministic generation.
- Rule preview validates generated regex before approval.

## Demo Readiness

- DEMO-2026-0001 must generate a usable ticket ID rule.
- Approved rule must affect subsequent scan results in the UI.