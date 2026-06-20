import { scanText } from "../../../src/lib/scan";
import type { RulePreviewRequest, RulePreviewResponse } from "../../../src/lib/types";

export function previewRule(request: RulePreviewRequest): RulePreviewResponse {
  const warnings: string[] = [];

  try {
    const regex = new RegExp(request.rule.pattern, "g");
    if (regex.test("")) warnings.push("Rule can match an empty string.");
  } catch {
    return {
      matched: false,
      transformedText: request.sampleText,
      matches: [],
      warnings: ["Rule pattern is not a valid regular expression."]
    };
  }

  const scan = scanText({ text: request.sampleText, customRules: [request.rule] });
  const customMatches = scan.findings.filter((finding) => finding.ruleId.includes(request.rule.id));
  const transformedText = request.sampleText.replace(new RegExp(request.rule.pattern, "g"), request.rule.replacement);

  if (customMatches.length === 0) warnings.push("Rule did not match the sample text.");

  return {
    matched: customMatches.length > 0,
    transformedText,
    matches: customMatches,
    warnings
  };
}