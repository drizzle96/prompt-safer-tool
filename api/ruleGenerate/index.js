const { generateRuleCandidate } = require("../build/api/src/services/ruleGenerate");
const { validateRuleExample } = require("../build/src/lib/validation");
const { readBody, sendJson, sendValidation, sendInvalidJson } = require("../shared/classicHttp");

module.exports = async function ruleGenerate(context, req) {
  try {
    const body = readBody(req);
    const validation = validateRuleExample(body.exampleText);
    if (!validation.ok) return sendValidation(context, validation);
    sendJson(context, 200, await generateRuleCandidate({ exampleText: validation.value }));
  } catch {
    sendInvalidJson(context);
  }
};