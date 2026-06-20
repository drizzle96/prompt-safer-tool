# Frontend Components - UOW-004 Prompt Guard UX

## Component Structure

- `App`: top-level state and layout.
- `GlobalFixBar`: finding count, global transform mode/depth, Scan, Apply All.
- `PromptEditor`: prompt textarea and highlighted finding preview.
- `FindingsPanel`: finding cards with mode/depth/scope, Apply, Ignore.
- `SafeOutputPanel`: transformed output, Safe Review, Copy.

## State Model

- `text`: current working prompt text.
- `findings`: current findings for the working text.
- `ignoredFindingIds`: ignored finding IDs.
- `selectedFindingId`: selected finding for highlight/card focus.
- `globalTransform`: default transform mode/depth.
- `findingOptions`: per-finding transform mode/depth/scope.
- `safeReview`: latest Safe Review result.
- `copyState`: idle/copied/error.

## Interaction Flow

1. User edits prompt.
2. User clicks Scan.
3. Findings render in highlight preview and panel.
4. User applies individual transform or global Apply All.
5. Text and findings refresh.
6. User runs Safe Review on transformed text.
7. User copies transformed text.

## API Integration

- Prefer API client calls to `/api/scan`, `/api/mask`, and `/api/safe-review`.
- Use local core fallback if API is unavailable, so local Vite demo remains usable.

## Form and Control Rules

- Interactive elements use stable `data-testid` attributes.
- Mode/depth controls use selects or segmented-style buttons.
- Placeholder hides or ignores depth.
- Copy action uses Clipboard API with fallback error state.