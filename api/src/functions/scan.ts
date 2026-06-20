import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from "@azure/functions";
import { scanText } from "../../../src/lib/scan";
import { jsonResponse, readJsonBody, safeErrorResponse } from "../shared/http";
import { validateScanRequest } from "../shared/validators";

export async function scan(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const validation = validateScanRequest(await readJsonBody(request));
    if (!validation.ok) return safeErrorResponse(validation.error, validation.statusCode);
    return jsonResponse(scanText(validation.value));
  } catch {
    return safeErrorResponse("Invalid JSON request body.", 400);
  }
}

app.http("scan", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "scan",
  handler: scan
});