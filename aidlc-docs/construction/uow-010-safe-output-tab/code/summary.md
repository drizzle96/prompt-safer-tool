# UOW-010 Code Summary - Safe Output Tab

## Summary

Separated the Safe Output Preview workflow into its own top-level tab. The Prompt Safety tab now focuses on source prompt scanning, detection preview, and transform controls, while the Safe Output tab owns the transformed output, Safe Review, Copy, and review result.

## Implementation Notes

- Added a `세이프 아웃풋` workspace tab in `src/App.tsx`.
- Moved the existing Safe Output Preview panel out of the Prompt Safety tab.
- Added an applied-count badge to the Safe Output tab.
- Preserved UOW-008 behavior: the source prompt input remains unchanged while detection preview and Safe Output reflect applied transforms.
- Kept Custom Rules tab behavior unchanged.

## Verification

- `npm run typecheck`: Passed
- `npm test`: Passed, 2 files and 11 tests
- `npm run build:deploy`: Passed
