import type { HttpRequest, HttpResponseInit } from "@azure/functions";
import { sanitizeError } from "../../../src/lib/validation";

export async function readJsonBody<T>(request: HttpRequest): Promise<T> {
  return (await request.json()) as T;
}

export function jsonResponse(body: unknown, status = 200): HttpResponseInit {
  return {
    status,
    jsonBody: body,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  };
}

export function safeErrorResponse(error: unknown, status = 400): HttpResponseInit {
  return jsonResponse({ error: sanitizeError(error) }, status);
}