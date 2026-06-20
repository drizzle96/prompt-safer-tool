"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateText = validateText;
exports.validateRuleExample = validateRuleExample;
exports.validateRulePattern = validateRulePattern;
exports.isTransformMode = isTransformMode;
exports.isTransformDepth = isTransformDepth;
exports.isApplyScope = isApplyScope;
exports.isSeverity = isSeverity;
exports.sanitizeError = sanitizeError;
const constants_1 = require("./constants");
const TRANSFORM_MODES = new Set(["masking", "dummy", "placeholder"]);
const TRANSFORM_DEPTHS = new Set(["partial", "full"]);
const APPLY_SCOPES = new Set(["selected", "same_type", "all"]);
const SEVERITIES = new Set(["low", "medium", "high"]);
function validateText(value, label, maxLength = constants_1.MAX_PROMPT_LENGTH) {
    if (typeof value !== "string") {
        return { ok: false, error: `${label} must be a string.`, statusCode: 400 };
    }
    if (value.length > maxLength) {
        return { ok: false, error: `${label} must be ${maxLength} characters or fewer.`, statusCode: 413 };
    }
    return { ok: true, value };
}
function validateRuleExample(value) {
    return validateText(value, "exampleText", constants_1.MAX_RULE_EXAMPLE_LENGTH);
}
function validateRulePattern(value) {
    return validateText(value, "rule.pattern", constants_1.MAX_RULE_PATTERN_LENGTH);
}
function isTransformMode(value) {
    return typeof value === "string" && TRANSFORM_MODES.has(value);
}
function isTransformDepth(value) {
    return typeof value === "string" && TRANSFORM_DEPTHS.has(value);
}
function isApplyScope(value) {
    return typeof value === "string" && APPLY_SCOPES.has(value);
}
function isSeverity(value) {
    return typeof value === "string" && SEVERITIES.has(value);
}
function sanitizeError(error) {
    if (error instanceof Error && error.message) {
        return error.message;
    }
    return "Request could not be processed.";
}
