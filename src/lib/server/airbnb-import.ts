import { parseAirbnbListingPage } from "./airbnb-page";

/**
 * Where imported Airbnb listing data comes from (server only).
 *
 * Airbnb has no public API (its partner API is for approved partners only). By the product
 * owner's decision, the import reads the listing's public page, once, when the host presses
 * Import. Note: Airbnb's Terms (section 11.1) do not allow automated access to its pages; Airbnb
 * may refuse these requests at any time and the page markup can change. Requests are made openly
 * (own user agent, no bot-detection workarounds); a refusal is reported to the host.
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
  fetchListing(listingId: string, signal: AbortSignal): Promise<ProviderResult>;
}

const AIRBNB_HOST_RE = /^(?:(?:www|m)\.)?airbnb\.(?:com|[a-z]{2}|co\.[a-z]{2}|com\.[a-z]{2})$/i;
const MAX_PAGE_BYTES = 6 * 1024 * 1024;

class AirbnbPageProvider implements ListingImportProvider {
  id = "page" as const;

  async fetchListing(listingId: string, signal: AbortSignal): Promise<ProviderResult> {
    if (!/^\d{1,20}$/.test(listingId)) return { ok: false, reason: "not_found" };
    const response = await fetch(`https://www.airbnb.com/rooms/${listingId}`, {
      signal,
      redirect: "follow",
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; StayOwnedListingImport/1.0)",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en",
      },
    });

    // Redirects must stay on Airbnb.
    if (!AIRBNB_HOST_RE.test(new URL(response.url).hostname)) return { ok: false, reason: "error" };
    if (response.status === 404 || response.status === 410) return { ok: false, reason: "not_found" };
    if (response.status === 429) return { ok: false, reason: "rate_limited" };
    if (response.status === 401 || response.status === 403) return { ok: false, reason: "blocked" };
    if (!response.ok) return { ok: false, reason: "error" };
    if (Number(response.headers.get("content-length") ?? 0) > MAX_PAGE_BYTES) return { ok: false, reason: "error" };

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > MAX_PAGE_BYTES) return { ok: false, reason: "error" };
    const data = parseAirbnbListingPage(new TextDecoder("utf-8").decode(buffer));
    return data ? { ok: true, data } : { ok: false, reason: "unreadable" };
  }
}

export function getImportProvider(): ListingImportProvider | null {
  const setting = process.env.AIRBNB_IMPORT_PROVIDER?.trim() || "page";
  return setting === "page" ? new AirbnbPageProvider() : null;
}
