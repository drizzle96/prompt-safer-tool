import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from "@azure/functions";
import { reviewTransformedText } from "../services/safeReview";
import { jsonResponse, readJsonBody, safeErrorResponse } from "../shared/http";
import { validateSafeReviewRequest } from "../shared/validators";

export async function safeReview(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const validation = validateSafeReviewRequest(await readJsonBody(request));
    if (!validation.ok) return safeErrorResponse(validation.error, validation.statusCode);
    return jsonResponse(reviewTransformedText(validation.value));
  } catch {
    return safeErrorResponse("Invalid JSON request body.", 400);
  }
}

app.http("safeReview", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "safe-review",
  handler: safeReview
});