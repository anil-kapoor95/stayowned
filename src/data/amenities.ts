import type { Amenity, AmenityId, PropertyType } from "@/types/property";

/** Amenity list and order from the "About PRoperty" Figma frame. */
export const AMENITIES: readonly Amenity[] = [
  { id: "private-pool", label: "Private pool", shortLabel: "Pool", icon: "waves" },
  { id: "wifi", label: "Free high-speed Wi-Fi", shortLabel: "Fast Wi-Fi", icon: "wifi" },
  { id: "air-conditioning", label: "Air conditioning", shortLabel: "AC", icon: "snowflake" },
  { id: "kitchen", label: "Fully equipped kitchen", shortLabel: "Kitchen", icon: "utensils" },
  { id: "workspace", label: "Dedicated workspace", shortLabel: "Workspace", icon: "monitor" },
  { id: "parking", label: "Free parking on premises", shortLabel: "Parking", icon: "parking" },
  { id: "power-backup", label: "Power backup / Inverter", shortLabel: "Power backup", icon: "zap" },
  { id: "pet-friendly", label: "Pet friendly", shortLabel: "Pets OK", icon: "paw" },
  { id: "washing-machine", label: "Washing machine", shortLabel: "Washer", icon: "washer" },
  { id: "housekeeping", label: "Daily housekeeping", shortLabel: "Housekeeping", icon: "sparkles" },
  { id: "chef", label: "Chef on request", shortLabel: "Chef", icon: "chefHat" },
  { id: "barbeque", label: "Barbeque grill", shortLabel: "BBQ", icon: "flame" },
];

const byId = new Map(AMENITIES.map((amenity) => [amenity.id, amenity]));

/**
 * Name each amenity is saved under in the back office (Options > Features). Existing features are
 * matched by spelling-insensitive name, so "Air conditioning" and "Washer" reuse the seeded ones.
 */
export const AMENITY_FEATURE_NAMES: Record<AmenityId, string> = {
  "private-pool": "Private pool",
  wifi: "Wi-Fi",
  "air-conditioning": "Air conditioning",
  kitchen: "Kitchen",
  workspace: "Dedicated workspace",
  parking: "Free parking",
  "power-backup": "Power backup",
  "pet-friendly": "Pets allowed",
  "washing-machine": "Washer",
  housekeeping: "Daily housekeeping",
  chef: "Chef on request",
  barbeque: "BBQ grill",
};

/** "Wi-Fi", "wifi", " WIFI " -> "wifi" (same rule as the back end: pjJabbApi::amenityKey). */
export function amenityKey(name: string): string {
  return name.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
}

const idByKey = new Map<string, AmenityId>();
for (const amenity of AMENITIES) {
  idByKey.set(amenityKey(amenity.label), amenity.id);
  idByKey.set(amenityKey(AMENITY_FEATURE_NAMES[amenity.id]), amenity.id);
}

/** Saved amenity names -> our amenities (same name) and the others, as they are. */
export function splitAmenityNames(names: string[]): { ids: AmenityId[]; extras: string[] } {
  const ids = new Set<AmenityId>();
  const extras = new Map<string, string>();
  for (const raw of names) {
    const name = raw.trim();
    const key = amenityKey(name);
    if (!key) continue;
    const id = idByKey.get(key);
    if (id) ids.add(id);
    else if (!extras.has(key)) extras.set(key, name);
  }
  return { ids: [...ids], extras: [...extras.values()] };
}

/** Names to save: our amenities under their back-office name, then the extra ones; no duplicates. */
export function amenityNamesForSave(ids: AmenityId[], extras: string[]): string[] {
  const out = new Map<string, string>();
  for (const name of [...ids.map((id) => AMENITY_FEATURE_NAMES[id]), ...extras]) {
    const key = amenityKey(name);
    if (key && !out.has(key)) out.set(key, name.trim());
  }
  return [...out.values()];
}

export function getAmenity(id: AmenityId): Amenity {
  const amenity = byId.get(id);
  if (!amenity) throw new Error(`Unknown amenity: ${id}`);
  return amenity;
}

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  villa: "Villa",
  homestay: "Homestay",
  apartment: "Apartment",
  cottage: "Cottage",
  resort: "Resort",
};
