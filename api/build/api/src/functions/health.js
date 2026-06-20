"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.health = health;
const functions_1 = require("@azure/functions");
const http_1 = require("../shared/http");
async function health(_request, _context) {
    return (0, http_1.jsonResponse)({
        service: "safe-prompt-guard-api",
        status: "ok",
        runtime: "azure-functions-node20",
        endpoints: [
            "/api/scan",
            "/api/mask",
            "/api/rules/generate",
            "/api/rules/preview",
            "/api/safe-review",
            "/api/health"
        ],
        privacy: {
            storesPrompts: false,
            logsRawPrompts: false,
            safeReviewAcceptsOriginalText: false,
            sessionOnlyCustomRules: true
        },
        copilot: {
            generationMode: process.env.COPILOT_RULE_GENERATION_MODE ?? "auto",
            sdkConfigured: isCopilotSdkConfigured(),
            azureProviderConfigured: isAzureProviderConfigured()
        }
    });
}
function isCopilotSdkConfigured() {
    return Boolean(process.env.COPILOT_GITHUB_TOKEN ||
        process.env.GITHUB_TOKEN ||
        process.env.COPILOT_USE_LOGGED_IN_USER === "true" ||
        process.env.COPILOT_RUNTIME_URL ||
        process.env.COPILOT_RUNTIME_PATH ||
        isAzureProviderConfigured());
}
function isAzureProviderConfigured() {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT ?? process.env.FOUNDRY_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_API_KEY ?? process.env.FOUNDRY_OPENAI_API_KEY;
    const bearerToken = process.env.AZURE_OPENAI_BEARER_TOKEN ?? process.env.FOUNDRY_OPENAI_BEARER_TOKEN;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT ?? process.env.FOUNDRY_OPENAI_DEPLOYMENT;
    return Boolean(endpoint && deployment && (apiKey || bearerToken));
}
functions_1.app.http("health", {
    methods: ["GET"],
    authLevel: "anonymous",
    route: "health",
    handler: health
});
