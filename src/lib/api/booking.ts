import type { PriceFormat } from "@/lib/price-format";
import type { PropertyPageData } from "./property-page";
import { API_URL, apiRequest } from "./client";

/**
 * Booking on the host's website (/property/<slug>/book). Everything comes from the property's settings in the
 * back office (pjJabbApi::pjActionBookingSetup / Quote / Create / Status): guests, booking form fields, extras,
 * coupons, prices, payment methods, terms and the texts of the pages.
 */

export interface BookingField {
  /** c_name, c_email, c_phone, c_country, c_address, c_city, c_state, c_zip, c_notes */
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "country" | "textarea";
  required: boolean;
}

export interface BookingExtra {
  id: number;
  name: string;
  price: number;
  /** person | night | person_night | count | count_night | one_time */
  price_type: string;
  /** Always included (the host made it required). */
  required: boolean;
  /** Most of it a guest can take (1 = on / off). */
  max: number;
}

export interface BookingPaymentMethod {
  id: string;
  title: string;
  /** Online gateway (pay now on its secure page); false: cash / bank transfer. */
  online: boolean;
}

export interface BookingSetup {
  slug: string;
  property: {
    name: string;
    photo: string | null;
    city: string;
    state: string;
    country: string;
    price: number | null;
    price_based_on: "nights" | "days";
    currency: string;
    currency_sign: string;
    price_format: PriceFormat;
    theme: PropertyPageData["theme"];
    branding: boolean;
    host: { name: string; phone: string; logo: string | null };
  };
  guests: {
    adults: { show: boolean; required: boolean; max: number };
    children: { show: boolean; required: boolean; max: number };
    min_people: number | null;
    max_people: number | null;
  };
  fields: BookingField[];
  countries: { id: string; name: string | null }[];
  extras: BookingExtra[];
  /** Price type => text ("per person", …) from the back office. */
  extra_price_types: Record<string, string>;
  /** Coupons and discounts are in the company's plan. */
  coupons: boolean;
  payment_methods: BookingPaymentMethod[];
  terms: { required: boolean; label: string; url: string; body: string } | null;
  /** Taken dates, "to" = check-out day. */
  /** Taken dates, next 12 months ("to" = check-out day); pending = waiting for the host / payment. */
  booked: { from: string; to: string; status?: "pending" | "booked" }[];
  /** First day of the week of the calendar: 0 = Sunday, 1 = Monday ... */
  week_start?: number;
  /** Texts of the booking pages (back office > Languages). */
  labels: Record<string, string>;
}

export interface BookingQuote {
  available: boolean;
  nights: number;
  amount: number;
  extra_price: number;
  promo_valid: boolean;
  promo_amount: number;
  promo_code: string;
  promo_error: string;
  discount_valid: boolean;
  discount_amount: number;
  discount_name: string;
  tax: number;
  tourist_tax: number;
  security: number;
  total: number;
  /** To pay now (0 = nothing to pay now). */
  deposit: number;
  on_arrival: number;
  extras: Record<string, number>;
}

export interface BookingRequest {
  date_from: string;
  date_to: string;
  adults: number;
  children: number;
  /** extra id => quantity */
  extras: Record<number, number>;
  promo_code: string;
}

export interface BookingCreated {
  reference: string;
  status: string;
  payment: { method: string; online: boolean; pay_url: string | null; bank_account: string };
  price: BookingQuote;
}

export interface BookingStatus {
  reference: string;
  status: string;
  paid: boolean;
  date_from: string;
  date_to: string;
  adults: number;
  children: number;
  email: string;
  extras: { name: string; qty: number }[];
  payment_method: string;
  payment_title: string;
  bank_account: string;
  total: number;
  deposit: number;
  security: number;
}

/** Booking page setup, loaded on the server (always fresh). null: no public property with this link. */
export async function getBookingSetup(slug: string): Promise<BookingSetup | null> {
  if (!API_URL || !/^[a-z0-9-]{1,60}$/.test(slug)) return null;
  const body = new FormData();
  body.append("slug", slug);
  try {
    const response = await fetch(`${API_URL}?action=pjActionBookingSetup`, { method: "POST", body, cache: "no-store" });
    if (!response.ok) return null;
    const json = (await response.json()) as { status?: string; data?: BookingSetup };
    return json.status === "OK" && json.data ? json.data : null;
  } catch {
    return null;
  }
}

const requestFields = (slug: string, r: BookingRequest) => ({
  slug,
  date_from: r.date_from,
  date_to: r.date_to,
  adults: r.adults,
  children: r.children,
  extras: JSON.stringify(r.extras),
  promo_code: r.promo_code,
});

export const bookingApi = {
  quote: (slug: string, r: BookingRequest, signal?: AbortSignal) =>
    apiRequest<BookingQuote>("pjActionBookingQuote", requestFields(slug, r), { signal }),

  create: (slug: string, r: BookingRequest, details: Record<string, string>, paymentMethod: string, terms: boolean) =>
    apiRequest<BookingCreated>("pjActionBookingCreate", {
      ...requestFields(slug, r),
      ...details,
      payment_method: paymentMethod,
      terms: terms ? "1" : "",
    }),

  status: (slug: string, ref: string) => apiRequest<BookingStatus>("pjActionBookingStatus", { slug, ref }),
};

/** Text of the back office with {TOKEN}s filled in. */
export function label(labels: Record<string, string>, key: string, tokens: Record<string, string | number> = {}): string {
  let text = labels[key] ?? key;
  for (const [token, value] of Object.entries(tokens)) text = text.split(`{${token}}`).join(String(value));
  return text;
}
