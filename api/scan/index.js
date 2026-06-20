const { scanText } = require("../build/src/lib/scan");
const { validateScanRequest } = require("../build/api/src/shared/validators");
const { readBody, sendJson, sendValidation, sendInvalidJson } = require("../shared/classicHttp");

module.exports = async function scan(context, req) {
  try {
    const validation = validateScanRequest(readBody(req));
    if (!validation.ok) return sendValidation(context, validation);
    sendJson(context, 200, scanText(validation.value));
  } catch {
    sendInvalidJson(context);
  }
};