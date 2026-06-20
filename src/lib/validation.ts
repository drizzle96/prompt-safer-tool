import { MAX_PROMPT_LENGTH, MAX_RULE_EXAMPLE_LENGTH, MAX_RULE_PATTERN_LENGTH } from "./constants";
import type { ApplyScope, Severity, TransformDepth, TransformMode, ValidationResult } from "./types";

const TRANSFORM_MODES = new Set<TransformMode>(["masking", "dummy", "placeholder"]);
const TRANSFORM_DEPTHS = new Set<TransformDepth>(["partial", "full"]);
const APPLY_SCOPES = new Set<ApplyScope>(["selected", "same_type", "all"]);
const SEVERITIES = new Set<Severity>(["low", "medium", "high"]);

export function validateText(value: unknown, label: string, maxLength = MAX_PROMPT_LENGTH): ValidationResult<string> {
  if (typeof value !== "string") {
    return { ok: false, error: `${label} must be a string.`, statusCode: 400 };
  }

  if (value.length > maxLength) {
    return { ok: false, error: `${label} must be ${maxLength} characters or fewer.`, statusCode: 413 };
  }

  return { ok: true, value };
}

export function validateRuleExample(value: unknown): ValidationResult<string> {
  return validateText(value, "exampleText", MAX_RULE_EXAMPLE_LENGTH);
}

export function validateRulePattern(value: unknown): ValidationResult<string> {
  return validateText(value, "rule.pattern", MAX_RULE_PATTERN_LENGTH);
}

export function isTransformMode(value: unknown): value is TransformMode {
  return typeof value === "string" && TRANSFORM_MODES.has(value as TransformMode);
}

export function isTransformDepth(value: unknown): value is TransformDepth {
  return typeof value === "string" && TRANSFORM_DEPTHS.has(value as TransformDepth);
}

export function isApplyScope(value: unknown): value is ApplyScope {
  return typeof value === "string" && APPLY_SCOPES.has(value as ApplyScope);
}

export function isSeverity(value: unknown): value is Severity {
  return typeof value === "string" && SEVERITIES.has(value as Severity);
}

export function sanitizeError(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Request could not be processed.";
}