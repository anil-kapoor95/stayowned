/**
 * Airbnb listing import: URL parsing, the normalised listing shape returned by
 * POST /api/airbnb-import, the server-side clean-up of provider data, and the
 * mapping onto the property form (step 3). Shared by the route and the browser.
 */

import { PROPERTY_TYPES, type AmenityId, type PropertyType } from "@/types/property";

/** Airbnb web domains: airbnb.com, airbnb.co.in, airbnb.co.uk, airbnb.de, … (any www./m. sub-domain). */
const AIRBNB_HOST_RE = /^(?:(?:www|m)\.)?airbnb\.(?:com|[a-z]{2}|co\.[a-z]{2}|com\.[a-z]{2})$/i;

export type ListingUrlResult = { ok: true; listingId: string; url: string } | { ok: false; error: string };

/**
 * Listing links that carry the listing id:
 *   /rooms/<id>, /rooms/plus/<id>                (listing page, optional /en/ style locale)
 *   /hosting/listings/editor/<id>/…               (host's listing editor)
 *   /hosting/listings/<id>/…, /manage-your-space/<id>/…
 * "/h/<slug>" links are refused: they have no id.
 */
const LISTING_PATH_RES = [
  /^\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?rooms\/(?:plus\/)?(\d{1,20})\/?$/i,
  /^\/hosting\/listings\/(?:editor\/)?(\d{1,20})(?:\/[\w-]*)*\/?$/i,
  /^\/manage-your-space\/(\d{1,20})(?:\/[\w-]*)*\/?$/i,
];

export function parseAirbnbListingUrl(input: string): ListingUrlResult {
  const text = input.trim();
  if (!text) return { ok: false, error: "Paste the link of your Airbnb listing." };
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`);
  } catch {
    return { ok: false, error: "This is not a valid link. It should look like https://www.airbnb.com/rooms/12345678" };
  }
  if (!AIRBNB_HOST_RE.test(url.hostname)) {
    return { ok: false, error: "Paste a link from airbnb.com (or your country's Airbnb site)." };
  }
  if (/\/calendar\/ical\//.test(url.pathname)) {
    return { ok: false, error: "This is a calendar (iCal) link. Paste the link of the listing page, which has /rooms/ in it." };
  }
  const match = LISTING_PATH_RES.map((re) => re.exec(url.pathname)).find(Boolean);
  if (!match) {
    return {
      ok: false,
      error:
        "Paste the link of your listing, like /rooms/12345678, or the link of its page in your Airbnb listing editor.",
    };
  }
  return { ok: true, listingId: match[1], url: `https://www.airbnb.com/rooms/${match[1]}` };
}

/* ------------------------------------------------------------ Normalised listing */

export interface ImportedAddress {
  line1: string | null;
  city: string | null;
  state: string | null;
  postcode: string | null;
  /** ISO 3166-1 alpha-2, e.g. "IN". */
  country_code: string | null;
  /** Country name as Airbnb shows it, e.g. "India" (when there is no code). */
  country_name: string | null;
}

export interface ImportedListing {
  source: "airbnb";
  listing_id: string;
  url: string;
  title: string | null;
  description: string | null;
  /** The provider's own wording, e.g. "Entire villa". */
  property_type: string | null;
  address: ImportedAddress;
  bedrooms: number | null;
  /** May be a half (1.5 baths). */
  bathrooms: number | null;
  max_guests: number | null;
  /** The provider's amenity names. */
  amenities: string[];
  price: { amount: number; currency: string } | null;
  photos: { url: string; caption: string | null }[];
}

export interface AirbnbImportResponse {
  listing: ImportedListing;
  /** The listing is already connected to this property (its Airbnb calendar is linked). */
  already_connected: boolean;
}

/* ------------------------------------------------------------ Server-side clean-up */

const LIMITS = { title: 120, description: 5000, address: 255, amenity: 80, amenities: 100, photos: 50, caption: 200 };

function cleanText(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const text = value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "") // no HTML from the provider reaches the form
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return text ? text.slice(0, max) : null;
}

function cleanNumber(value: unknown, min: number, max: number): number | null {
  const n = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  return typeof n === "number" && Number.isFinite(n) && n >= min && n <= max ? n : null;
}

function cleanPhotoUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

/** Provider data -> ImportedListing. Anything missing, malformed or out of range becomes null / is dropped. */
export function sanitizeImportedListing(raw: unknown, listingId: string): ImportedListing {
  const r = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const address = r.address && typeof r.address === "object" ? (r.address as Record<string, unknown>) : {};
  const price = r.price && typeof r.price === "object" ? (r.price as Record<string, unknown>) : null;
  const amount = price ? cleanNumber(price.amount, 0.01, 99_999_999) : null;
  const currency = price && typeof price.currency === "string" && /^[A-Z]{3}$/.test(price.currency) ? price.currency : null;
  const country = typeof address.country_code === "string" ? address.country_code.trim().toUpperCase() : "";

  const amenities = Array.isArray(r.amenities)
    ? [...new Set(r.amenities.map((a) => cleanText(a, LIMITS.amenity)).filter((a): a is string => Boolean(a)))].slice(
        0,
        LIMITS.amenities,
      )
    : [];
  const photos = Array.isArray(r.photos)
    ? r.photos
        .map((p) => {
          const photo = p && typeof p === "object" ? (p as Record<string, unknown>) : {};
          const url = cleanPhotoUrl(photo.url);
          return url ? { url, caption: cleanText(photo.caption, LIMITS.caption) } : null;
        })
        .filter((p): p is { url: string; caption: string | null } => p !== null)
        .slice(0, LIMITS.photos)
    : [];

  return {
    source: "airbnb",
    listing_id: listingId,
    url: `https://www.airbnb.com/rooms/${listingId}`,
    title: cleanText(r.title, LIMITS.title),
    description: cleanText(r.description, LIMITS.description),
    property_type: cleanText(r.property_type, LIMITS.address),
    address: {
      line1: cleanText(address.line1, LIMITS.address),
      city: cleanText(address.city, LIMITS.address),
      state: cleanText(address.state, LIMITS.address),
      postcode: cleanText(address.postcode, 20),
      country_code: /^[A-Z]{2}$/.test(country) ? country : null,
      country_name: cleanText(address.country_name, 100),
    },
    bedrooms: cleanNumber(r.bedrooms, 0, 99),
    bathrooms: cleanNumber(r.bathrooms, 0, 99),
    max_guests: cleanNumber(r.max_guests, 1, 50),
    amenities,
    price: amount !== null && currency ? { amount: Math.round(amount * 100) / 100, currency } : null,
    photos,
  };
}

/** True when the provider returned nothing that can fill the form. */
export function isEmptyListing(listing: ImportedListing): boolean {
  const a = listing.address;
  return (
    !listing.title &&
    !listing.description &&
    !a.line1 &&
    !a.city &&
    listing.bedrooms === null &&
    listing.max_guests === null &&
    listing.amenities.length === 0 &&
    !listing.price &&
    listing.photos.length === 0
  );
}

/* ------------------------------------------------------------ Mapping onto the form */

const TYPE_RULES: [RegExp, PropertyType][] = [
  [/villa/i, "villa"],
  [/resort|hotel/i, "resort"],
  [/cottage|cabin|bungalow|chalet|hut/i, "cottage"],
  [/apartment|condo|flat|loft|serviced/i, "apartment"],
  [/homestay|guest ?house|bed and breakfast|b&b|farm|private room|room in|home|house/i, "homestay"],
];

export function mapPropertyType(text: string | null): PropertyType | null {
  if (!text) return null;
  const found = TYPE_RULES.find(([re]) => re.test(text));
  return found && (PROPERTY_TYPES as readonly string[]).includes(found[1]) ? found[1] : null;
}

const AMENITY_RULES: [RegExp, AmenityId][] = [
  [/^(?!.*\bshared\b).*\bpool\b/i, "private-pool"], // "Shared pool" is not a private pool
  [/wi-?fi|wireless|internet/i, "wifi"],
  [/air[ -]?condition|\ba\/?c\b/i, "air-conditioning"],
  [/kitchen/i, "kitchen"],
  [/workspace|work space|desk/i, "workspace"],
  [/parking/i, "parking"],
  [/power backup|backup power|generator|inverter/i, "power-backup"],
  [/pets? (allowed|friendly|welcome)|pet[- ]friendly/i, "pet-friendly"],
  [/washer|washing machine|laundry/i, "washing-machine"],
  [/housekeeping|cleaning (available|service)/i, "housekeeping"],
  [/chef|cook/i, "chef"],
  [/bbq|barbe(c|q)ue|grill/i, "barbeque"],
];

/** Provider amenity names -> StayOwned amenities; names without a match are returned separately. */
export function mapAmenities(names: string[]): { matched: AmenityId[]; unmatched: string[] } {
  const matched = new Set<AmenityId>();
  const unmatched: string[] = [];
  for (const name of names) {
    const rule = AMENITY_RULES.find(([re]) => re.test(name));
    if (rule) matched.add(rule[1]);
    else unmatched.push(name);
  }
  return { matched: [...matched], unmatched };
}
