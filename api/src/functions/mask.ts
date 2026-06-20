import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from "@azure/functions";
import { applyTransforms } from "../../../src/lib/transform";
import { jsonResponse, readJsonBody, safeErrorResponse } from "../shared/http";
import { validateMaskRequest } from "../shared/validators";

export async function mask(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const validation = validateMaskRequest(await readJsonBody(request));
    if (!validation.ok) return safeErrorResponse(validation.error, validation.statusCode);
    return jsonResponse(applyTransforms(validation.value));
  } catch {
    return safeErrorResponse("Invalid JSON request body.", 400);
  }
}

app.http("mask", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "mask",
  handler: mask
});