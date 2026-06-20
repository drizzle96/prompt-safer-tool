import { scanText } from "../../../src/lib/scan";
import type { Rule, RuleGenerationRequest, RuleGenerationResponse } from "../../../src/lib/types";

export async function generateRuleCandidate(request: RuleGenerationRequest): Promise<RuleGenerationResponse> {
  const preScan = scanText({ text: request.exampleText });
  const highRiskFindings = preScan.findings.filter((finding) => finding.severity === "high");

  if (highRiskFindings.length > 0) {
    return fallbackRuleCandidate(request.exampleText, ["실제 secret처럼 보이는 값이 포함되어 fallback rule만 생성했습니다."]);
  }

  try {
    return await generateWithCopilotSdk(request);
  } catch {
    return fallbackRuleCandidate(request.exampleText, ["Copilot SDK generation is unavailable. Deterministic fallback was used."]);
  }
}

async function generateWithCopilotSdk(request: RuleGenerationRequest): Promise<RuleGenerationResponse> {
  const { CopilotClient, approveAll } = await import("@github/copilot-sdk");
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
    const done = new Promise<void>((resolve) => {
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

    const parsed = JSON.parse(content) as Partial<RuleGenerationResponse> & { rule?: Partial<Rule> };
    const fallback = fallbackRuleCandidate(request.exampleText, []);
    return {
      ...fallback,
      ...parsed,
      rule: { ...fallback.rule, ...parsed.rule },
      source: "copilot"
    };
  } finally {
    await client.stop();
  }
}

export function fallbackRuleCandidate(exampleText: string, warnings: string[] = []): RuleGenerationResponse {
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

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}