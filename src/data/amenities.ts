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
