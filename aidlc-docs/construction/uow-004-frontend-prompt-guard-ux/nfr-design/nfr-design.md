# NFR Design - UOW-004 Frontend Prompt Guard UX

## UI Design

- Use a dense but readable tool surface with three regions: editor/highlight, findings panel, output/review.
- Keep cards only for individual findings and panels.
- Use responsive grid that collapses on mobile.

## Client Fallback Design

- `apiClient` attempts fetch first.
- If fetch fails in local Vite mode, fallback calls local core functions.
- Fallback must not call any external model.

## Security Design

- Safe Review request includes `transformedText`, findings, applied previews, and ignored metadata only.
- UI does not log prompt content.

## Automation Design

- Add stable `data-testid` values for main actions: scan, apply all, finding apply, finding ignore, safe review, copy.