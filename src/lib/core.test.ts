import { describe, expect, it } from "vitest";
import { DEMO_PROMPT } from "./constants";
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
});