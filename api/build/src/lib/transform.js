"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTransformPreviews = buildTransformPreviews;
exports.transformValue = transformValue;
exports.applyTransforms = applyTransforms;
const scan_1 = require("./scan");
function buildTransformPreviews(finding) {
    const transforms = [
        { mode: "masking", depth: "partial" },
        { mode: "masking", depth: "full" },
        { mode: "dummy", depth: "partial" },
        { mode: "dummy", depth: "full" },
        { mode: "placeholder" }
    ];
    return transforms.map((transform) => ({
        findingId: finding.id,
        originalValue: finding.value,
        transformedValue: transformValue({ finding, mode: transform.mode, depth: transform.depth }),
        mode: transform.mode,
        depth: transform.depth
    }));
}
function transformValue(input) {
    if (input.mode === "placeholder") {
        return placeholderFor(input.finding);
    }
    if (input.mode === "dummy") {
        return input.depth === "partial" ? partialDummy(input.finding) : fullDummy(input.finding);
    }
    return input.depth === "partial" ? partialMask(input.finding) : "*".repeat(input.finding.value.length);
}
function applyTransforms(request) {
    const targetFindings = selectTargetFindings(request);
    const patches = targetFindings
        .filter((finding) => finding.status === "pending" && hasValidPatchRange(request.text, finding))
        .map((finding) => ({
        finding,
        transformedValue: transformValue({ finding, mode: request.mode, depth: request.depth })
    }))
        .sort((first, second) => second.finding.start - first.finding.start);
    let transformedText = request.text;
    const applied = [];
    for (const patch of patches) {
        transformedText =
            transformedText.slice(0, patch.finding.start) + patch.transformedValue + transformedText.slice(patch.finding.end);
        applied.push({
            findingId: patch.finding.id,
            originalValue: patch.finding.value,
            transformedValue: patch.transformedValue,
            mode: request.mode,
            depth: request.mode === "placeholder" ? undefined : request.depth
        });
    }
    return {
        transformedText,
        applied: applied.reverse(),
        findings: (0, scan_1.scanText)({ text: transformedText, customRules: request.customRules }).findings
    };
}
function selectTargetFindings(request) {
    const requestedIds = new Set(request.findingIds ?? []);
    if (request.scope === "all") {
        return request.findings;
    }
    if (request.scope === "selected") {
        return request.findings.filter((finding) => requestedIds.has(finding.id));
    }
    const selectedTypes = new Set(request.findings.filter((finding) => requestedIds.has(finding.id)).map((finding) => finding.type));
    return request.findings.filter((finding) => selectedTypes.has(finding.type));
}
function partialMask(finding) {
    if (finding.type === "email") {
        const [local, domain] = finding.value.split("@");
        return `${local.slice(0, 2)}***@${domain}`;
    }
    if (finding.type === "phone") {
        return finding.value.replace(/^(\d{2,3})-\d{3,4}-(\d{4})$/u, "$1-****-$2");
    }
    if (finding.type === "ip_address") {
        const octets = finding.value.split(".");
        return `${octets[0]}.***.***.${octets[3]}`;
    }
    if (finding.type === "url" || finding.type === "internal_url") {
        return maskUrl(finding.value);
    }
    return "*".repeat(Math.max(4, Math.ceil(finding.value.length * 0.75)));
}
function partialDummy(finding) {
    if (finding.type === "email")
        return "user@example.com";
    if (finding.type === "phone")
        return "010-0000-0000";
    if (finding.type === "ip_address")
        return "10.0.0.1";
    if (finding.type === "url" || finding.type === "internal_url")
        return "https://service.example.internal/api/demo";
    if (finding.type === "bearer_token")
        return "Bearer dummy-token";
    if (finding.type === "api_key" || finding.type === "env_secret")
        return replaceAssignmentValue(finding, "dummy-api-key");
    return "dummy-token";
}
function fullDummy(finding) {
    if (finding.type === "email")
        return "user@example.com";
    if (finding.type === "phone")
        return "010-0000-0000";
    if (finding.type === "ip_address")
        return "192.0.2.10";
    if (finding.type === "url" || finding.type === "internal_url")
        return "https://example.com/api/demo";
    if (finding.type === "bearer_token")
        return "Bearer dummy-token";
    if (finding.type === "api_key" || finding.type === "env_secret")
        return replaceAssignmentValue(finding, "dummy-api-key");
    return "dummy-token";
}
function placeholderFor(finding) {
    const placeholders = {
        email: "[EMAIL]",
        phone: "[PHONE]",
        url: "[URL]",
        internal_url: "[URL]",
        ip_address: "[IP_ADDRESS]",
        bearer_token: "[BEARER_TOKEN]",
        api_key: "[API_KEY]",
        env_secret: "[SECRET]"
    };
    const placeholder = placeholders[finding.type] ?? `[${finding.type.toUpperCase()}]`;
    if (finding.type === "api_key" || finding.type === "env_secret") {
        return replaceAssignmentValue(finding, placeholder);
    }
    return placeholder;
}
function replaceAssignmentValue(finding, replacement) {
    const match = finding.value.match(/^([^:=\s]+\s*[:=]\s*)/u);
    return match ? `${match[1]}${replacement}` : replacement;
}
function maskUrl(value) {
    try {
        const url = new URL(value);
        return `${url.protocol}//***.${url.hostname.split(".").slice(-2).join(".")}/***`;
    }
    catch {
        return "https://***/***";
    }
}
function hasValidPatchRange(text, finding) {
    return finding.start >= 0 && finding.end > finding.start && finding.end <= text.length;
}
