import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { scanText } from "../../../src/lib/scan";
import type { Rule, RuleGenerationMetadata, RuleGenerationRequest, RuleGenerationResponse } from "../../../src/lib/types";

type CopilotRuntimeConfig = {
  sdkConfigured: boolean;
  runtimeMode: RuleGenerationMetadata["runtimeMode"];
  gitHubToken?: string;
  runtimeUrl?: string;
  runtimeToken?: string;
  runtimePath?: string;
  cliPath?: string;
  useLoggedInUser: boolean;
  baseDirectory: string;
  model: string;
  provider: "copilot" | "azure-openai";
  azureProvider?: {
    type: "azure";
    wireApi: "responses";
    baseUrl: string;
    apiKey?: string;
    bearerToken?: string;
    azure: { apiVersion?: string };
    modelId: string;
    wireModel: string;
  };
  required: boolean;
  disabled: boolean;
};

export async function generateRuleCandidate(request: RuleGenerationRequest): Promise<RuleGenerationResponse> {
  const runtimeConfig = getCopilotRuntimeConfig();
  const preScan = scanText({ text: request.exampleText });
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
  } catch (error) {
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

async function generateWithCopilotSdk(request: RuleGenerationRequest, runtimeConfig: CopilotRuntimeConfig): Promise<RuleGenerationResponse> {
  const { CopilotClient, RuntimeConnection, approveAll } = await import("@github/copilot-sdk");
  const client = new CopilotClient({
    connection: runtimeConfig.runtimeUrl
      ? RuntimeConnection.forUri(runtimeConfig.runtimeUrl, { connectionToken: runtimeConfig.runtimeToken })
      : RuntimeConnection.forStdio({ path: runtimeConfig.runtimePath ?? runtimeConfig.cliPath }),
    logLevel: "error",
    mode: "copilot-cli",
    baseDirectory: runtimeConfig.baseDirectory,
    gitHubToken: runtimeConfig.gitHubToken,
    useLoggedInUser: runtimeConfig.useLoggedInUser,
    env: process.env
  });
  await client.start();

  try {
    const session = await client.createSession({
      model: runtimeConfig.model,
      provider: runtimeConfig.azureProvider,
      onPermissionRequest: approveAll,
      systemMessage: {
        content: "You generate Safe Prompt Guard regex rules from dummy examples. Return exactly one compact JSON object and no markdown, prose, comments, or code fences."
      }
    });

    let content = "";
    const done = new Promise<void>((resolve) => {
      session.on("assistant.message", (event) => {
        content += event.data.content;
      });
      session.on("session.idle", () => resolve());
    });

    await session.send({
      prompt: `Create a JSON rule candidate for this dummy example: ${request.exampleText}

Return exactly this shape:
{"rule":{"name":"...","type":"ticket_id","pattern":"...","replacement":"[TICKET_ID]","severity":"medium","description":"...","examples":["..."],"defaultTransform":{"mode":"placeholder"}},"tests":[{"input":"...","expected":"..."}],"warnings":[],"falsePositiveRisk":"...","falseNegativeRisk":"..."}

Rules:
- If the example contains a ticket ID like PREFIX-YYYY-NNNN, generalize to pattern "\\bPREFIX-\\d{4}-\\d{4}\\b" instead of matching only one exact ID.
- Use only dummy examples.
- Do not include markdown or explanatory text.`
    });
    await done;
    await session.disconnect();

    const parsed = parseCopilotRuleResponse(content);
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
  } finally {
    await client.stop();
  }
}

export function fallbackRuleCandidate(exampleText: string, warnings: string[] = [], generation?: RuleGenerationMetadata): RuleGenerationResponse {
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

function getCopilotRuntimeConfig(): CopilotRuntimeConfig {
  const generationMode = process.env.COPILOT_RULE_GENERATION_MODE ?? "auto";
  const gitHubToken = process.env.COPILOT_GITHUB_TOKEN ?? process.env.GITHUB_TOKEN;
  const runtimeUrl = process.env.COPILOT_RUNTIME_URL;
  const runtimeToken = process.env.COPILOT_RUNTIME_TOKEN;
  const runtimePath = process.env.COPILOT_RUNTIME_PATH;
  const cliPath = runtimePath ?? resolveBundledCopilotCliPath();
  const useLoggedInUser = process.env.COPILOT_USE_LOGGED_IN_USER === "true";
  const baseDirectory = process.env.COPILOT_HOME ?? path.join(os.tmpdir(), "safe-prompt-guard-copilot");
  const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT ?? process.env.FOUNDRY_OPENAI_ENDPOINT;
  const azureApiKey = process.env.AZURE_OPENAI_API_KEY ?? process.env.FOUNDRY_OPENAI_API_KEY;
  const azureBearerToken = process.env.AZURE_OPENAI_BEARER_TOKEN ?? process.env.FOUNDRY_OPENAI_BEARER_TOKEN;
  const azureDeployment = process.env.AZURE_OPENAI_DEPLOYMENT ?? process.env.FOUNDRY_OPENAI_DEPLOYMENT;
  const azureApiVersion = process.env.AZURE_OPENAI_API_VERSION ?? "2024-10-21";
  const provider = azureEndpoint && azureDeployment && (azureApiKey || azureBearerToken) ? "azure-openai" : "copilot";
  const model = process.env.COPILOT_RULE_MODEL ?? (provider === "azure-openai" ? azureDeployment! : "gpt-5.4-mini");
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
          baseUrl: azureEndpoint!,
          apiKey: azureApiKey,
          bearerToken: azureBearerToken,
          azure: { apiVersion: azureApiVersion },
          modelId: model,
          wireModel: azureDeployment!
        }
      : undefined,
    required: generationMode === "required",
    disabled: generationMode === "fallback"
  };
}

function resolveBundledCopilotCliPath(): string | undefined {
  try {
    return createRequire(__filename).resolve("@github/copilot/npm-loader.js");
  } catch {
    return undefined;
  }
}

function parseCopilotRuleResponse(content: string): Partial<RuleGenerationResponse> & { rule?: Partial<Rule> } {
  const jsonText = extractJsonObject(content);
  const parsed = JSON.parse(jsonText) as Partial<RuleGenerationResponse> & { rule?: Partial<Rule> };
  if (!parsed.rule || typeof parsed.rule.pattern !== "string") {
    throw new Error("Copilot response did not include a rule.pattern string");
  }
  new RegExp(parsed.rule.pattern);
  return parsed;
}

function extractJsonObject(content: string): string {
  const trimmed = content.trim();
  if (trimmed.startsWith("{")) return trimmed;
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/u)?.[1]?.trim();
  if (fenced?.startsWith("{")) return fenced;
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);
  throw new Error("Copilot response did not contain JSON");
}

function safeErrorMessage(error: unknown): string {
  const rawMessage = error instanceof Error ? error.message : String(error);
  return rawMessage
    .replace(/gh[pousr]_[A-Za-z0-9_]+/gu, "[REDACTED_GITHUB_TOKEN]")
    .replace(/Bearer\s+[A-Za-z0-9._\-]+/gu, "Bearer [REDACTED]")
    .slice(0, 240);
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}