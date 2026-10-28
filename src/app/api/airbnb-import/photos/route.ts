import { createHash } from "node:crypto";
import { isAirbnbPhotoUrl } from "@/lib/airbnb-import";
import { apiRequest } from "@/lib/api/client";
import { signupApi, type SignupState } from "@/lib/api/signup";
import { downloadAirbnbPhoto } from "@/lib/server/airbnb-import";

/**
 * POST /api/airbnb-import/photos — adds the photos of an imported Airbnb listing to the property (step 4).
 *
 * Headers: Authorization: Bearer <signup_token>, Content-Type: application/json
 * Body:    { "listing_id": "12345678", "photos": ["https://a0.muscache.com/im/pictures/…jpeg", …] }
 * Answer:  { status, code, message, errors?: {photos}, data?: { state: SignupState, added, failed } }
 *
 * Photos are only downloaded from Airbnb's image servers (*.muscache.com), checked (JPG/PNG/GIF,
 * max 10 MB) and uploaded to the back office with the same action as the photo uploader
 * (pjActionSignupPhotos), so its rules apply (max 20 photos per property).
 */

const MAX_BODY_BYTES = 16 * 1024;
const MAX_PHOTOS = 20; // pjJabbApi::MAX_PHOTOS
const CONCURRENCY = 4;
const TIMEOUT_MS = 45_000;
const RATE_LIMIT = { max: 5, windowMs: 10 * 60_000 };

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
    return respond(415, "Send the photos as JSON (Content-Type: application/json).");
  }
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) return respond(413, "The request is too large.");
  const token = /^Bearer\s+([a-f0-9]{64})$/i.exec((request.headers.get("authorization") ?? "").trim())?.[1];
  if (!token) return respond(401, "Sign-up token is missing or invalid.");

  const text = await request.text();
  if (Buffer.byteLength(text) > MAX_BODY_BYTES) return respond(413, "The request is too large.");
  let body: { listing_id?: unknown; photos?: unknown };
  try {
    body = JSON.parse(text);
  } catch {
    return respond(400, "The request body is not valid JSON.");
  }
  const listingId = typeof body?.listing_id === "string" ? body.listing_id : "";
  if (!/^\d{1,20}$/.test(listingId)) return respond(422, "Validation failed", { errors: { listing_id: "Invalid Airbnb listing ID" } });
  const photos = Array.isArray(body.photos)
    ? [...new Set(body.photos.filter((url): url is string => typeof url === "string" && isAirbnbPhotoUrl(url)))]
    : [];
  if (photos.length === 0 || (Array.isArray(body.photos) && body.photos.length > 50)) {
    return respond(422, "Validation failed", { errors: { photos: "No Airbnb photos to add." } });
  }

  if (rateLimited(createHash("sha256").update(token).digest("hex"))) {
    return respond(429, "Too many photo imports. Please wait a few minutes and try again.");
  }

  // Signs the host in and stops photos of a listing connected to another account.
  const check = await signupApi.checkAirbnbListing(listingId, token);
  if (!check.ok) {
    if (check.code === 401 || check.code === 429) return respond(check.code, check.message);
    console.error(`[api/airbnb-import/photos] duplicate check failed (${check.code})`);
    return respond(503, "We can't import photos right now. Please try again in a moment, or upload them below.");
  }
  if (check.data.status === "other" || check.data.status === "company") {
    return respond(409, "This Airbnb listing is connected to another property, so its photos can't be added here.");
  }

  // Room left for photos on the property (the back office refuses a batch that goes over the limit).
  const status = await signupApi.status(token);
  if (!status.ok) {
    return status.code === 401 ? respond(401, status.message) : respond(503, "We can't import photos right now. Please try again.");
  }
  const room = MAX_PHOTOS - (status.data.photos?.length ?? 0);
  if (room <= 0) return respond(422, "Validation failed", { errors: { photos: `You already have ${MAX_PHOTOS} photos.` } });
  const wanted = photos.slice(0, room);

  const signal = AbortSignal.timeout(TIMEOUT_MS);
  const files: (File | null)[] = new Array(wanted.length).fill(null);
  let failed = 0;
  let next = 0;
  async function worker() {
    while (next < wanted.length) {
      const index = next++;
      try {
        const result = await downloadAirbnbPhoto(wanted[index], `airbnb-${listingId}-${index + 1}`, signal);
        if (result.ok) files[index] = result.file;
        else failed += 1;
      } catch {
        failed += 1;
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, wanted.length) }, worker));
  const ready = files.filter((file): file is File => file !== null);
  if (ready.length === 0) {
    console.error(`[api/airbnb-import/photos] no photo of listing could be downloaded (${failed} failed)`);
    return respond(502, "We couldn't download the photos from Airbnb. Please upload them below.");
  }

  const form = new FormData();
  for (const file of ready) form.append("photos[]", file, file.name);
  const saved = await apiRequest<SignupState>("pjActionSignupPhotos", form, { token });
  if (!saved.ok) {
    return respond(saved.code >= 400 ? saved.code : 502, saved.message, { errors: saved.errors });
  }
  const rejected = saved.data.photo_errors?.length ?? 0;
  const added = ready.length - rejected;
  return respond(
    200,
    `${added} photo${added === 1 ? "" : "s"} added from Airbnb.${failed + rejected ? ` ${failed + rejected} could not be added.` : ""}`,
    { data: { state: saved.data, added, failed: failed + rejected, skipped: photos.length - wanted.length } },
  );
}
