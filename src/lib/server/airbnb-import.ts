import { isAirbnbPhotoUrl, normalizeAirbnbHost } from "@/lib/airbnb-import";
import { parseAirbnbListingPage } from "./airbnb-page";

/**
 * Where imported Airbnb listing data comes from (server only).
 *
 * Airbnb has no public API for listing details (its partner API is for approved partners only;
 * the only public host integration is the iCal calendar export). By the product owner's decision,
 * the import reads the listing's public page, once, when the host presses Import. Note: Airbnb's
 * Terms (section 11.1) do not allow automated access to its pages; Airbnb may refuse these requests
 * at any time and the page markup can change. Requests are made openly (own user agent, no
 * bot-detection workarounds); a refusal is reported to the host, who can fill in the form.
 *
 * The page is read on the Airbnb site of the pasted link (www.airbnb.co.in, …): www.airbnb.com
 * answers visitors from other countries with a "Redirecting to www.airbnb.co.in" page (an HTML form,
 * not an HTTP redirect). That page is followed once, to the country site it names.
 *
 * AIRBNB_IMPORT_PROVIDER:
 *   (unset) / page  read the public listing page (default)
 *   off             no automatic import: the host is asked to fill in the form
 */

export type ProviderResult =
  | { ok: true; data: unknown }
  | {
      ok: false;
      reason: "not_found" | "forbidden" | "blocked" | "rate_limited" | "unavailable" | "unreadable" | "error";
      message?: string;
    };

export interface ListingImportProvider {
  id: "page";
  /** Raw listing data for the listing id (cleaned afterwards by sanitizeImportedListing). */
  fetchListing(listingId: string, host: string, signal: AbortSignal): Promise<ProviderResult>;
}

const USER_AGENT = "Mozilla/5.0 (compatible; StayOwnedListingImport/1.0)";
const MAX_PAGE_BYTES = 6 * 1024 * 1024;
const MAX_REDIRECTS = 3;

/** Reads a response body up to `max` bytes; null when it is bigger. */
export async function readLimited(response: Response, max: number): Promise<Uint8Array<ArrayBuffer> | null> {
  if (Number(response.headers.get("content-length") ?? 0) > max) {
    await response.body?.cancel();
    return null;
  }
  if (!response.body) return new Uint8Array();
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const out = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}

/**
 * GET with redirects followed by hand, so every hop stays on an allowed host
 * (`allowHost`); anything else is refused before it is requested.
 */
export async function fetchOnHosts(
  url: string,
  init: { headers: Record<string, string>; signal: AbortSignal },
  allowHost: (hostname: string) => boolean,
): Promise<Response | null> {
  let current = new URL(url);
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    if (current.protocol !== "https:" || !allowHost(current.hostname) || current.port || current.username) return null;
    const response = await fetch(current, { ...init, method: "GET", redirect: "manual", cache: "no-store" });
    if (response.status < 300 || response.status >= 400) return response;
    const location = response.headers.get("location");
    await response.body?.cancel();
    if (!location) return response;
    current = new URL(location, current);
  }
  return null;
}

const isAirbnbHost = (hostname: string) => normalizeAirbnbHost(hostname) !== null;

/** "Redirecting to www.airbnb.co.in" page: the Airbnb site it sends the visitor to, or null. */
export function domainSwitchTarget(html: string): string | null {
  if (html.length > 20_000 || !/domain_switch/.test(html)) return null;
  const action = /<form\b[^>]*\baction=["'](https:\/\/[^"'/]+)\/v2\/domain_switch\/[^"']*["']/i.exec(html)?.[1];
  const title = /<title>\s*Redirecting to ([a-z0-9.-]+)\s*<\/title>/i.exec(html)?.[1];
  const hostname = action ? new URL(action).hostname : title;
  return hostname ? normalizeAirbnbHost(hostname) : null;
}

class AirbnbPageProvider implements ListingImportProvider {
  id = "page" as const;

  async fetchListing(listingId: string, host: string, signal: AbortSignal): Promise<ProviderResult> {
    if (!/^\d{1,20}$/.test(listingId)) return { ok: false, reason: "not_found" };
    let site = normalizeAirbnbHost(host) ?? "www.airbnb.com";

    // At most one hop through Airbnb's country-site page.
    for (let attempt = 0; attempt < 2; attempt++) {
      const response = await fetchOnHosts(
        `https://${site}/rooms/${listingId}`,
        {
          signal,
          headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/xhtml+xml", "Accept-Language": "en" },
        },
        isAirbnbHost,
      );
      if (!response) return { ok: false, reason: "error", message: "redirected off Airbnb" };
      if (response.status === 404 || response.status === 410) return { ok: false, reason: "not_found" };
      if (response.status === 429) return { ok: false, reason: "rate_limited" };
      if (response.status === 401 || response.status === 403) return { ok: false, reason: "blocked" };
      if (!response.ok) return { ok: false, reason: "error", message: `HTTP ${response.status}` };
      // A listing that no longer exists sends visitors to search results.
      const finalPath = response.url ? new URL(response.url).pathname : `/rooms/${listingId}`;
      if (!/\/rooms\/(?:plus\/)?\d+/.test(finalPath)) {
        await response.body?.cancel();
        return { ok: false, reason: "not_found" };
      }

      const bytes = await readLimited(response, MAX_PAGE_BYTES);
      if (!bytes) return { ok: false, reason: "error", message: "page too large" };
      const html = new TextDecoder("utf-8").decode(bytes);

      const target = domainSwitchTarget(html);
      if (target) {
        if (target === site || attempt > 0) return { ok: false, reason: "unreadable", message: "domain switch loop" };
        site = target;
        continue;
      }
      const data = parseAirbnbListingPage(html);
      return data ? { ok: true, data } : { ok: false, reason: "unreadable" };
    }
    return { ok: false, reason: "unreadable" };
  }
}

export function getImportProvider(): ListingImportProvider | null {
  const setting = process.env.AIRBNB_IMPORT_PROVIDER?.trim() || "page";
  return setting === "page" ? new AirbnbPageProvider() : null;
}

/* ------------------------------------------------------------ Photos */

const PHOTO_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/gif": "gif" };
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

export type PhotoDownload =
  | { ok: true; file: File }
  | { ok: false; reason: "invalid" | "not_found" | "too_large" | "unsupported" | "error" };

/** Downloads one listing photo from Airbnb's image servers as a JPG/PNG/GIF file (the formats the back end stores). */
export async function downloadAirbnbPhoto(photoUrl: string, name: string, signal: AbortSignal): Promise<PhotoDownload> {
  if (!isAirbnbPhotoUrl(photoUrl)) return { ok: false, reason: "invalid" };
  const url = new URL(photoUrl);
  url.search = "";
  url.searchParams.set("im_w", "1440"); // Airbnb's resize parameter: a web-sized copy
  const response = await fetchOnHosts(
    url.toString(),
    { signal, headers: { "User-Agent": USER_AGENT, Accept: "image/jpeg,image/png,image/gif;q=0.8" } },
    (hostname) => /^[a-z0-9-]+\.muscache\.com$/i.test(hostname),
  );
  if (!response) return { ok: false, reason: "invalid" };
  if (response.status === 404 || response.status === 410) return { ok: false, reason: "not_found" };
  if (!response.ok) {
    await response.body?.cancel();
    return { ok: false, reason: "error" };
  }
  const type = (response.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  const ext = PHOTO_TYPES[type];
  if (!ext) {
    await response.body?.cancel();
    return { ok: false, reason: "unsupported" };
  }
  const bytes = await readLimited(response, MAX_PHOTO_BYTES);
  if (!bytes) return { ok: false, reason: "too_large" };
  if (!looksLikeImage(bytes, ext)) return { ok: false, reason: "unsupported" };
  return { ok: true, file: new File([bytes], `${name}.${ext}`, { type }) };
}

/** Magic bytes of JPG / PNG / GIF (the content type alone is not trusted). */
function looksLikeImage(bytes: Uint8Array, ext: string): boolean {
  if (ext === "jpg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (ext === "png") return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  return bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46;
}
