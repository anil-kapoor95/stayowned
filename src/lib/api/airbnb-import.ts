import type { ApiResult, FieldErrors } from "./client";
import type { AirbnbImportResponse } from "@/lib/airbnb-import";
import type { SignupState } from "./signup";

/** POST to a Next.js import route (same answer format as the PHP API). */
async function postImportRoute<T>(path: string, body: unknown, token: string, signal?: AbortSignal): Promise<ApiResult<T>> {
  let response: Response;
  try {
    response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
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
    return { ok: true, code, message, data: json.data as T };
  }
  const errors =
    json.errors && typeof json.errors === "object" && !Array.isArray(json.errors) ? (json.errors as FieldErrors) : {};
  return { ok: false, code, message: message || "Something went wrong. Please try again.", errors };
}

/** Client for POST /api/airbnb-import: reads the listing for the property form (nothing is saved). */
export function importAirbnbListing(url: string, token: string, signal?: AbortSignal) {
  return postImportRoute<AirbnbImportResponse>("/api/airbnb-import", { url }, token, signal);
}

export interface AirbnbPhotosResponse {
  state: SignupState;
  added: number;
  failed: number;
  /** Photos left out because the property reached its photo limit. */
  skipped: number;
}

/** Client for POST /api/airbnb-import/photos: adds the imported listing's photos to the property (step 4). */
export function importAirbnbPhotos(listingId: string, photos: string[], token: string, signal?: AbortSignal) {
  return postImportRoute<AirbnbPhotosResponse>("/api/airbnb-import/photos", { listing_id: listingId, photos }, token, signal);
}
