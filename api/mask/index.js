const { applyTransforms } = require("../build/src/lib/transform");
const { validateMaskRequest } = require("../build/api/src/shared/validators");
const { readBody, sendJson, sendValidation, sendInvalidJson } = require("../shared/classicHttp");

module.exports = async function mask(context, req) {
  try {
    const validation = validateMaskRequest(readBody(req));
    if (!validation.ok) return sendValidation(context, validation);
    sendJson(context, 200, applyTransforms(validation.value));
  } catch {
    sendInvalidJson(context);
  }
};