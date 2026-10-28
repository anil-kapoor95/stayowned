/**
 * Reads the listing details embedded in an Airbnb listing page (https://www.airbnb.com/rooms/<id>).
 *
 * The page carries them in two places, both in the HTML the server sends (checked on a live
 * listing, October 2026):
 *  - <script id="data-deferred-state-0" type="application/json">: Airbnb's page data
 *    (niobeClientData[0][1].data): title, description, overview items ("5 guests", "2 bedrooms",
 *    "2 bathrooms"), location ("Anjuna, Goa, India"), amenities with an "available" flag, photos.
 *  - <script type="application/ld+json">: a schema.org VacationRental record (name, description,
 *    locality, guest count, images), used when the page data lacks a field.
 * Not on the public page: the street address (shown to guests after booking) and a nightly
 * price (only shown for chosen dates).
 *
 * Airbnb can change this markup at any time; anything not found is left out (null / empty).
 */

type Json = unknown;

function get(value: Json, path: (string | number)[]): Json {
  let current = value;
  for (const key of path) {
    if (current === null || typeof current !== "object") return undefined;
    current = (current as Record<string | number, Json>)[key];
  }
  return current;
}

function str(value: Json): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/** Airbnb's UGC text: the English translation (the page is requested in English) or the host's own words. */
function ugc(value: Json): string | null {
  return str(get(value, ["localizedStringWithTranslationPreference"])) ?? str(get(value, ["localizedString"]));
}

function scriptContents(html: string, attrs: RegExp): string[] {
  const found: string[] = [];
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    if (attrs.test(match[1])) found.push(match[2]);
  }
  return found;
}

function parseJson(text: string): Json {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

/** "5 guests", "2 bedrooms", "1.5 shared bathrooms", "Studio", "Half-bath" -> numbers. */
function readOverview(items: string[]) {
  let bedrooms: number | null = null;
  let bathrooms: number | null = null;
  let guests: number | null = null;
  for (const item of items) {
    const text = item.toLowerCase();
    if (/^studio$/.test(text)) bedrooms = 0;
    if (/^half-?bath$/.test(text)) bathrooms = 0.5;
    const m = /^(\d+(?:\.\d+)?)\+?\s+(?:shared\s+|private\s+)?(guest|bedroom|bathroom|bath)s?\b/.exec(text);
    if (!m) continue;
    const n = Number(m[1]);
    if (m[2] === "guest") guests = n;
    else if (m[2] === "bedroom") bedrooms = n;
    else bathrooms = n;
  }
  return { bedrooms, bathrooms, guests };
}

/** Raw listing fields in the shape sanitizeImportedListing() reads, or null when the page has no listing data. */
export function parseAirbnbListingPage(html: string): Record<string, unknown> | null {
  const deferred = scriptContents(html, /id=["']data-deferred-state-0["']/i)[0];
  const state = deferred ? parseJson(deferred) : undefined;
  const data = get(state, ["niobeClientData", 0, 1, "data"]);
  const pres = get(data, ["node", "pdpPresentation"]);
  const sections = get(data, ["presentation", "stayProductDetailPage", "sections"]);

  const ld = scriptContents(html, /type=["']application\/ld\+json["']/i)
    .map(parseJson)
    .find((item) => get(item, ["@type"]) === "VacationRental");

  const sharing = get(sections, ["metadata", "sharingConfig"]);
  if (!pres && !ld && !sharing) return null;

  // "2 guests", "1 bedroom", …; else the share title "Tiny home in Mickleton · ★4.9 · 1 bedroom · 1 bed · 1 bathroom"
  const overviewItems = get(pres, ["overview", "items"]);
  const items = Array.isArray(overviewItems) ? overviewItems.filter((i): i is string => typeof i === "string") : [];
  const overview = readOverview(
    items.length ? items : (str(get(sharing, ["title"])) ?? "").split("·").map((part) => part.trim()),
  );
  const personCapacity = get(sharing, ["personCapacity"]) ?? get(data, ["node", "personCapacity"]);
  const ldGuests = get(ld, ["containsPlace", "occupancy", "value"]);

  // "Anjuna, Goa, India" -> city, state, country
  const locationParts = (str(get(pres, ["location", "subtitle"])) ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const city = locationParts[0] ?? str(get(ld, ["address", "addressLocality"]));
  const country = locationParts.length >= 2 ? locationParts[locationParts.length - 1] : null;
  const region = locationParts.length >= 3 ? locationParts.slice(1, -1).join(", ") : null;

  const groups = get(pres, ["amenities", "seeAllAmenitiesGroups"]);
  const amenities = Array.isArray(groups)
    ? groups.flatMap((group) => {
        const items = get(group, ["amenities"]);
        return Array.isArray(items)
          ? items.filter((item) => get(item, ["available"]) !== false).map((item) => str(get(item, ["title"]))).filter(Boolean)
          : [];
      })
    : [];

  const photos: { url: string; caption: string | null }[] = [];
  const seen = new Set<string>();
  const addPhoto = (url: string | null, caption: string | null) => {
    if (!url) return;
    const key = url.split("?")[0];
    if (seen.has(key)) return;
    seen.add(key);
    photos.push({ url, caption });
  };
  const pageSections = get(sections, ["sections"]);
  if (Array.isArray(pageSections)) {
    for (const section of pageSections) {
      const media = get(section, ["section", "mediaItems"]);
      if (!Array.isArray(media)) continue;
      for (const item of media) addPhoto(str(get(item, ["baseUrl"])), str(get(item, ["accessibilityLabel"])));
    }
  }
  const ldImages = get(ld, ["image"]);
  if (photos.length === 0 && Array.isArray(ldImages)) for (const url of ldImages) addPhoto(str(url), null);

  const overviewTitle = str(get(pres, ["overview", "title"]));
  return {
    title: ugc(get(pres, ["title", "content"])) ?? ugc(get(data, ["node", "description", "name"])) ?? str(get(ld, ["name"])),
    description: ugc(get(pres, ["descriptions", "longDescriptionHtml"])) ?? str(get(ld, ["description"])),
    // "Entire home"; or "Entire home in Anjuna, India" without the place
    property_type:
      str(get(sharing, ["propertyType"])) ??
      (overviewTitle ? overviewTitle.replace(/\s+in\s+.*$/i, "") : null),
    address: { line1: null, city, state: region, postcode: null, country_code: null, country_name: country },
    bedrooms: overview.bedrooms,
    bathrooms: overview.bathrooms,
    max_guests:
      overview.guests ??
      (typeof personCapacity === "number" ? personCapacity : typeof ldGuests === "number" ? ldGuests : null),
    amenities,
    price: null,
    photos,
  };
}
