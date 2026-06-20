# UOW-009 Code Summary - Detection Preview Label

## Summary

Added a visible label UI above the detection result preview area so users can distinguish the source prompt input from the transformed detection preview.

## Implementation Notes

- Added a small label row above the highlight preview in `src/App.tsx`.
- Connected the preview region to the visible label using `aria-labelledby`.
- Added concise helper text showing that applied transform results appear in this preview.
- Added CSS for the label row and helper text without changing the existing transform behavior.

## Verification

- `npm run typecheck`: Passed
- `npm test`: Passed, 2 files and 11 tests
- `npm run build:deploy`: Passed
