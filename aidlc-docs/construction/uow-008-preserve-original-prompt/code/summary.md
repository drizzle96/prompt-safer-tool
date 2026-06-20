# UOW-008 Code Summary - Preserve Original Prompt

## Summary

Changed the prompt safety workflow so transform actions no longer overwrite the original prompt editor. The editor remains the source text. Safe Output Preview is derived from the source text and the set of applied transform choices.
The highlight/detection preview also reflects applied transform values, so only the prompt input retains the original text.

## Implementation Notes

- Added `src/lib/output.ts` to compose safe output from original text, findings, and applied transform choices.
- Updated `src/App.tsx` to keep original prompt state separate from applied transform state.
- Apply and Apply All now record transform choices instead of mutating the source prompt.
- The detection preview renders transformed values for applied findings while preserving original finding selection controls.
- Ignore removes the corresponding applied transform from Safe Output while keeping the original prompt unchanged.
- Safe Review and Copy now use the derived Safe Output text.

## Verification

- `npm run typecheck`: Passed
- `npm test`: Passed, 2 files and 11 tests
- `npm run build:deploy`: Passed
