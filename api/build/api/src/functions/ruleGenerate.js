"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ruleGenerate = ruleGenerate;
const functions_1 = require("@azure/functions");
const ruleGenerate_1 = require("../services/ruleGenerate");
const http_1 = require("../shared/http");
const validation_1 = require("../../../src/lib/validation");
async function ruleGenerate(request, _context) {
    try {
        const body = (await (0, http_1.readJsonBody)(request));
        const validation = (0, validation_1.validateRuleExample)(body.exampleText);
        if (!validation.ok)
            return (0, http_1.safeErrorResponse)(validation.error, validation.statusCode);
        return (0, http_1.jsonResponse)(await (0, ruleGenerate_1.generateRuleCandidate)({ exampleText: validation.value }));
    }
    catch {
        return (0, http_1.safeErrorResponse)("Invalid JSON request body.", 400);
    }
}
functions_1.app.http("ruleGenerate", {
    methods: ["POST"],
    authLevel: "anonymous",
    route: "rules/generate",
    handler: ruleGenerate
});
