# NFR Requirements - UOW-004 Frontend Prompt Guard UX

## UX

- The first screen must be the usable app, not a landing page.
- The main flow must remain Paste -> Scan -> Fix -> Safe Review -> Copy.
- On-screen copy should be concise and task-focused.

## Accessibility

- Inputs and controls need labels.
- Highlight buttons must be keyboard reachable.
- Text must not overflow controls on common desktop/mobile widths.

## Security

- The UI must state that original prompts are not sent to AI models.
- Safe Review must send transformed text only.
- Actual secret input warning appears in Rule Builder later; Prompt Guard still warns through finding reasons.

## Reliability

- API client uses local fallback for demo continuity.
- UI handles no findings, pending findings, ignored findings, and review errors.