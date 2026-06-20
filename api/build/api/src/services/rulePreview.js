"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previewRule = previewRule;
const scan_1 = require("../../../src/lib/scan");
function previewRule(request) {
    const warnings = [];
    try {
        const regex = new RegExp(request.rule.pattern, "g");
        if (regex.test(""))
            warnings.push("Rule can match an empty string.");
    }
    catch {
        return {
            matched: false,
            transformedText: request.sampleText,
            matches: [],
            warnings: ["Rule pattern is not a valid regular expression."]
        };
    }
    const scan = (0, scan_1.scanText)({ text: request.sampleText, customRules: [request.rule] });
    const customMatches = scan.findings.filter((finding) => finding.ruleId.includes(request.rule.id));
    const transformedText = request.sampleText.replace(new RegExp(request.rule.pattern, "g"), request.rule.replacement);
    if (customMatches.length === 0)
        warnings.push("Rule did not match the sample text.");
    return {
        matched: customMatches.length > 0,
        transformedText,
        matches: customMatches,
        warnings
    };
}
