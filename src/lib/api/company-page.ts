import type { PriceFormat } from "@/lib/price-format";
import type { PropertyPageData } from "./property-page";
import { API_URL } from "./client";

/** One property on the company page. */
export interface CompanyPageProperty {
  slug: string;
  name: string;
  property_type: string | null;
  headline: string | null;
  location: { city: string; state: string; country: string };
  bedrooms: number | null;
  bathrooms: number | null;
  max_guests: number | null;
  price: number | null;
  price_varies: boolean;
  price_based_on: "nights" | "days";
  currency: string;
  currency_sign: string;
  /** First photo, null when the property has none. */
  photo: string | null;
}

/** Company page: the company and all its properties on the website (pjActionGetCompanyPage). */
export interface CompanyPageData {
  slug: string;
  name: string;
  description: string | null;
  logo: string | null;
  phone: string;
  email: string;
  website: string;
  /** Cities of the properties (filter chips). */
  places: string[];
  price_format: PriceFormat;
  theme: PropertyPageData["theme"];
  /** Show "Designed by PHPJabbers" (set per plan in the back office). */
  branding?: boolean;
  /** Text and link of the branding line (System Options > Visual & Branding). */
  branding_line?: { text: string; footer: string; url: string };
  properties: CompanyPageProperty[];
}

/**
 * Loads the page on the server (always fresh: properties, prices and photos change in the back office).
 * Returns null when there is no active company with this link or it has no property on the website.
 */
export async function getCompanyPage(slug: string): Promise<CompanyPageData | null> {
  if (!API_URL || !/^[a-z0-9-]{1,60}$/.test(slug)) return null;
  const body = new FormData();
  body.append("slug", slug);
  try {
    const response = await fetch(`${API_URL}?action=pjActionGetCompanyPage`, { method: "POST", body, cache: "no-store" });
    if (!response.ok) return null;
    const json = (await response.json()) as { status?: string; data?: CompanyPageData };
    return json.status === "OK" && json.data ? json.data : null;
  } catch {
    return null;
  }
}
