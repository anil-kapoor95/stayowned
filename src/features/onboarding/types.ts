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
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  amenities: AmenityId[];
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

export interface WizardDraft {
  account: DraftAccount | null;
  property: DraftProperty;
  photos: DraftPhoto[];
  content: DraftContent;
  theme: ThemeId;
  published: boolean;
}
