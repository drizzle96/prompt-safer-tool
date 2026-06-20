import type { DefaultTransform, Rule, Severity } from "./types";

export type DetectionRule = Rule & {
  regex: RegExp;
  order: number;
  reason: string;
};

type BuiltInRuleConfig = {
  id: string;
  name: string;
  type: string;
  pattern: string;
  flags: string;
  replacement: string;
  severity: Severity;
  description: string;
  examples: string[];
  defaultTransform: DefaultTransform;
  reason: string;
};

const BUILT_IN_RULES: BuiltInRuleConfig[] = [
  {
    id: "bearer_token",
    name: "Bearer Token",
    type: "bearer_token",
    pattern: "Bearer\\s+[A-Za-z0-9._\\-]+",
    flags: "gi",
    replacement: "[BEARER_TOKEN]",
    severity: "high",
    description: "Authorization header bearer token",
    examples: ["Bearer eyJhbGciOi..."],
    defaultTransform: { mode: "placeholder" },
    reason: "Bearer token은 외부 AI에 그대로 입력하면 계정 또는 시스템 접근 위험이 있습니다."
  },
  {
    id: "env_secret",
    name: ".env Secret",
    type: "env_secret",
    pattern: "[A-Z0-9_]*(KEY|SECRET|TOKEN|PASSWORD)[A-Z0-9_]*\\s*=\\s*[^\\n]+",
    flags: "gi",
    replacement: "[SECRET]",
    severity: "high",
    description: "Environment-style key value secret",
    examples: ["API_KEY=sk-demo-1234567890"],
    defaultTransform: { mode: "placeholder" },
    reason: ".env 스타일 secret은 원본 값을 완전히 제거하는 것이 안전합니다."
  },
  {
    id: "api_key",
    name: "API Key-like Secret",
    type: "api_key",
    pattern: "(api[_-]?key|secret|token)\\s*[:=]\\s*[^\\s]+",
    flags: "gi",
    replacement: "[API_KEY]",
    severity: "high",
    description: "API key, secret, or token assignment",
    examples: ["token=abc123"],
    defaultTransform: { mode: "placeholder" },
    reason: "API key나 token 형태의 값은 secret일 가능성이 높습니다."
  },
  {
    id: "url",
    name: "URL",
    type: "url",
    pattern: "https?:\\/\\/[^\\s]+",
    flags: "gi",
    replacement: "[URL]",
    severity: "medium",
    description: "HTTP or HTTPS URL",
    examples: ["https://example.com/api/demo"],
    defaultTransform: { mode: "dummy", depth: "partial" },
    reason: "URL은 내부 시스템이나 운영 경로를 드러낼 수 있습니다."
  },
  {
    id: "email",
    name: "Email",
    type: "email",
    pattern: "\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}\\b",
    flags: "g",
    replacement: "[EMAIL]",
    severity: "medium",
    description: "Email address",
    examples: ["dev.owner@example.com"],
    defaultTransform: { mode: "masking", depth: "partial" },
    reason: "이메일 주소는 개인식별정보일 수 있습니다."
  },
  {
    id: "phone",
    name: "Phone Number",
    type: "phone",
    pattern: "\\b\\d{2,3}-\\d{3,4}-\\d{4}\\b",
    flags: "g",
    replacement: "[PHONE]",
    severity: "medium",
    description: "Phone-like number",
    examples: ["010-1234-5678"],
    defaultTransform: { mode: "masking", depth: "partial" },
    reason: "전화번호는 개인식별정보일 수 있습니다."
  },
  {
    id: "ip_address",
    name: "IPv4-like Address",
    type: "ip_address",
    pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b",
    flags: "g",
    replacement: "[IP_ADDRESS]",
    severity: "medium",
    description: "IPv4-like address",
    examples: ["10.10.20.30"],
    defaultTransform: { mode: "masking", depth: "partial" },
    reason: "IP 주소는 내부 인프라 정보를 드러낼 수 있습니다."
  }
];

const INTERNAL_HOST_HINTS = ["internal", "local", "corp", "prod", "dev", "stg", "stage", "private"];

export function getBuiltInRules(): DetectionRule[] {
  return BUILT_IN_RULES.map((rule, index) => ({
    ...rule,
    source: "built-in",
    enabled: true,
    regex: new RegExp(rule.pattern, ensureGlobalFlag(rule.flags)),
    order: index
  }));
}

export function normalizeCustomRule(rule: Rule, order: number): DetectionRule | null {
  if (!rule.enabled || !rule.pattern) {
    return null;
  }

  try {
    return {
      ...rule,
      regex: new RegExp(rule.pattern, "g"),
      order,
      reason: rule.description || "Custom rule matched this value."
    };
  } catch {
    return null;
  }
}

export function classifyUrlType(value: string): "url" | "internal_url" {
  try {
    const hostname = new URL(value).hostname.toLowerCase();
    return INTERNAL_HOST_HINTS.some((hint) => hostname.includes(hint)) ? "internal_url" : "url";
  } catch {
    return "url";
  }
}

export function internalUrlRuleFrom(rule: DetectionRule): DetectionRule {
  return {
    ...rule,
    id: "internal_url",
    ruleId: undefined,
    name: "Internal URL",
    type: "internal_url",
    replacement: "[URL]",
    severity: "high",
    defaultTransform: { mode: "placeholder" },
    reason: "내부 URL은 시스템 구조와 운영 환경 정보를 드러낼 수 있습니다."
  } as DetectionRule;
}

function ensureGlobalFlag(flags: string): string {
  return flags.includes("g") ? flags : `${flags}g`;
}