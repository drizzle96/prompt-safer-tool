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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRuleCandidate = generateRuleCandidate;
exports.fallbackRuleCandidate = fallbackRuleCandidate;
const scan_1 = require("../../../src/lib/scan");
async function generateRuleCandidate(request) {
    const preScan = (0, scan_1.scanText)({ text: request.exampleText });
    const highRiskFindings = preScan.findings.filter((finding) => finding.severity === "high");
    if (highRiskFindings.length > 0) {
        return fallbackRuleCandidate(request.exampleText, ["실제 secret처럼 보이는 값이 포함되어 fallback rule만 생성했습니다."]);
    }
    try {
        return await generateWithCopilotSdk(request);
    }
    catch {
        return fallbackRuleCandidate(request.exampleText, ["Copilot SDK generation is unavailable. Deterministic fallback was used."]);
    }
}
async function generateWithCopilotSdk(request) {
    const { CopilotClient, approveAll } = await Promise.resolve().then(() => __importStar(require("@github/copilot-sdk")));
    const client = new CopilotClient({ logLevel: "error" });
    await client.start();
    try {
        const session = await client.createSession({
            model: "gpt-5",
            onPermissionRequest: approveAll,
            systemMessage: {
                content: "Generate only compact JSON for a Safe Prompt Guard custom regex rule from dummy examples. Do not include markdown."
            }
        });
        let content = "";
        const done = new Promise((resolve) => {
            session.on("assistant.message", (event) => {
                content += event.data.content;
            });
            session.on("session.idle", () => resolve());
        });
        await session.send({
            prompt: `Create a JSON rule candidate for this dummy example. Fields: name, type, pattern, replacement, severity, description, examples, defaultTransform, tests, falsePositiveRisk, falseNegativeRisk. Example: ${request.exampleText}`
        });
        await done;
        await session.disconnect();
        const parsed = JSON.parse(content);
        const fallback = fallbackRuleCandidate(request.exampleText, []);
        return {
            ...fallback,
            ...parsed,
            rule: { ...fallback.rule, ...parsed.rule },
            source: "copilot"
        };
    }
    finally {
        await client.stop();
    }
}
function fallbackRuleCandidate(exampleText, warnings = []) {
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
        source: warnings.length > 0 ? "fallback" : "fallback"
    };
}
function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
