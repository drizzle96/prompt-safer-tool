"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRuleCandidate = generateRuleCandidate;
exports.fallbackRuleCandidate = fallbackRuleCandidate;
const node_os_1 = __importDefault(require("node:os"));
const node_path_1 = __importDefault(require("node:path"));
const node_module_1 = require("node:module");
const node_child_process_1 = require("node:child_process");
const node_crypto_1 = require("node:crypto");
const promises_1 = require("node:fs/promises");
const scan_1 = require("../../../src/lib/scan");
async function generateRuleCandidate(request) {
    const runtimeConfig = getCopilotRuntimeConfig();
    const preScan = (0, scan_1.scanText)({ text: request.exampleText });
    const highRiskFindings = preScan.findings.filter((finding) => finding.severity === "high");
    if (highRiskFindings.length > 0) {
        return fallbackRuleCandidate(request.exampleText, ["실제 secret처럼 보이는 값이 포함되어 fallback rule만 생성했습니다."], {
            engine: "fallback",
            sdkConfigured: runtimeConfig.sdkConfigured,
            sdkAttempted: false,
            runtimeMode: runtimeConfig.runtimeMode,
            provider: runtimeConfig.provider,
            model: runtimeConfig.model,
            fallbackReason: "High-risk example blocked before Copilot SDK call."
        });
    }
    if (runtimeConfig.disabled) {
        return fallbackRuleCandidate(request.exampleText, ["Copilot SDK generation is disabled by configuration."], {
            engine: "fallback",
            sdkConfigured: false,
            sdkAttempted: false,
            runtimeMode: "fallback-only",
            provider: runtimeConfig.provider,
            model: runtimeConfig.model,
            fallbackReason: "COPILOT_RULE_GENERATION_MODE=fallback"
        });
    }
    if (!runtimeConfig.sdkConfigured && !runtimeConfig.required) {
        return fallbackRuleCandidate(request.exampleText, ["Copilot SDK runtime/auth is not configured. Set COPILOT_GITHUB_TOKEN or COPILOT_RUNTIME_URL to enable live SDK generation."], {
            engine: "fallback",
            sdkConfigured: false,
            sdkAttempted: false,
            runtimeMode: runtimeConfig.runtimeMode,
            provider: runtimeConfig.provider,
            model: runtimeConfig.model,
            fallbackReason: "Copilot SDK runtime/auth not configured."
        });
    }
    try {
        return await generateWithCopilotSdk(request, runtimeConfig);
    }
    catch (error) {
        return fallbackRuleCandidate(request.exampleText, [`Copilot SDK generation failed: ${safeErrorMessage(error)}. Deterministic fallback was used.`], {
            engine: "fallback",
            sdkConfigured: runtimeConfig.sdkConfigured,
            sdkAttempted: true,
            runtimeMode: runtimeConfig.runtimeMode,
            provider: runtimeConfig.provider,
            model: runtimeConfig.model,
            fallbackReason: safeErrorMessage(error)
        });
    }
}
async function generateWithCopilotSdk(request, runtimeConfig) {
    const parsed = await runCopilotWorker(request, runtimeConfig);
    const fallback = fallbackRuleCandidate(request.exampleText, [], {
        engine: "copilot-sdk",
        sdkConfigured: runtimeConfig.sdkConfigured,
        sdkAttempted: true,
        runtimeMode: runtimeConfig.runtimeMode,
        provider: runtimeConfig.provider,
        model: runtimeConfig.model
    });
    return {
        ...fallback,
        ...parsed,
        rule: { ...fallback.rule, ...parsed.rule },
        source: "copilot",
        generation: {
            engine: "copilot-sdk",
            sdkConfigured: runtimeConfig.sdkConfigured,
            sdkAttempted: true,
            runtimeMode: runtimeConfig.runtimeMode,
            provider: runtimeConfig.provider,
            model: runtimeConfig.model
        }
    };
}
async function runCopilotWorker(request, runtimeConfig) {
    const workerPath = node_path_1.default.join(__dirname, "copilotRuleWorker.js");
    const requestId = (0, node_crypto_1.randomUUID)();
    const inputPath = node_path_1.default.join(node_os_1.default.tmpdir(), `safe-prompt-copilot-${requestId}.input.json`);
    const outputPath = node_path_1.default.join(node_os_1.default.tmpdir(), `safe-prompt-copilot-${requestId}.output.json`);
    const payload = JSON.stringify({
        request,
        model: runtimeConfig.model,
        runtimePath: runtimeConfig.runtimePath ?? runtimeConfig.cliPath,
        runtimeUrl: runtimeConfig.runtimeUrl,
        runtimeToken: runtimeConfig.runtimeToken,
        baseDirectory: runtimeConfig.baseDirectory,
        useLoggedInUser: runtimeConfig.useLoggedInUser,
        azureProvider: runtimeConfig.azureProvider
    });
    await (0, promises_1.writeFile)(inputPath, payload, "utf8");
    return new Promise((resolve, reject) => {
        const child = (0, node_child_process_1.spawn)(process.execPath, [workerPath, inputPath, outputPath], {
            env: process.env,
            stdio: ["ignore", "pipe", "pipe"]
        });
        let stderr = "";
        const timeout = setTimeout(() => {
            child.kill("SIGTERM");
            reject(new Error("Copilot SDK worker timed out"));
        }, Number(process.env.COPILOT_RULE_TIMEOUT_MS ?? 120000));
        child.stderr.on("data", (chunk) => {
            stderr += String(chunk);
        });
        child.on("error", (error) => {
            clearTimeout(timeout);
            reject(error);
        });
        child.on("close", async (code) => {
            clearTimeout(timeout);
            try {
                if (code !== 0) {
                    throw new Error(`Copilot SDK worker exited with code ${code}: ${stderr.slice(0, 500)}`);
                }
                const stdout = await (0, promises_1.readFile)(outputPath, "utf8");
                const output = JSON.parse(stdout);
                if (!output.ok)
                    reject(new Error(output.error));
                else
                    resolve(output.parsed);
            }
            catch (error) {
                reject(new Error(`Copilot SDK worker failed: ${safeErrorMessage(error)}`));
            }
            finally {
                void (0, promises_1.rm)(inputPath, { force: true });
                void (0, promises_1.rm)(outputPath, { force: true });
            }
        });
    });
}
function fallbackRuleCandidate(exampleText, warnings = [], generation) {
    const ticket = exampleText.match(/\b([A-Z]{2,})-\d{4}-\d{4}\b/)?.[1] ?? "DEMO";
    const pattern = `\\b${escapeRegex(ticket)}-\\d{4}-\\d{4}\\b`;
    const replacement = "[TICKET_ID]";
    return {
        rule: {
            id: "custom_ticket_id",
            name: "internal_ticket_id",
            type: "ticket_id",
            pattern,
            replacement,
            severity: "medium",
            description: `${ticket}-YYYY-NNNN 형식의 조직별 티켓 번호`,
            examples: [`${ticket}-2026-0001`],
            source: "copilot-generated",
            enabled: true,
            defaultTransform: { mode: "placeholder" }
        },
        tests: [
            {
                input: `${ticket}-2026-0001 확인해주세요.`,
                expected: `${replacement} 확인해주세요.`
            }
        ],
        warnings,
        falsePositiveRisk: "같은 형식의 일반 문서 번호가 오탐될 수 있습니다.",
        falseNegativeRisk: `${ticket} 외 다른 prefix는 탐지하지 못합니다.`,
        source: "fallback",
        generation: generation ?? {
            engine: "fallback",
            sdkConfigured: false,
            sdkAttempted: false,
            runtimeMode: "fallback-only",
            provider: "copilot",
            model: "fallback"
        }
    };
}
function getCopilotRuntimeConfig() {
    const generationMode = process.env.COPILOT_RULE_GENERATION_MODE ?? "auto";
    const gitHubToken = process.env.COPILOT_GITHUB_TOKEN ?? process.env.GITHUB_TOKEN;
    const runtimeUrl = process.env.COPILOT_RUNTIME_URL;
    const runtimeToken = process.env.COPILOT_RUNTIME_TOKEN;
    const runtimePath = process.env.COPILOT_RUNTIME_PATH ?? process.env.COPILOT_CLI_PATH ?? resolveAzureCopilotCliPath();
    const cliPath = runtimePath ?? resolveBundledCopilotCliPath();
    const useLoggedInUser = process.env.COPILOT_USE_LOGGED_IN_USER === "true";
    const baseDirectory = process.env.COPILOT_HOME ?? node_path_1.default.join(node_os_1.default.tmpdir(), "safe-prompt-guard-copilot");
    const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT ?? process.env.FOUNDRY_OPENAI_ENDPOINT;
    const azureApiKey = process.env.AZURE_OPENAI_API_KEY ?? process.env.FOUNDRY_OPENAI_API_KEY;
    const azureBearerToken = process.env.AZURE_OPENAI_BEARER_TOKEN ?? process.env.FOUNDRY_OPENAI_BEARER_TOKEN;
    const azureDeployment = process.env.AZURE_OPENAI_DEPLOYMENT ?? process.env.FOUNDRY_OPENAI_DEPLOYMENT;
    const azureApiVersion = process.env.AZURE_OPENAI_API_VERSION ?? "2024-10-21";
    const provider = azureEndpoint && azureDeployment && (azureApiKey || azureBearerToken) ? "azure-openai" : "copilot";
    const model = process.env.COPILOT_RULE_MODEL ?? (provider === "azure-openai" ? azureDeployment : "gpt-5.4-mini");
    const runtimeMode = runtimeUrl
        ? "remote-runtime"
        : gitHubToken
            ? "explicit-token"
            : useLoggedInUser
                ? "logged-in-user"
                : runtimePath
                    ? "custom-runtime"
                    : "default-runtime";
    return {
        sdkConfigured: Boolean(runtimeUrl || gitHubToken || useLoggedInUser || runtimePath || provider === "azure-openai"),
        runtimeMode,
        gitHubToken,
        runtimeUrl,
        runtimeToken,
        runtimePath,
        cliPath,
        useLoggedInUser,
        baseDirectory,
        model,
        provider,
        azureProvider: provider === "azure-openai"
            ? {
                type: "azure",
                wireApi: "responses",
                baseUrl: azureEndpoint,
                apiKey: azureApiKey,
                bearerToken: azureBearerToken,
                azure: { apiVersion: azureApiVersion },
                modelId: model,
                wireModel: azureDeployment
            }
            : undefined,
        required: generationMode === "required",
        disabled: generationMode === "fallback"
    };
}
function resolveBundledCopilotCliPath() {
    try {
        return (0, node_module_1.createRequire)(__filename).resolve("@github/copilot/npm-loader.js");
    }
    catch {
        return undefined;
    }
}
function resolveAzureCopilotCliPath() {
    const azurePath = "/home/site/wwwroot/node_modules/@github/copilot-linux-x64/copilot";
    return process.env.WEBSITE_SITE_NAME ? azurePath : undefined;
}
function safeErrorMessage(error) {
    const rawMessage = error instanceof Error ? error.message : String(error);
    return rawMessage
        .replace(/gh[pousr]_[A-Za-z0-9_]+/gu, "[REDACTED_GITHUB_TOKEN]")
        .replace(/Bearer\s+[A-Za-z0-9._\-]+/gu, "Bearer [REDACTED]")
        .slice(0, 1000);
}
function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
