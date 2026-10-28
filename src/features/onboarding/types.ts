import type { AmenityId, CurrencyCode, Faq, PropertyType, ThemeId } from "@/types/property";

export type Tone = "warm" | "premium" | "simple";

export interface DraftAccount {
  name: string;
  email: string;
  country: string;
  whatsapp: string;
}

export interface DraftProperty {
  name: string;
  type: PropertyType;
  location: string;
  /** null: not known (e.g. not found on an imported Airbnb listing). */
  bedrooms: number | null;
  bathrooms: number | null;
  maxGuests: number | null;
  amenities: AmenityId[];
  /** Amenities that aren't on our list (from an Airbnb import, the back office or typed by the host). */
  extraAmenities: string[];
  /** ISO 4217 code of the account (from the API); CurrencyCode for the sample draft. */
  currency: CurrencyCode | (string & {});
  price: number | null;
  slug: string;
  /** True once the host edits the link manually (stops auto-slugging from the name). */
  slugEdited: boolean;
}

export interface DraftPhoto {
  id: string;
  src: string;
  alt: string;
  /** Local object URL from the file picker — kept in memory only, never uploaded. */
  local: boolean;
}

export interface DraftContent {
  tone: Tone;
  /** Index of the template variant currently shown per field (advanced by "Rewrite"). */
  headlineVariant: number;
  descriptionVariant: number;
  faqVariant: number;
  /** Set when the host edits a field by hand; overrides the generated text. */
  headlineOverride: string | null;
  descriptionOverride: string | null;
  faqOverride: Faq[] | null;
}

/** What an Airbnb import found beyond the step 2 fields (the description pre-fills step 5). */
export interface DraftImport {
  listingId: string;
  url: string;
  description: string | null;
  photos: { url: string; caption: string | null }[];
  /** The photos were added to the property (step 4), so they are not offered again. */
  photosImported?: boolean;
}

export interface WizardDraft {
  account: DraftAccount | null;
  property: DraftProperty;
  photos: DraftPhoto[];
  content: DraftContent;
  theme: ThemeId;
  published: boolean;
  /** Last Airbnb import, or null. */
  imported: DraftImport | null;
}
