import { API_ROUTES } from "./constants";
import { scanText } from "./scan";
import { applyTransforms } from "./transform";
import type {
  MaskRequest,
  MaskResponse,
  RuleGenerationRequest,
  RuleGenerationResponse,
  RulePreviewRequest,
  RulePreviewResponse,
  SafeReviewRequest,
  SafeReviewResponse,
  ScanRequest,
  ScanResponse
} from "./types";

export async function scanPrompt(request: ScanRequest): Promise<ScanResponse> {
  return postJson(API_ROUTES.scan, request, () => scanText(request));
}

export async function maskPrompt(request: MaskRequest): Promise<MaskResponse> {
  return postJson(API_ROUTES.mask, request, () => applyTransforms(request));
}

export async function runSafeReview(request: SafeReviewRequest): Promise<SafeReviewResponse> {
  return postJson(API_ROUTES.safeReview, request, () => localSafeReview(request));
}

export async function generateRule(request: RuleGenerationRequest): Promise<RuleGenerationResponse> {
  return postJson(API_ROUTES.ruleGenerate, request, () => localRuleGeneration(request));
}

export async function previewRule(request: RulePreviewRequest): Promise<RulePreviewResponse> {
  return postJson(API_ROUTES.rulePreview, request, () => localRulePreview(request));
}

async function postJson<T>(path: string, body: unknown, fallback: () => T): Promise<T> {
  if (import.meta.env.DEV) {
    return fallback();
  }

  try {
    const response = await fetch(buildApiUrl(path), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!response.ok) throw new Error("API request failed.");
    return (await response.json()) as T;
  } catch {
    return fallback();
  }
}

function buildApiUrl(path: string): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (!baseUrl) return path;
  return `${baseUrl.replace(/\/$/u, "")}${path}`;
}

function localSafeReview(request: SafeReviewRequest): SafeReviewResponse {
  const remainingConcerns = ["회사명, 프로젝트명, 고객사명이 민감한 내부 명칭인지 직접 확인하세요."];
  const ignoredCount = request.ignoredCount ?? 0;

  if (ignoredCount > 0) {
    remainingConcerns.unshift(`${ignoredCount}개의 ignored finding이 원본 값으로 남아 있을 수 있습니다.`);
  }

  return {
    riskLevel: ignoredCount > 0 ? "medium" : "low",
    summary: ignoredCount > 0 ? "치환되지 않은 항목이 일부 남아 있을 수 있습니다." : "주요 민감정보가 치환된 상태로 보입니다.",
    remainingConcerns,
    recommendation: "AI에 보내기 전 남아 있는 고유명사와 ignored 항목을 한 번 더 확인하세요."
  };
}

function localRuleGeneration(request: RuleGenerationRequest): RuleGenerationResponse {
  const prefix = request.exampleText.match(/\b([A-Z]{2,})-\d{4}-\d{4}\b/)?.[1] ?? "DEMO";
  const replacement = "[TICKET_ID]";
  return {
    rule: {
      id: "custom_ticket_id",
      name: "internal_ticket_id",
      type: "ticket_id",
      pattern: `\\b${prefix}-\\d{4}-\\d{4}\\b`,
      replacement,
      severity: "medium",
      description: `${prefix}-YYYY-NNNN 형식의 조직별 티켓 번호`,
      examples: [`${prefix}-2026-0001`],
      source: "copilot-generated",
      enabled: true,
      defaultTransform: { mode: "placeholder" }
    },
    tests: [{ input: `${prefix}-2026-0001 확인해주세요.`, expected: `${replacement} 확인해주세요.` }],
    warnings: ["Local deterministic fallback was used in development mode."],
    falsePositiveRisk: "같은 형식의 일반 문서 번호가 오탐될 수 있습니다.",
    falseNegativeRisk: `${prefix} 외 다른 prefix는 탐지하지 못합니다.`,
    source: "fallback",
    generation: {
      engine: "fallback",
      sdkConfigured: false,
      sdkAttempted: false,
      runtimeMode: "fallback-only",
      provider: "copilot",
      model: "local-fallback",
      fallbackReason: "Local Vite development mode uses deterministic fallback."
    }
  };
}

function localRulePreview(request: RulePreviewRequest): RulePreviewResponse {
  const regex = new RegExp(request.rule.pattern, "g");
  const transformedText = request.sampleText.replace(regex, request.rule.replacement);
  const matches = scanText({ text: request.sampleText, customRules: [request.rule] }).findings.filter((finding) => finding.type === request.rule.type);
  return {
    matched: matches.length > 0,
    transformedText,
    matches,
    warnings: matches.length > 0 ? [] : ["Rule did not match the sample text."]
  };
}