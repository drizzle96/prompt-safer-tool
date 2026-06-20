import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { scanText } from "./scan";
import { applyTransforms } from "./transform";
import type { Finding } from "./types";

describe("core engine properties", () => {
  it("accepted findings never overlap", () => {
    fc.assert(
      fc.property(fc.array(secretSnippet(), { minLength: 0, maxLength: 20 }), (snippets) => {
        const text = snippets.join(" ");
        const findings = scanText({ text }).findings;

        for (let index = 1; index < findings.length; index += 1) {
          expect(findings[index - 1].end <= findings[index].start).toBe(true);
        }
      })
    );
  });

  it("finding ranges match source slices", () => {
    fc.assert(
      fc.property(fc.array(secretSnippet(), { minLength: 1, maxLength: 12 }), (snippets) => {
        const text = snippets.join("\n");
        const findings = scanText({ text }).findings;

        for (const finding of findings) {
          expect(finding.start).toBeLessThan(finding.end);
          expect(text.slice(finding.start, finding.end)).toBe(finding.value);
        }
      })
    );
  });

  it("full masking removes original selected values", () => {
    fc.assert(
      fc.property(fc.array(secretSnippet(), { minLength: 1, maxLength: 8 }), (snippets) => {
        const text = snippets.join(" ");
        const scan = scanText({ text });
        const masked = applyTransforms({ text, findings: scan.findings, mode: "masking", depth: "full", scope: "all" });

        for (const applied of masked.applied) {
          expect(masked.transformedText).not.toContain(applied.originalValue);
        }
      })
    );
  });
});

function secretSnippet(): fc.Arbitrary<string> {
  return fc.oneof(
    fc.emailAddress(),
    fc.constant("Bearer abc.def.ghi"),
    fc.constant("API_KEY=sk-demo-1234567890"),
    fc.constant("https://pay-prod.example.internal/api/v1/orders"),
    fc.constant("10.10.20.30")
  );
}

export function makeFinding(overrides: Partial<Finding> = {}): Finding {
  return {
    id: "f_test_1",
    ruleId: "0:test",
    type: "email",
    value: "test@example.com",
    start: 0,
    end: 16,
    severity: "medium",
    reason: "test",
    status: "pending",
    suggestedTransform: {
      findingId: "f_test_1",
      originalValue: "test@example.com",
      transformedValue: "te***@example.com",
      mode: "masking",
      depth: "partial"
    },
    availableTransforms: [],
    ...overrides
  };
}