"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeReview = safeReview;
const functions_1 = require("@azure/functions");
const safeReview_1 = require("../services/safeReview");
const http_1 = require("../shared/http");
const validators_1 = require("../shared/validators");
async function safeReview(request, _context) {
    try {
        const validation = (0, validators_1.validateSafeReviewRequest)(await (0, http_1.readJsonBody)(request));
        if (!validation.ok)
            return (0, http_1.safeErrorResponse)(validation.error, validation.statusCode);
        return (0, http_1.jsonResponse)((0, safeReview_1.reviewTransformedText)(validation.value));
    }
    catch {
        return (0, http_1.safeErrorResponse)("Invalid JSON request body.", 400);
    }
}
functions_1.app.http("safeReview", {
    methods: ["POST"],
    authLevel: "anonymous",
    route: "safe-review",
    handler: safeReview
});
