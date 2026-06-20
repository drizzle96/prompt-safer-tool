import { createRequire } from "node:module";
import { access, chmod, copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Rule, RuleGenerationRequest, RuleGenerationResponse } from "../../../src/lib/types";

type WorkerInput = {
  request: RuleGenerationRequest;
  model: string;
  runtimePath?: string;
  runtimeUrl?: string;
  runtimeToken?: string;
  baseDirectory?: string;
  useLoggedInUser: boolean;
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
};

type WorkerOutput =
  | { ok: true; parsed: Partial<RuleGenerationResponse> & { rule?: Partial<Rule> } }
  | { ok: false; error: string };

async function main() {
  try {
    const input = JSON.parse(await readInput()) as WorkerInput;
    const parsed = await generateWithCopilotSdk(input);
    await writeOutput({ ok: true, parsed });
  } catch (error) {
    await writeOutput({ ok: false, error: safeErrorMessage(error) });
  }
}

async function generateWithCopilotSdk(input: WorkerInput): Promise<Partial<RuleGenerationResponse> & { rule?: Partial<Rule> }> {
  const { CopilotClient, RuntimeConnection, approveAll } = await import("@github/copilot-sdk");
  const runtimePath = await prepareRuntimePath(input.runtimePath ?? resolveBundledCopilotCliPath());
  const client = new CopilotClient({
    connection: input.runtimeUrl
      ? RuntimeConnection.forUri(input.runtimeUrl, { connectionToken: input.runtimeToken })
      : RuntimeConnection.forStdio({ path: runtimePath }),
    logLevel: "error",
    mode: "copilot-cli",
    baseDirectory: input.baseDirectory ?? path.join(os.tmpdir(), "safe-prompt-guard-copilot"),
    gitHubToken: process.env.COPILOT_GITHUB_TOKEN ?? process.env.GITHUB_TOKEN,
    useLoggedInUser: input.useLoggedInUser,
    env: process.env
  });
  await client.start();

  try {
    const session = await client.createSession({
      model: input.model,
      provider: input.azureProvider,
      onPermissionRequest: approveAll,
      systemMessage: {
        content: "You generate Safe Prompt Guard regex rules from dummy examples. Return exactly one compact JSON object and no markdown, prose, comments, or code fences."
      }
    });

    let finalContent = "";
    let deltaContent = "";
    const eventCounts: Record<string, number> = {};
    const eventDetails: string[] = [];
    const done = new Promise<void>((resolve) => {
      session.on((event) => {
        eventCounts[event.type] = (eventCounts[event.type] ?? 0) + 1;
        if (event.type === "session.error") {
          eventDetails.push(JSON.stringify(event.data).slice(0, 500));
        }
      });
      session.on("assistant.message", (event) => {
        finalContent = event.data.content;
      });
      session.on("assistant.message_delta", (event) => {
        deltaContent += event.data.deltaContent;
      });
      session.on("session.idle", () => resolve());
    });

    await session.send({
      prompt: `Create a JSON rule candidate for this dummy example: ${input.request.exampleText}

Return exactly this shape:
{"rule":{"name":"...","type":"ticket_id","pattern":"...","replacement":"[TICKET_ID]","severity":"medium","description":"...","examples":["..."],"defaultTransform":{"mode":"placeholder"}},"tests":[{"input":"...","expected":"..."}],"warnings":[],"falsePositiveRisk":"...","falseNegativeRisk":"..."}

Rules:
- If the example contains a ticket ID like PREFIX-YYYY-NNNN, generalize to pattern "\\bPREFIX-\\d{4}-\\d{4}\\b" instead of matching only one exact ID.
- Use only dummy examples.
- Do not include markdown or explanatory text.`
    });
    await done;
    await session.disconnect();

    return parseCopilotRuleResponse(finalContent || deltaContent, eventCounts, eventDetails);
  } finally {
    await client.stop();
  }
}

async function prepareRuntimePath(runtimePath: string | undefined): Promise<string | undefined> {
  if (!runtimePath) return undefined;
  try {
    await access(runtimePath, constants.X_OK);
    return runtimePath;
  } catch {
    if (!process.env.WEBSITE_SITE_NAME) return runtimePath;
    const targetDir = path.join(os.tmpdir(), "safe-prompt-copilot-runtime");
    const targetPath = path.join(targetDir, "copilot");
    await mkdir(targetDir, { recursive: true });
    await copyFile(runtimePath, targetPath);
    await chmod(targetPath, 0o755);
    return targetPath;
  }
}

function parseCopilotRuleResponse(content: string, eventCounts: Record<string, number>, eventDetails: string[]): Partial<RuleGenerationResponse> & { rule?: Partial<Rule> } {
  let jsonText: string;
  try {
    jsonText = extractJsonObject(content);
  } catch (error) {
    throw new Error(`${safeErrorMessage(error)} | events=${JSON.stringify(eventCounts)}${eventDetails.length > 0 ? ` | sessionErrors=${eventDetails.join(" ;; ")}` : ""}`);
  }
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
  throw new Error(`Copilot response did not contain JSON. Response preview: ${sanitizePreview(trimmed)}`);
}

function sanitizePreview(value: string): string {
  return value
    .replace(/gh[pousr]_[A-Za-z0-9_]+/gu, "[REDACTED_GITHUB_TOKEN]")
    .replace(/Bearer\s+[A-Za-z0-9._\-]+/gu, "Bearer [REDACTED]")
    .slice(0, 500);
}

function resolveBundledCopilotCliPath(): string | undefined {
  try {
    return createRequire(__filename).resolve("@github/copilot/npm-loader.js");
  } catch {
    return undefined;
  }
}

async function readInput(): Promise<string> {
  const inputPath = process.argv[2];
  if (inputPath) return readFile(inputPath, "utf8");
  return readStdin();
}

function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      data += chunk;
    });
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", reject);
  });
}

async function writeOutput(output: WorkerOutput) {
  const outputPath = process.argv[3];
  const payload = JSON.stringify(output);
  if (outputPath) {
    await writeFile(outputPath, payload, "utf8");
    return;
  }
  process.stdout.write(payload);
}

function safeErrorMessage(error: unknown): string {
  const rawMessage = error instanceof Error ? error.message : String(error);
  return rawMessage
    .replace(/gh[pousr]_[A-Za-z0-9_]+/gu, "[REDACTED_GITHUB_TOKEN]")
    .replace(/Bearer\s+[A-Za-z0-9._\-]+/gu, "Bearer [REDACTED]")
    .slice(0, 1000);
}

void main();
