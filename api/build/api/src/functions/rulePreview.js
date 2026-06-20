"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rulePreview = rulePreview;
const functions_1 = require("@azure/functions");
const rulePreview_1 = require("../services/rulePreview");
const http_1 = require("../shared/http");
const validators_1 = require("../shared/validators");
async function rulePreview(request, _context) {
    try {
        const validation = (0, validators_1.validateRulePreviewRequest)(await (0, http_1.readJsonBody)(request));
        if (!validation.ok)
            return (0, http_1.safeErrorResponse)(validation.error, validation.statusCode);
        return (0, http_1.jsonResponse)((0, rulePreview_1.previewRule)(validation.value));
    }
    catch {
        return (0, http_1.safeErrorResponse)("Invalid JSON request body.", 400);
    }
}
functions_1.app.http("rulePreview", {
    methods: ["POST"],
    authLevel: "anonymous",
    route: "rules/preview",
    handler: rulePreview
});
