import { MAX_PROMPT_LENGTH, MAX_RULE_PATTERN_LENGTH } from "../../../src/lib/constants";
import { isApplyScope, isTransformDepth, isTransformMode, validateRulePattern, validateText } from "../../../src/lib/validation";
import type { MaskRequest, Rule, RulePreviewRequest, SafeReviewRequest, ScanRequest, ValidationResult } from "../../../src/lib/types";

export function validateScanRequest(body: unknown): ValidationResult<ScanRequest> {
  if (!isRecord(body)) return invalid("Request body must be an object.");
  const text = validateText(body.text, "text", MAX_PROMPT_LENGTH);
  if (!text.ok) return text;

  return { ok: true, value: { text: text.value, customRules: validateRulesArray(body.customRules) } };
}

export function validateMaskRequest(body: unknown): ValidationResult<MaskRequest> {
  if (!isRecord(body)) return invalid("Request body must be an object.");
  const text = validateText(body.text, "text", MAX_PROMPT_LENGTH);
  if (!text.ok) return text;
  if (!Array.isArray(body.findings)) return invalid("findings must be an array.");
  if (!isTransformMode(body.mode)) return invalid("mode must be masking, dummy, or placeholder.");
  if (body.depth !== undefined && !isTransformDepth(body.depth)) return invalid("depth must be partial or full.");
  if (!isApplyScope(body.scope)) return invalid("scope must be selected, same_type, or all.");

  return {
    ok: true,
    value: {
      text: text.value,
      findings: body.findings as MaskRequest["findings"],
      findingIds: Array.isArray(body.findingIds) ? body.findingIds.filter((id): id is string => typeof id === "string") : undefined,
      mode: body.mode,
      depth: body.depth,
      scope: body.scope,
      customRules: validateRulesArray(body.customRules)
    }
  };
}

export function validateRulePreviewRequest(body: unknown): ValidationResult<RulePreviewRequest> {
  if (!isRecord(body)) return invalid("Request body must be an object.");
  if (!isRecord(body.rule)) return invalid("rule must be an object.");
  const pattern = validateRulePattern(body.rule.pattern);
  if (!pattern.ok) return pattern;
  const sampleText = validateText(body.sampleText, "sampleText", MAX_RULE_PATTERN_LENGTH * 4);
  if (!sampleText.ok) return sampleText;

  return {
    ok: true,
    value: {
      rule: body.rule as Rule,
      sampleText: sampleText.value
    }
  };
}

export function validateSafeReviewRequest(body: unknown): ValidationResult<SafeReviewRequest> {
  if (!isRecord(body)) return invalid("Request body must be an object.");
  if ("originalText" in body) return invalid("Safe Review accepts transformed text only.");
  const transformedText = validateText(body.transformedText, "transformedText", MAX_PROMPT_LENGTH);
  if (!transformedText.ok) return transformedText;

  return {
    ok: true,
    value: {
      transformedText: transformedText.value,
      findings: Array.isArray(body.findings) ? (body.findings as SafeReviewRequest["findings"]) : [],
      applied: Array.isArray(body.applied) ? (body.applied as SafeReviewRequest["applied"]) : [],
      ignoredCount: typeof body.ignoredCount === "number" ? body.ignoredCount : 0,
      ignoredTypes: Array.isArray(body.ignoredTypes) ? body.ignoredTypes.filter((type): type is string => typeof type === "string") : []
    }
  };
}

function validateRulesArray(value: unknown): Rule[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.filter((rule): rule is Rule => isRecord(rule) && typeof rule.pattern === "string" && typeof rule.type === "string") as Rule[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function invalid(error: string): ValidationResult<never> {
  return { ok: false, error, statusCode: 400 };
}