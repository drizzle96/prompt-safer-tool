"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readJsonBody = readJsonBody;
exports.jsonResponse = jsonResponse;
exports.safeErrorResponse = safeErrorResponse;
const validation_1 = require("../../../src/lib/validation");
async function readJsonBody(request) {
    return (await request.json());
}
function jsonResponse(body, status = 200) {
    return {
        status,
        jsonBody: body,
        headers: {
            "content-type": "application/json; charset=utf-8",
            "cache-control": "no-store"
        }
    };
}
function safeErrorResponse(error, status = 400) {
    return jsonResponse({ error: (0, validation_1.sanitizeError)(error) }, status);
}
