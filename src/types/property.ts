import type { IconName } from "@/components/ui/Icon";

export const PROPERTY_TYPES = ["villa", "homestay", "apartment", "cottage", "resort"] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const CURRENCIES = ["INR", "USD", "EUR", "GBP"] as const;
export type CurrencyCode = (typeof CURRENCIES)[number];

export const THEME_IDS = ["casa", "luxe", "homestay", "urban", "coastal"] as const;
export type ThemeId = (typeof THEME_IDS)[number];

export type AmenityId =
  | "private-pool"
  | "wifi"
  | "air-conditioning"
  | "kitchen"
  | "workspace"
  | "parking"
  | "power-backup"
  | "pet-friendly"
  | "washing-machine"
  | "housekeeping"
  | "chef"
  | "barbeque";

export interface Amenity {
  id: AmenityId;
  label: string;
  /** Short label for compact preview cards ("Pool", "Fast Wi-Fi"). */
  shortLabel: string;
  icon: IconName;
}

export interface PropertyImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface PropertyLocation {
  /** Neighbourhood or village, e.g. "Assagao" */
  locality: string;
  /** Region, e.g. "North Goa" */
  region: string;
  country: string;
}

export interface Price {
  amount: number;
  currency: CurrencyCode;
  unit: "night";
}

export interface Rating {
  average: number;
  count: number;
}

export interface Faq {
  question: string;
  answer: string;
}

export interface DateRange {
  /** ISO date (yyyy-mm-dd), inclusive */
  from: string;
  /** ISO date (yyyy-mm-dd), exclusive (check-out day) */
  to: string;
}

export interface Availability {
  checkInTime: string;
  checkOutTime: string;
  minNights: number;
  /** Already-booked stays; the inquiry form blocks overlapping requests. */
  booked: DateRange[];
}

export interface Host {
  name: string;
  responseTime: string;
}

export interface Property {
  id: string;
  slug: string;
  name: string;
  type: PropertyType;
  /** "3 BHK Villa" */
  summary: string;
  headline: string;
  description: string;
  location: PropertyLocation;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  amenities: AmenityId[];
  /** Short highlight tags shown under the headline ("5 min to Vagator beach"). */
  highlights: string[];
  images: PropertyImage[];
  price: Price;
  rating?: Rating;
  faqs: Faq[];
  theme: ThemeId;
  host: Host;
  availability: Availability;
  featured?: boolean;
}

export type PropertySort = "recommended" | "price-asc" | "price-desc" | "rating";

export interface PropertyQuery {
  search?: string;
  type?: PropertyType;
  guests?: number;
  sort?: PropertySort;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
