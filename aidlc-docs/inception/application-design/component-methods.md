# Component Methods - Safe Prompt Guard

## Shared Types

```ts
type TransformMode = "masking" | "dummy" | "placeholder";
type TransformDepth = "partial" | "full";
type ApplyScope = "selected" | "same_type" | "all";
type Severity = "low" | "medium" | "high";
type FindingStatus = "pending" | "applied" | "ignored";
```

## Core Detection and Transform Engine

```ts
getBuiltInRules(): Rule[]
```
Returns deterministic built-in rules.

```ts
scanText(input: { text: string; customRules?: Rule[] }): ScanResponse
```
Scans text and returns normalized findings.

```ts
resolveOverlappingFindings(findings: Finding[]): Finding[]
```
Keeps one finding for overlapping ranges using severity, match length, then rule order.

```ts
buildTransformPreviews(finding: Finding): TransformPreview[]
```
Builds available transform options for a finding.

```ts
transformValue(input: { finding: Finding; mode: TransformMode; depth?: TransformDepth }): string
```
Transforms a single finding value.

```ts
applyTransforms(request: MaskRequest): MaskResponse
```
Applies transforms by scope, patching from the end of the string.

## Rule Builder Service

```ts
generateRuleCandidate(input: RuleGenerationRequest): Promise<RuleGenerationResponse>
```
Generates a custom rule candidate through Copilot SDK when available, otherwise deterministic fallback.

```ts
previewRule(request: RulePreviewRequest): RulePreviewResponse
```
Applies a custom rule to sample text and returns matches, warnings, and transformed text.

```ts
validateRule(rule: Rule): RuleValidationResult
```
Checks regex syntax, empty matches, broad matches, and basic safety warnings.

## Safe Review Service

```ts
reviewTransformedText(request: SafeReviewRequest): Promise<SafeReviewResponse>
```
Reviews transformed text only and returns residual-risk guidance.

## API Functions

```ts
handleScan(req: HttpRequest): Promise<HttpResponse>
handleMask(req: HttpRequest): Promise<HttpResponse>
handleRuleGenerate(req: HttpRequest): Promise<HttpResponse>
handleRulePreview(req: HttpRequest): Promise<HttpResponse>
handleSafeReview(req: HttpRequest): Promise<HttpResponse>
```
Each handler validates input, calls a service, and returns safe JSON responses.

## Frontend API Client

```ts
scanPrompt(request: ScanRequest): Promise<ScanResponse>
maskPrompt(request: MaskRequest): Promise<MaskResponse>
generateRule(request: RuleGenerationRequest): Promise<RuleGenerationResponse>
previewRule(request: RulePreviewRequest): Promise<RulePreviewResponse>
runSafeReview(request: SafeReviewRequest): Promise<SafeReviewResponse>
```

## UI Event Handlers

```ts
onScan(): Promise<void>
onApplyFinding(findingId: string): Promise<void>
onIgnoreFinding(findingId: string): void
onApplyAll(): Promise<void>
onGenerateRule(): Promise<void>
onApproveRule(rule: Rule): void
onSafeReview(): Promise<void>
onCopy(): Promise<void>
```

Detailed business rules for each method will be finalized in Functional Design.