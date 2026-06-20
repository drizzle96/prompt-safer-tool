import { buildTransformPreviews } from "./transform";
import { classifyUrlType, getBuiltInRules, internalUrlRuleFrom, normalizeCustomRule } from "./rules";
import type { DetectionRule } from "./rules";
import type { Finding, Rule, ScanResponse, Severity } from "./types";

const SEVERITY_RANK: Record<Severity, number> = {
  low: 1,
  medium: 2,
  high: 3
};

export function scanText(input: { text: string; customRules?: Rule[] }): ScanResponse {
  const rules = getActiveRules(input.customRules ?? []);
  const candidates = rules.flatMap((rule) => findMatches(input.text, rule));
  const findings = resolveOverlappingFindings(candidates).map((finding, index) => {
    const id = `f_${finding.type}_${index + 1}`;
    const normalized = { ...finding, id };
    const availableTransforms = buildTransformPreviews(normalized);
    const suggestedTransform =
      availableTransforms.find(
        (preview) =>
          preview.mode === finding.suggestedTransform.mode && preview.depth === finding.suggestedTransform.depth
      ) ?? availableTransforms[0];

    return {
      ...normalized,
      suggestedTransform,
      availableTransforms
    };
  });

  return { findings };
}

export function resolveOverlappingFindings(findings: Finding[]): Finding[] {
  const sorted = [...findings].sort((first, second) => {
    const severityDifference = SEVERITY_RANK[second.severity] - SEVERITY_RANK[first.severity];
    if (severityDifference !== 0) return severityDifference;

    const lengthDifference = second.end - second.start - (first.end - first.start);
    if (lengthDifference !== 0) return lengthDifference;

    const orderDifference = Number(first.ruleId.split(":")[0]) - Number(second.ruleId.split(":")[0]);
    if (!Number.isNaN(orderDifference) && orderDifference !== 0) return orderDifference;

    return first.start - second.start;
  });

  const accepted: Finding[] = [];
  for (const finding of sorted) {
    if (!hasValidRange(finding) || accepted.some((acceptedFinding) => overlaps(acceptedFinding, finding))) {
      continue;
    }
    accepted.push(finding);
  }

  return accepted.sort((first, second) => first.start - second.start);
}

function getActiveRules(customRules: Rule[]): DetectionRule[] {
  const builtIns = getBuiltInRules();
  const custom = customRules
    .map((rule, index) => normalizeCustomRule(rule, builtIns.length + index))
    .filter((rule): rule is DetectionRule => rule !== null);

  return [...builtIns, ...custom];
}

function findMatches(text: string, rule: DetectionRule): Finding[] {
  const matches: Finding[] = [];
  const regex = new RegExp(rule.regex.source, rule.regex.flags);

  for (const match of text.matchAll(regex)) {
    if (match.index === undefined || match[0].length === 0) {
      continue;
    }

    const value = match[0].replace(/[),.;]+$/u, "");
    if (isPlaceholderAssignment(value)) {
      continue;
    }
    const start = match.index;
    const end = start + value.length;
    const effectiveRule = rule.type === "url" && classifyUrlType(value) === "internal_url" ? internalUrlRuleFrom(rule) : rule;

    matches.push({
      id: `candidate_${matches.length + 1}`,
      ruleId: `${effectiveRule.order}:${effectiveRule.id}`,
      type: effectiveRule.type,
      value,
      start,
      end,
      severity: effectiveRule.severity,
      reason: effectiveRule.reason,
      status: "pending",
      suggestedTransform: {
        findingId: "",
        originalValue: value,
        transformedValue: effectiveRule.replacement,
        mode: effectiveRule.defaultTransform.mode,
        depth: effectiveRule.defaultTransform.depth
      },
      availableTransforms: []
    });
  }

  return matches;
}

function hasValidRange(finding: Finding): boolean {
  return finding.start >= 0 && finding.end > finding.start;
}

function overlaps(first: Finding, second: Finding): boolean {
  return first.start < second.end && second.start < first.end;
}

function isPlaceholderAssignment(value: string): boolean {
  return /^[A-Z0-9_]*(KEY|SECRET|TOKEN|PASSWORD)[A-Z0-9_]*\s*[:=]\s*\[[A-Z0-9_]+\]$/iu.test(value);
}