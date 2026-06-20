import { describe, expect, it } from "vitest";
import { DEMO_PROMPT } from "./constants";
import { composeSafeOutput, getFindingDisplayValue, getScopedFindingIds } from "./output";
import { scanText } from "./scan";
import { applyTransforms } from "./transform";

describe("core scan and transform engine", () => {
  it("detects demo prompt risks", () => {
    const result = scanText({ text: DEMO_PROMPT });
    const types = result.findings.map((finding) => finding.type);

    expect(types).toContain("email");
    expect(types).toContain("internal_url");
    expect(types).toContain("bearer_token");
    expect(types).toContain("env_secret");
    expect(types).toContain("ip_address");
  });

  it("prioritizes bearer token over generic token-like matches", () => {
    const text = "Authorization: Bearer abc.def.ghi";
    const result = scanText({ text });

    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].type).toBe("bearer_token");
  });

  it("applies placeholder transforms by all scope", () => {
    const scan = scanText({ text: DEMO_PROMPT });
    const masked = applyTransforms({
      text: DEMO_PROMPT,
      findings: scan.findings,
      mode: "placeholder",
      scope: "all"
    });

    expect(masked.transformedText).toContain("[EMAIL]");
    expect(masked.transformedText).toContain("[URL]");
    expect(masked.transformedText).toContain("[BEARER_TOKEN]");
    expect(masked.transformedText).toContain("API_KEY=[SECRET]");
    expect(masked.transformedText).toContain("[IP_ADDRESS]");
    expect(masked.transformedText).not.toContain("dev.owner@example.com");
    expect(masked.transformedText).not.toContain("eyJhbGciOi");
    expect(masked.findings).toHaveLength(0);
  });

  it("does not re-detect safe bracket placeholders in env assignments", () => {
    const result = scanText({ text: "API_KEY=[SECRET]\nTOKEN=[API_KEY]" });

    expect(result.findings).toHaveLength(0);
  });

  it("applies selected partial email masking", () => {
    const text = "담당자 이메일은 dev.owner@example.com 입니다.";
    const scan = scanText({ text });
    const email = scan.findings.find((finding) => finding.type === "email");

    expect(email).toBeDefined();

    const masked = applyTransforms({
      text,
      findings: scan.findings,
      findingIds: [email!.id],
      mode: "masking",
      depth: "partial",
      scope: "selected"
    });

    expect(masked.transformedText).toContain("de***@example.com");
  });

  it("composes safe output without mutating the original prompt", () => {
    const original = "담당자 이메일은 dev.owner@example.com 이고 서버 IP는 10.10.20.30 입니다.";
    const scan = scanText({ text: original });
    const email = scan.findings.find((finding) => finding.type === "email");
    const ipAddress = scan.findings.find((finding) => finding.type === "ip_address");

    expect(email).toBeDefined();
    expect(ipAddress).toBeDefined();

    const safeOutput = composeSafeOutput(original, scan.findings, {
      [email!.id]: { mode: "placeholder" },
      [ipAddress!.id]: { mode: "masking", depth: "partial" }
    });

    expect(original).toContain("dev.owner@example.com");
    expect(original).toContain("10.10.20.30");
    expect(safeOutput).toContain("[EMAIL]");
    expect(safeOutput).toContain("10.***.***.30");
  });

  it("selects same-type finding ids for output-only transforms", () => {
    const scan = scanText({ text: "a@example.com b@example.com 10.10.20.30" });
    const email = scan.findings.find((finding) => finding.type === "email");

    expect(email).toBeDefined();

    const selectedIds = getScopedFindingIds(scan.findings, email!.id, "same_type");

    expect(selectedIds).toHaveLength(2);
    expect(scan.findings.filter((finding) => selectedIds.includes(finding.id)).every((finding) => finding.type === "email")).toBe(true);
  });

  it("displays transformed finding values outside the original prompt editor", () => {
    const original = "담당자 이메일은 dev.owner@example.com 입니다.";
    const scan = scanText({ text: original });
    const email = scan.findings.find((finding) => finding.type === "email");

    expect(email).toBeDefined();
    expect(getFindingDisplayValue(email!, {})).toBe("dev.owner@example.com");
    expect(getFindingDisplayValue(email!, { [email!.id]: { mode: "placeholder" } })).toBe("[EMAIL]");
  });
});