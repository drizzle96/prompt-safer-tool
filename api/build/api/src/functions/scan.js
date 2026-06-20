"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scan = scan;
const functions_1 = require("@azure/functions");
const scan_1 = require("../../../src/lib/scan");
const http_1 = require("../shared/http");
const validators_1 = require("../shared/validators");
async function scan(request, _context) {
    try {
        const validation = (0, validators_1.validateScanRequest)(await (0, http_1.readJsonBody)(request));
        if (!validation.ok)
            return (0, http_1.safeErrorResponse)(validation.error, validation.statusCode);
        return (0, http_1.jsonResponse)((0, scan_1.scanText)(validation.value));
    }
    catch {
        return (0, http_1.safeErrorResponse)("Invalid JSON request body.", 400);
    }
}
functions_1.app.http("scan", {
    methods: ["POST"],
    authLevel: "anonymous",
    route: "scan",
    handler: scan
});
