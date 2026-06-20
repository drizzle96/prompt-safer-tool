export type TransformMode = "masking" | "dummy" | "placeholder";
export type TransformDepth = "partial" | "full";
export type ApplyScope = "selected" | "same_type" | "all";
export type Severity = "low" | "medium" | "high";
export type FindingStatus = "pending" | "applied" | "ignored";
export type RuleSource = "built-in" | "copilot-generated";

export type DefaultTransform = {
  mode: TransformMode;
  depth?: TransformDepth;
};

export type Rule = {
  id: string;
  name: string;
  type: string;
  pattern: string;
  replacement: string;
  severity: Severity;
  description: string;
  examples: string[];
  source: RuleSource;
  enabled: boolean;
  defaultTransform: DefaultTransform;
};

export type TransformPreview = {
  findingId: string;
  originalValue: string;
  transformedValue: string;
  mode: TransformMode;
  depth?: TransformDepth;
};

export type Finding = {
  id: string;
  ruleId: string;
  type: string;
  value: string;
  start: number;
  end: number;
  severity: Severity;
  reason: string;
  status: FindingStatus;
  suggestedTransform: TransformPreview;
  availableTransforms: TransformPreview[];
};

export type ScanRequest = {
  text: string;
  customRules?: Rule[];
};

export type ScanResponse = {
  findings: Finding[];
};

export type MaskRequest = {
  text: string;
  findings: Finding[];
  findingIds?: string[];
  mode: TransformMode;
  depth?: TransformDepth;
  scope: ApplyScope;
  customRules?: Rule[];
};

export type MaskResponse = {
  transformedText: string;
  applied: TransformPreview[];
  findings: Finding[];
};

export type RulePreviewRequest = {
  rule: Rule;
  sampleText: string;
};

export type RulePreviewResponse = {
  matched: boolean;
  transformedText: string;
  matches: Finding[];
  warnings: string[];
};

export type RuleGenerationRequest = {
  exampleText: string;
};

export type RuleGenerationResponse = {
  rule: Rule;
  tests: RuleGenerationTestCase[];
  warnings: string[];
  falsePositiveRisk: string;
  falseNegativeRisk: string;
  source: "copilot" | "fallback";
  generation: RuleGenerationMetadata;
};

export type RuleGenerationMetadata = {
  engine: "copilot-sdk" | "fallback";
  sdkConfigured: boolean;
  sdkAttempted: boolean;
  runtimeMode: "remote-runtime" | "explicit-token" | "logged-in-user" | "custom-runtime" | "default-runtime" | "fallback-only";
  provider: "copilot" | "azure-openai";
  model: string;
  fallbackReason?: string;
};

export type RuleGenerationTestCase = {
  input: string;
  expected: string;
};

export type SafeReviewRequest = {
  transformedText: string;
  findings: Finding[];
  applied: TransformPreview[];
  ignoredCount?: number;
  ignoredTypes?: string[];
};

export type SafeReviewResponse = {
  riskLevel: "low" | "medium" | "high";
  summary: string;
  remainingConcerns: string[];
  recommendation: string;
};

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string; statusCode: number };