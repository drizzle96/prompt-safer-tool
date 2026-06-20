const { readBody, sendJson, sendValidation, sendInvalidJson } = require("../shared/classicHttp");

module.exports = async function ruleGenerate(context, req) {
  try {
    const { generateRuleCandidate } = require("../build/api/src/services/ruleGenerate");
    const { validateRuleExample } = require("../build/src/lib/validation");
    const body = readBody(req);
    const validation = validateRuleExample(body.exampleText);
    if (!validation.ok) return sendValidation(context, validation);
    sendJson(context, 200, await generateRuleCandidate({ exampleText: validation.value }));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("JSON")) return sendInvalidJson(context);
    sendJson(context, 500, { error: "Rule generation failed.", detail: message.slice(0, 500) });
  }
};