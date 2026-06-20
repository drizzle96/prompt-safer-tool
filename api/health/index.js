const { sendJson } = require("../shared/classicHttp");

function isAzureProviderConfigured() {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT || process.env.FOUNDRY_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY || process.env.FOUNDRY_OPENAI_API_KEY;
  const bearerToken = process.env.AZURE_OPENAI_BEARER_TOKEN || process.env.FOUNDRY_OPENAI_BEARER_TOKEN;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || process.env.FOUNDRY_OPENAI_DEPLOYMENT;
  return Boolean(endpoint && deployment && (apiKey || bearerToken));
}

function isCopilotSdkConfigured() {
  return Boolean(
    process.env.COPILOT_GITHUB_TOKEN ||
      process.env.GITHUB_TOKEN ||
      process.env.COPILOT_USE_LOGGED_IN_USER === "true" ||
      process.env.COPILOT_RUNTIME_URL ||
      process.env.COPILOT_RUNTIME_PATH ||
      isAzureProviderConfigured()
  );
}

module.exports = async function health(context, _req) {
  sendJson(context, 200, {
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
      generationMode: process.env.COPILOT_RULE_GENERATION_MODE || "auto",
      sdkConfigured: isCopilotSdkConfigured(),
      azureProviderConfigured: isAzureProviderConfigured()
    }
  });
};
