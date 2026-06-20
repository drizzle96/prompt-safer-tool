import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from "@azure/functions";
import { generateRuleCandidate } from "../services/ruleGenerate";
import { jsonResponse, readJsonBody, safeErrorResponse } from "../shared/http";
import { validateRuleExample } from "../../../src/lib/validation";

export async function ruleGenerate(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const body = (await readJsonBody(request)) as { exampleText?: unknown };
    const validation = validateRuleExample(body.exampleText);
    if (!validation.ok) return safeErrorResponse(validation.error, validation.statusCode);
    return jsonResponse(await generateRuleCandidate({ exampleText: validation.value }));
  } catch {
    return safeErrorResponse("Invalid JSON request body.", 400);
  }
}

app.http("ruleGenerate", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "rules/generate",
  handler: ruleGenerate
});