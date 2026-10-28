import { createHash } from "node:crypto";
import {
  isEmptyListing,
  parseAirbnbListingUrl,
  sanitizeImportedListing,
  type AirbnbImportResponse,
} from "@/lib/airbnb-import";
import { signupApi } from "@/lib/api/signup";
import { getImportProvider } from "@/lib/server/airbnb-import";

/**
 * POST /api/airbnb-import — reads an Airbnb listing for the property form (step 3).
 *
 * Headers: Authorization: Bearer <signup_token>, Content-Type: application/json
 * Body:    { "url": "https://www.airbnb.com/rooms/12345678" }
 * Answer:  { status: "OK" | "ERR", code, message, errors?: {url}, data?: AirbnbImportResponse }
 *
 * Nothing is saved here: the host reviews the filled-in form and saves it with Continue.
 * The data comes from the listing's public page (see src/lib/server/airbnb-import.ts).
 */

const MAX_BODY_BYTES = 2048;
const PROVIDER_TIMEOUT_MS = 15_000;
const RATE_LIMIT = { max: 10, windowMs: 10 * 60_000 };

// Per-token request counts (per server instance; a shared store is needed when running several instances).
const attempts = new Map<string, { count: number; resetAt: number }>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + RATE_LIMIT.windowMs });
    if (attempts.size > 5000) for (const [k, v] of attempts) if (v.resetAt <= now) attempts.delete(k);
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT.max;
}

function respond(code: number, message: string, extra: { errors?: Record<string, string>; data?: unknown } = {}) {
  return Response.json(
    { status: code < 300 ? "OK" : "ERR", code, message, ...extra },
    { status: code, headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  if (!(request.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) {
    return respond(415, "Send the listing link as JSON (Content-Type: application/json).");
  }
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    return respond(413, "The request is too large.");
  }
  const token = /^Bearer\s+([a-f0-9]{64})$/i.exec((request.headers.get("authorization") ?? "").trim())?.[1];
  if (!token) return respond(401, "Sign-up token is missing or invalid.");

  const text = await request.text();
  if (Buffer.byteLength(text) > MAX_BODY_BYTES) return respond(413, "The request is too large.");
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return respond(400, "The request body is not valid JSON.");
  }
  const rawUrl = body && typeof body === "object" ? (body as { url?: unknown }).url : undefined;
  const parsed = parseAirbnbListingUrl(typeof rawUrl === "string" ? rawUrl : "");
  if (!parsed.ok) return respond(422, "Validation failed", { errors: { url: parsed.error } });

  if (rateLimited(createHash("sha256").update(token).digest("hex"))) {
    return respond(429, "Too many imports. Please wait a few minutes and try again.");
  }

  // Signs the host in (token) and stops duplicates, using the calendar links saved in the back office.
  const check = await signupApi.checkAirbnbListing(parsed.listingId, token);
  if (!check.ok) {
    if (check.code === 401) return respond(401, check.message);
    console.error(`[api/airbnb-import] duplicate check failed (${check.code})`);
    return respond(503, "We can't import right now. Please try again in a moment, or fill in the details below.");
  }
  if (check.data.status === "other") {
    return respond(409, "This Airbnb listing is already connected to another StayOwned account. If it's yours, contact us.", {
      errors: { url: "This listing is already connected to another account." },
    });
  }
  if (check.data.status === "company") {
    return respond(409, "This Airbnb listing is already connected to another of your properties.", {
      errors: { url: "This listing is already connected to another of your properties." },
    });
  }

  const provider = getImportProvider();
  if (!provider) {
    return respond(
      501,
      "Automatic import from Airbnb isn't available yet. Please fill in the details below — it only takes a few minutes.",
    );
  }

  let result;
  try {
    result = await provider.fetchListing(parsed.listingId, AbortSignal.timeout(PROVIDER_TIMEOUT_MS));
  } catch (error) {
    const name = (error as { name?: string })?.name ?? "unknown";
    console.error(`[api/airbnb-import] provider ${provider.id} failed (${name})`);
    return name === "TimeoutError"
      ? respond(504, "Airbnb took too long to answer. Please try again.")
      : respond(502, "We couldn't read this listing. Please try again, or fill in the details below.");
  }

  if (!result.ok) {
    switch (result.reason) {
      case "not_found":
        return respond(
          404,
          "This listing isn't published on Airbnb (or was removed), so its details can't be read. Check the link, or fill in the details below.",
          { errors: { url: "This listing isn't published on Airbnb." } },
        );
      case "blocked":
        return respond(502, "Airbnb didn't let us read this listing right now. Please try again later, or fill in the details below.");
      case "unreadable":
        console.error(`[api/airbnb-import] provider ${provider.id}: listing data not found on the page`);
        return respond(502, "We couldn't read the details on this Airbnb page. Please fill in the details below.");
      case "rate_limited":
        return respond(429, "Airbnb is busy. Please try again in a few minutes.");
      case "unavailable":
        return respond(
          501,
          "Automatic import from Airbnb isn't available yet. Please fill in the details below — it only takes a few minutes.",
        );
      default:
        console.error(`[api/airbnb-import] provider ${provider.id} error`);
        return respond(502, "We couldn't read this listing. Please try again, or fill in the details below.");
    }
  }

  const listing = sanitizeImportedListing(result.data, parsed.listingId);
  if (isEmptyListing(listing)) {
    return respond(422, "We couldn't read any details from this listing. Please fill in the details below.", {
      errors: { url: "No details could be imported from this listing." },
    });
  }
  const data: AirbnbImportResponse = { listing, already_connected: check.data.status === "this_property" };
  return respond(200, "Listing imported. Please check the details.", { data });
}
