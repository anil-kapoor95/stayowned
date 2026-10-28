import type { ApiResult, FieldErrors } from "./client";
import type { AirbnbImportResponse } from "@/lib/airbnb-import";

/** Client for the Next.js route POST /api/airbnb-import (same answer format as the PHP API). */
export async function importAirbnbListing(
  url: string,
  token: string,
  signal?: AbortSignal,
): Promise<ApiResult<AirbnbImportResponse>> {
  let response: Response;
  try {
    response = await fetch("/api/airbnb-import", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ url }),
      signal,
      credentials: "omit",
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    return {
      ok: false,
      code: 0,
      message: "We couldn't reach the server. Check your connection and try again.",
      errors: {},
    };
  }

  let json: { status?: string; code?: number; message?: string; errors?: unknown; data?: unknown } | null = null;
  try {
    json = await response.json();
  } catch {
    json = null;
  }
  if (!json || typeof json !== "object") {
    return { ok: false, code: response.status || 500, message: "The server sent an unexpected answer. Please try again.", errors: {} };
  }
  const code = typeof json.code === "number" ? json.code : response.status;
  const message = typeof json.message === "string" ? json.message : "";
  if (json.status === "OK") {
    return { ok: true, code, message, data: json.data as AirbnbImportResponse };
  }
  const errors =
    json.errors && typeof json.errors === "object" && !Array.isArray(json.errors) ? (json.errors as FieldErrors) : {};
  return { ok: false, code, message: message || "Something went wrong. Please try again.", errors };
}
