# Domain Entities - UOW-003 API Functions

## ScanRequest and ScanResponse

- Request: `text`, optional `customRules`.
- Response: normalized `findings`.

## MaskRequest and MaskResponse

- Request: `text`, `findings`, optional `findingIds`, `mode`, optional `depth`, `scope`, optional `customRules`.
- Response: `transformedText`, `applied`, refreshed `findings`.

## RulePreviewRequest and RulePreviewResponse

- Request: `rule`, `sampleText`.
- Response: `matched`, `transformedText`, `matches`, `warnings`.

## SafeReviewRequest and SafeReviewResponse

- Request: `transformedText`, `findings`, `applied`, optional ignored metadata.
- Response: `riskLevel`, `summary`, `remainingConcerns`, `recommendation`.