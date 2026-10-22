/**
 * Client for the PHP back end (api.php -> pjJabbApi).
 *
 * Every call is a POST to `${NEXT_PUBLIC_API_URL}?action=<action>` and the server
 * answers `{ status: "OK" | "ERR", code, message, errors?: {field: text}, data? }`.
 */

export type FieldErrors = Record<string, string>;

export type ApiSuccess<T> = { ok: true; code: number; message: string; data: T };
export type ApiFailure<T = unknown> = {
  ok: false;
  code: number;
  message: string;
  errors: FieldErrors;
  /** Some errors carry data too (e.g. 409 returns the sign-up state). */
  data?: T;
};
export type ApiResult<T> = ApiSuccess<T> | ApiFailure<T>;

type Body = Record<string, string | number | boolean | null | undefined> | FormData;

export const API_URL = process.env.NEXT_PUBLIC_API_URL?.trim() || "";

export async function apiRequest<T>(
  action: string,
  body: Body = {},
  options: { token?: string | null; signal?: AbortSignal } = {},
): Promise<ApiResult<T>> {
  if (!API_URL) {
    return {
      ok: false,
      code: 0,
      message: "The sign-up server is not configured (NEXT_PUBLIC_API_URL is missing).",
      errors: {},
    };
  }

  let payload: FormData;
  if (body instanceof FormData) {
    payload = body;
  } else {
    payload = new FormData();
    for (const [key, value] of Object.entries(body)) {
      if (value !== undefined && value !== null) payload.append(key, String(value));
    }
  }
  if (options.token && !payload.has("signup_token")) payload.append("signup_token", options.token);

  let response: Response;
  try {
    response = await fetch(`${API_URL}?action=${encodeURIComponent(action)}`, {
      method: "POST",
      body: payload,
      signal: options.signal,
      // Cookies are not needed: the sign-up token travels in the body.
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

  let json: { status?: string; code?: number; message?: string; errors?: unknown; data?: T } | null = null;
  try {
    json = await response.json();
  } catch {
    json = null;
  }

  if (!json || typeof json !== "object") {
    return {
      ok: false,
      code: response.status || 500,
      message: "The server sent an unexpected answer. Please try again.",
      errors: {},
    };
  }

  const code = typeof json.code === "number" ? json.code : response.status;
  const message = typeof json.message === "string" ? json.message : "";
  if (json.status === "OK") {
    return { ok: true, code, message, data: (json.data ?? {}) as T };
  }
  const errors =
    json.errors && typeof json.errors === "object" && !Array.isArray(json.errors) ? (json.errors as FieldErrors) : {};
  return { ok: false, code, message: message || "Something went wrong. Please try again.", errors, data: json.data };
}
