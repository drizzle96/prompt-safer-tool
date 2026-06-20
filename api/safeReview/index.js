const { reviewTransformedPrompt } = require("../build/api/src/services/safeReview");
const { validateSafeReviewRequest } = require("../build/api/src/shared/validators");
const { readBody, sendJson, sendValidation, sendInvalidJson } = require("../shared/classicHttp");

module.exports = async function safeReview(context, req) {
  try {
    const validation = validateSafeReviewRequest(readBody(req));
    if (!validation.ok) return sendValidation(context, validation);
    sendJson(context, 200, reviewTransformedPrompt(validation.value));
  } catch {
    sendInvalidJson(context);
  }
};