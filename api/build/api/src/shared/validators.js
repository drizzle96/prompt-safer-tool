"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateScanRequest = validateScanRequest;
exports.validateMaskRequest = validateMaskRequest;
exports.validateRulePreviewRequest = validateRulePreviewRequest;
exports.validateSafeReviewRequest = validateSafeReviewRequest;
const constants_1 = require("../../../src/lib/constants");
const validation_1 = require("../../../src/lib/validation");
function validateScanRequest(body) {
    if (!isRecord(body))
        return invalid("Request body must be an object.");
    const text = (0, validation_1.validateText)(body.text, "text", constants_1.MAX_PROMPT_LENGTH);
    if (!text.ok)
        return text;
    return { ok: true, value: { text: text.value, customRules: validateRulesArray(body.customRules) } };
}
function validateMaskRequest(body) {
    if (!isRecord(body))
        return invalid("Request body must be an object.");
    const text = (0, validation_1.validateText)(body.text, "text", constants_1.MAX_PROMPT_LENGTH);
    if (!text.ok)
        return text;
    if (!Array.isArray(body.findings))
        return invalid("findings must be an array.");
    if (!(0, validation_1.isTransformMode)(body.mode))
        return invalid("mode must be masking, dummy, or placeholder.");
    if (body.depth !== undefined && !(0, validation_1.isTransformDepth)(body.depth))
        return invalid("depth must be partial or full.");
    if (!(0, validation_1.isApplyScope)(body.scope))
        return invalid("scope must be selected, same_type, or all.");
    return {
        ok: true,
        value: {
            text: text.value,
            findings: body.findings,
            findingIds: Array.isArray(body.findingIds) ? body.findingIds.filter((id) => typeof id === "string") : undefined,
            mode: body.mode,
            depth: body.depth,
            scope: body.scope,
            customRules: validateRulesArray(body.customRules)
        }
    };
}
function validateRulePreviewRequest(body) {
    if (!isRecord(body))
        return invalid("Request body must be an object.");
    if (!isRecord(body.rule))
        return invalid("rule must be an object.");
    const pattern = (0, validation_1.validateRulePattern)(body.rule.pattern);
    if (!pattern.ok)
        return pattern;
    const sampleText = (0, validation_1.validateText)(body.sampleText, "sampleText", constants_1.MAX_RULE_PATTERN_LENGTH * 4);
    if (!sampleText.ok)
        return sampleText;
    return {
        ok: true,
        value: {
            rule: body.rule,
            sampleText: sampleText.value
        }
    };
}
function validateSafeReviewRequest(body) {
    if (!isRecord(body))
        return invalid("Request body must be an object.");
    if ("originalText" in body)
        return invalid("Safe Review accepts transformed text only.");
    const transformedText = (0, validation_1.validateText)(body.transformedText, "transformedText", constants_1.MAX_PROMPT_LENGTH);
    if (!transformedText.ok)
        return transformedText;
    return {
        ok: true,
        value: {
            transformedText: transformedText.value,
            findings: Array.isArray(body.findings) ? body.findings : [],
            applied: Array.isArray(body.applied) ? body.applied : [],
            ignoredCount: typeof body.ignoredCount === "number" ? body.ignoredCount : 0,
            ignoredTypes: Array.isArray(body.ignoredTypes) ? body.ignoredTypes.filter((type) => typeof type === "string") : []
        }
    };
}
function validateRulesArray(value) {
    if (!Array.isArray(value))
        return undefined;
    return value.filter((rule) => isRecord(rule) && typeof rule.pattern === "string" && typeof rule.type === "string");
}
function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
function invalid(error) {
    return { ok: false, error, statusCode: 400 };
}
