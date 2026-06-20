import { transformValue } from "./transform";
import type { ApplyScope, Finding, TransformDepth, TransformMode } from "./types";

export type AppliedTransformChoice = {
  mode: TransformMode;
  depth?: TransformDepth;
};

export function composeSafeOutput(
  sourceText: string,
  findings: Finding[],
  appliedChoices: Record<string, AppliedTransformChoice>
): string {
  const patches = findings
    .filter((finding) => appliedChoices[finding.id] && hasValidSourceRange(sourceText, finding))
    .map((finding) => ({
      finding,
      transformedValue: transformValue({ finding, ...appliedChoices[finding.id] })
    }))
    .sort((first, second) => second.finding.start - first.finding.start);

  let safeOutput = sourceText;

  for (const patch of patches) {
    safeOutput = safeOutput.slice(0, patch.finding.start) + patch.transformedValue + safeOutput.slice(patch.finding.end);
  }

  return safeOutput;
}

export function getScopedFindingIds(findings: Finding[], selectedFindingId: string, scope: ApplyScope): string[] {
  if (scope === "all") return findings.map((finding) => finding.id);
  if (scope === "selected") return findings.filter((finding) => finding.id === selectedFindingId).map((finding) => finding.id);

  const selectedFinding = findings.find((finding) => finding.id === selectedFindingId);
  if (!selectedFinding) return [];

  return findings.filter((finding) => finding.type === selectedFinding.type).map((finding) => finding.id);
}

export function getFindingDisplayValue(
  finding: Finding,
  appliedChoices: Record<string, AppliedTransformChoice>
): string {
  const choice = appliedChoices[finding.id];
  return choice ? transformValue({ finding, ...choice }) : finding.value;
}

function hasValidSourceRange(sourceText: string, finding: Finding): boolean {
  return finding.start >= 0 && finding.end > finding.start && finding.end <= sourceText.length && sourceText.slice(finding.start, finding.end) === finding.value;
}
