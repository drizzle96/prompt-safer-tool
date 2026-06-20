import type { SafeReviewRequest, SafeReviewResponse } from "../../../src/lib/types";

export function reviewTransformedText(request: SafeReviewRequest): SafeReviewResponse {
  const remainingConcerns: string[] = [];
  const ignoredCount = request.ignoredCount ?? 0;

  if (ignoredCount > 0) {
    remainingConcerns.push(`${ignoredCount}개의 ignored finding이 원본 값으로 남아 있을 수 있습니다.`);
  }

  if (/[A-Z]{2,}-\d{4}-\d{4}/.test(request.transformedText)) {
    remainingConcerns.push("조직별 티켓 번호처럼 보이는 값이 남아 있습니다.");
  }

  remainingConcerns.push("회사명, 프로젝트명, 고객사명이 민감한 내부 명칭인지 직접 확인하세요.");

  const riskLevel = ignoredCount > 0 ? "medium" : "low";

  return {
    riskLevel,
    summary:
      riskLevel === "low"
        ? "주요 민감정보가 치환된 상태로 보입니다."
        : "치환되지 않은 항목이 일부 남아 있을 수 있습니다.",
    remainingConcerns,
    recommendation: "AI에 보내기 전 남아 있는 고유명사와 ignored 항목을 한 번 더 확인하세요."
  };
}