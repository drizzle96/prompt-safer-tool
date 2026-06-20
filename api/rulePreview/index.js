const { previewRule } = require("../build/api/src/services/rulePreview");
const { validateRulePreviewRequest } = require("../build/api/src/shared/validators");
const { readBody, sendJson, sendValidation, sendInvalidJson } = require("../shared/classicHttp");

module.exports = async function rulePreview(context, req) {
  try {
    const validation = validateRulePreviewRequest(readBody(req));
    if (!validation.ok) return sendValidation(context, validation);
    sendJson(context, 200, previewRule(validation.value));
  } catch {
    sendInvalidJson(context);
  }
};