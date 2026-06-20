"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_module_1 = require("node:module");
const promises_1 = require("node:fs/promises");
const node_fs_1 = require("node:fs");
const node_os_1 = __importDefault(require("node:os"));
const node_path_1 = __importDefault(require("node:path"));
async function main() {
    try {
        const input = JSON.parse(await readInput());
        const parsed = await generateWithCopilotSdk(input);
        await writeOutput({ ok: true, parsed });
    }
    catch (error) {
        await writeOutput({ ok: false, error: safeErrorMessage(error) });
    }
}
async function generateWithCopilotSdk(input) {
    const { CopilotClient, RuntimeConnection, approveAll } = await Promise.resolve().then(() => __importStar(require("@github/copilot-sdk")));
    const runtimePath = await prepareRuntimePath(input.runtimePath ?? resolveBundledCopilotCliPath());
    const client = new CopilotClient({
        connection: input.runtimeUrl
            ? RuntimeConnection.forUri(input.runtimeUrl, { connectionToken: input.runtimeToken })
            : RuntimeConnection.forStdio({ path: runtimePath }),
        logLevel: "error",
        mode: "copilot-cli",
        baseDirectory: input.baseDirectory ?? node_path_1.default.join(node_os_1.default.tmpdir(), "safe-prompt-guard-copilot"),
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
        const eventCounts = {};
        const eventDetails = [];
        const done = new Promise((resolve) => {
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
    }
    finally {
        await client.stop();
    }
}
async function prepareRuntimePath(runtimePath) {
    if (!runtimePath)
        return undefined;
    try {
        await (0, promises_1.access)(runtimePath, node_fs_1.constants.X_OK);
        return runtimePath;
    }
    catch {
        if (!process.env.WEBSITE_SITE_NAME)
            return runtimePath;
        const targetDir = node_path_1.default.join(node_os_1.default.tmpdir(), "safe-prompt-copilot-runtime");
        const targetPath = node_path_1.default.join(targetDir, "copilot");
        await (0, promises_1.mkdir)(targetDir, { recursive: true });
        await (0, promises_1.copyFile)(runtimePath, targetPath);
        await (0, promises_1.chmod)(targetPath, 0o755);
        return targetPath;
    }
}
function parseCopilotRuleResponse(content, eventCounts, eventDetails) {
    let jsonText;
    try {
        jsonText = extractJsonObject(content);
    }
    catch (error) {
        throw new Error(`${safeErrorMessage(error)} | events=${JSON.stringify(eventCounts)}${eventDetails.length > 0 ? ` | sessionErrors=${eventDetails.join(" ;; ")}` : ""}`);
    }
    const parsed = JSON.parse(jsonText);
    if (!parsed.rule || typeof parsed.rule.pattern !== "string") {
        throw new Error("Copilot response did not include a rule.pattern string");
    }
    new RegExp(parsed.rule.pattern);
    return parsed;
}
function extractJsonObject(content) {
    const trimmed = content.trim();
    if (trimmed.startsWith("{"))
        return trimmed;
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/u)?.[1]?.trim();
    if (fenced?.startsWith("{"))
        return fenced;
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start)
        return trimmed.slice(start, end + 1);
    throw new Error(`Copilot response did not contain JSON. Response preview: ${sanitizePreview(trimmed)}`);
}
function sanitizePreview(value) {
    return value
        .replace(/gh[pousr]_[A-Za-z0-9_]+/gu, "[REDACTED_GITHUB_TOKEN]")
        .replace(/Bearer\s+[A-Za-z0-9._\-]+/gu, "Bearer [REDACTED]")
        .slice(0, 500);
}
function resolveBundledCopilotCliPath() {
    try {
        return (0, node_module_1.createRequire)(__filename).resolve("@github/copilot/npm-loader.js");
    }
    catch {
        return undefined;
    }
}
async function readInput() {
    const inputPath = process.argv[2];
    if (inputPath)
        return (0, promises_1.readFile)(inputPath, "utf8");
    return readStdin();
}
function readStdin() {
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
async function writeOutput(output) {
    const outputPath = process.argv[3];
    const payload = JSON.stringify(output);
    if (outputPath) {
        await (0, promises_1.writeFile)(outputPath, payload, "utf8");
        return;
    }
    process.stdout.write(payload);
}
function safeErrorMessage(error) {
    const rawMessage = error instanceof Error ? error.message : String(error);
    return rawMessage
        .replace(/gh[pousr]_[A-Za-z0-9_]+/gu, "[REDACTED_GITHUB_TOKEN]")
        .replace(/Bearer\s+[A-Za-z0-9._\-]+/gu, "Bearer [REDACTED]")
        .slice(0, 1000);
}
void main();
