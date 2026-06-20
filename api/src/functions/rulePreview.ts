import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from "@azure/functions";
import { previewRule } from "../services/rulePreview";
import { jsonResponse, readJsonBody, safeErrorResponse } from "../shared/http";
import { validateRulePreviewRequest } from "../shared/validators";

export async function rulePreview(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const validation = validateRulePreviewRequest(await readJsonBody(request));
    if (!validation.ok) return safeErrorResponse(validation.error, validation.statusCode);
    return jsonResponse(previewRule(validation.value));
  } catch {
    return safeErrorResponse("Invalid JSON request body.", 400);
  }
}

app.http("rulePreview", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "rules/preview",
  handler: rulePreview
});