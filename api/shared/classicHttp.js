function readBody(req) {
  if (typeof req.body === "string") return JSON.parse(req.body);
  return req.body ?? {};
}

function sendJson(context, status, body) {
  context.res = {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
    body
  };
}

function sendValidation(context, validation) {
  sendJson(context, validation.statusCode ?? 400, { error: validation.error });
}

function sendInvalidJson(context) {
  sendJson(context, 400, { error: "Invalid JSON request body." });
}

module.exports = { readBody, sendJson, sendValidation, sendInvalidJson };