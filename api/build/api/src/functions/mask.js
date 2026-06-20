"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mask = mask;
const functions_1 = require("@azure/functions");
const transform_1 = require("../../../src/lib/transform");
const http_1 = require("../shared/http");
const validators_1 = require("../shared/validators");
async function mask(request, _context) {
    try {
        const validation = (0, validators_1.validateMaskRequest)(await (0, http_1.readJsonBody)(request));
        if (!validation.ok)
            return (0, http_1.safeErrorResponse)(validation.error, validation.statusCode);
        return (0, http_1.jsonResponse)((0, transform_1.applyTransforms)(validation.value));
    }
    catch {
        return (0, http_1.safeErrorResponse)("Invalid JSON request body.", 400);
    }
}
functions_1.app.http("mask", {
    methods: ["POST"],
    authLevel: "anonymous",
    route: "mask",
    handler: mask
});
