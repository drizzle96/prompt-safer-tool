export const MAX_PROMPT_LENGTH = 10_000;
export const MAX_RULE_EXAMPLE_LENGTH = 2_000;
export const MAX_RULE_PATTERN_LENGTH = 500;

export const API_ROUTES = {
  scan: "/api/scan",
  mask: "/api/mask",
  ruleGenerate: "/api/rules/generate",
  rulePreview: "/api/rules/preview",
  safeReview: "/api/safe-review"
} as const;

export const DEMO_PROMPT = `동그라미증권 운영계에서 결제 API 호출이 실패합니다.
티켓 번호는 DEMO-2026-0001 입니다.
담당자 이메일은 dev.owner@example.com 입니다.
내부 URL은 https://pay-prod.example.internal/api/v1/orders 입니다.
Authorization: Bearer eyJhbGciOi...
API_KEY=sk-demo-1234567890
서버 IP는 10.10.20.30 입니다.`;