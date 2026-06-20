"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanText = scanText;
exports.resolveOverlappingFindings = resolveOverlappingFindings;
const transform_1 = require("./transform");
const rules_1 = require("./rules");
const SEVERITY_RANK = {
    low: 1,
    medium: 2,
    high: 3
};
function scanText(input) {
    const rules = getActiveRules(input.customRules ?? []);
    const candidates = rules.flatMap((rule) => findMatches(input.text, rule));
    const findings = resolveOverlappingFindings(candidates).map((finding, index) => {
        const id = `f_${finding.type}_${index + 1}`;
        const normalized = { ...finding, id };
        const availableTransforms = (0, transform_1.buildTransformPreviews)(normalized);
        const suggestedTransform = availableTransforms.find((preview) => preview.mode === finding.suggestedTransform.mode && preview.depth === finding.suggestedTransform.depth) ?? availableTransforms[0];
        return {
            ...normalized,
            suggestedTransform,
            availableTransforms
        };
    });
    return { findings };
}
function resolveOverlappingFindings(findings) {
    const sorted = [...findings].sort((first, second) => {
        const severityDifference = SEVERITY_RANK[second.severity] - SEVERITY_RANK[first.severity];
        if (severityDifference !== 0)
            return severityDifference;
        const lengthDifference = second.end - second.start - (first.end - first.start);
        if (lengthDifference !== 0)
            return lengthDifference;
        const orderDifference = Number(first.ruleId.split(":")[0]) - Number(second.ruleId.split(":")[0]);
        if (!Number.isNaN(orderDifference) && orderDifference !== 0)
            return orderDifference;
        return first.start - second.start;
    });
    const accepted = [];
    for (const finding of sorted) {
        if (!hasValidRange(finding) || accepted.some((acceptedFinding) => overlaps(acceptedFinding, finding))) {
            continue;
        }
        accepted.push(finding);
    }
    return accepted.sort((first, second) => first.start - second.start);
}
function getActiveRules(customRules) {
    const builtIns = (0, rules_1.getBuiltInRules)();
    const custom = customRules
        .map((rule, index) => (0, rules_1.normalizeCustomRule)(rule, builtIns.length + index))
        .filter((rule) => rule !== null);
    return [...builtIns, ...custom];
}
function findMatches(text, rule) {
    const matches = [];
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
        const effectiveRule = rule.type === "url" && (0, rules_1.classifyUrlType)(value) === "internal_url" ? (0, rules_1.internalUrlRuleFrom)(rule) : rule;
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
function hasValidRange(finding) {
    return finding.start >= 0 && finding.end > finding.start;
}
function overlaps(first, second) {
    return first.start < second.end && second.start < first.end;
}
function isPlaceholderAssignment(value) {
    return /^[A-Z0-9_]*(KEY|SECRET|TOKEN|PASSWORD)[A-Z0-9_]*\s*[:=]\s*\[[A-Z0-9_]+\]$/iu.test(value);
}
