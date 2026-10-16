import { properties } from "@/data/properties";
import { PROPERTY_TYPE_LABELS, getAmenity } from "@/data/amenities";
import type { Property } from "@/types/property";
import { generateCopy } from "./copy-templates";
import type { WizardDraft } from "./types";

const fallbackImage = properties[0].images[0];

/** Builds the guest-facing Property shape from the wizard draft (used by previews). */
export function draftToProperty(draft: WizardDraft): Property {
  const { property } = draft;
  const copy = generateCopy(property, draft.content);
  const [locality = "", region = "", country = "India"] = property.location
    .split(",")
    .map((part) => part.trim());
  const typeLabel = PROPERTY_TYPE_LABELS[property.type];
  const sample = properties.find((item) => item.slug === property.slug);

  return {
    id: "draft",
    slug: property.slug,
    name: property.name.trim() || "Your property",
    type: property.type,
    summary: `${property.bedrooms} BHK ${typeLabel}`,
    headline: copy.headline,
    description: copy.description,
    location: { locality, region, country },
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    maxGuests: property.maxGuests,
    amenities: property.amenities,
    highlights: property.amenities.slice(0, 4).map((id) => getAmenity(id).label),
    images:
      draft.photos.length > 0
        ? draft.photos.map((photo) => ({ src: photo.src, alt: photo.alt, width: 1600, height: 1067 }))
        : [fallbackImage],
    price: { amount: property.price ?? 0, currency: property.currency, unit: "night" },
    // Ratings only exist for published demo listings; a new draft has none.
    rating: sample?.rating,
    faqs: copy.faqs,
    theme: draft.theme,
    host: { name: draft.account?.name || "Your name", responseTime: "Usually replies within an hour" },
    availability: { checkInTime: "14:00", checkOutTime: "11:00", minNights: 1, booked: [] },
  };
}
