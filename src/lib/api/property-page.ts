import type { PriceFormat } from "@/lib/price-format";
import { API_URL } from "./client";

/** Guest page of a published property (pjActionGetPropertyPage). */
export interface PropertyPageData {
  slug: string;
  name: string;
  property_type: string | null;
  headline: string | null;
  description: string | null;
  faqs: { question: string; answer: string }[];
  location: { city: string; state: string; country: string; lat: number | null; lng: number | null };
  bedrooms: number | null;
  bathrooms: number | null;
  max_guests: number | null;
  amenities: string[];
  price: number | null;
  price_varies: boolean;
  /** Bookings and prices per night, or per day (Options > Booking options in the back office). */
  price_based_on: "nights" | "days";
  currency: string;
  currency_sign: string;
  price_format: PriceFormat;
  photos: { url: string; thumb_url: string }[];
  host: { name: string; logo: string | null; phone: string; email: string };
  theme: {
    id: string;
    name: string;
    colors: { brand: string; accent: string; text: string; background: string; price: string; page_background: string };
  } | null;
  /** Taken dates (bookings and imported calendars), "to" is the check-out day. */
  booked: { from: string; to: string }[];
  /** Booking calendar of the back office (preview.php?cid=…). */
  booking_url: string;
}

/**
 * Loads the page on the server (always fresh: prices, photos and bookings change in the back office).
 * Returns null when there is no published property with this link.
 */
export async function getPropertyPage(slug: string): Promise<PropertyPageData | null> {
  if (!API_URL || !/^[a-z0-9-]{1,60}$/.test(slug)) return null;
  const body = new FormData();
  body.append("slug", slug);
  try {
    const response = await fetch(`${API_URL}?action=pjActionGetPropertyPage`, { method: "POST", body, cache: "no-store" });
    if (!response.ok) return null;
    const json = (await response.json()) as { status?: string; data?: PropertyPageData };
    return json.status === "OK" && json.data ? json.data : null;
  } catch {
    return null;
  }
}
