# Domain Entities - UOW-002 Core Scan and Transform Engine

## Rule

Represents a deterministic detection rule.

Key fields:
- `id`
- `name`
- `type`
- `pattern`
- `replacement`
- `severity`
- `description`
- `examples`
- `source`
- `enabled`
- `defaultTransform`

## Finding

Represents one detected risky value in source text.

Key fields:
- `id`
- `ruleId`
- `type`
- `value`
- `start`
- `end`
- `severity`
- `reason`
- `status`
- `suggestedTransform`
- `availableTransforms`

## TransformPreview

Represents before/after transform preview for one finding.

Key fields:
- `findingId`
- `originalValue`
- `transformedValue`
- `mode`
- `depth`

## MaskRequest

Represents a request to apply transforms.

Key fields:
- `text`
- `findings`
- `findingIds`
- `mode`
- `depth`
- `scope`
- `customRules`

## MaskResponse

Represents transformed output plus applied transform metadata.

Key fields:
- `transformedText`
- `applied`
- `findings`

## Entity Relationships

- A Rule can produce many Findings.
- A Finding has many TransformPreviews.
- A MaskRequest selects Findings and produces a MaskResponse.
- A MaskResponse contains applied TransformPreviews and refreshed Findings.