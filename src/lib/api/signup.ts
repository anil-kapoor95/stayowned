import { apiRequest } from "./client";

/* ---------------------------------------------------------------- Types */

export type SignupStepName = "account" | "company" | "property" | "photos" | "description" | "theme";

export interface SignupCompany {
  name: string | null;
  legal_name: string | null;
  registration_no: string | null;
  tax_no: string | null;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address_1: string | null;
  address_2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country_id: string | null;
  description: string | null;
  logo: string | null;
}

export interface SignupProperty {
  id: number;
  name: string;
  address_1: string;
  city: string;
  state: string | null;
  zip: string | null;
  country_id: string | null;
  bedrooms: string | null;
  bathrooms: string | null;
  ical_urls: string[];
  /** Price per night from the prices table: the default price, or the lowest weekday price when they differ. */
  price: number | null;
  /** True when the weekday prices differ (changed in the back office). */
  price_varies: boolean;
  currency: string;
  /** "Max people" of the property (Limits in the back office). */
  max_guests: number | null;
  /** villa | homestay | apartment | cottage | resort, or null when not saved yet. */
  property_type?: string | null;
  /** Names of the property's amenities (Properties > Features in the back office). */
  amenities?: string[];
}

export type ContentTone = "warm" | "premium" | "simple";

export interface SignupFaq {
  question: string;
  answer: string;
}

/** Texts pjActionSignupGenerateDescription returns (only the field asked for when `field` is set). */
export interface GeneratedContent {
  tone: ContentTone;
  headline?: string;
  description?: string;
  faqs?: SignupFaq[];
  ai_generations_left: number;
}

export type ContentField = "headline" | "description" | "faqs";

export interface SignupPhoto {
  id: number;
  file_name: string;
  url: string;
  thumb_url: string;
}

/** What pjActionSignupStatus (and every successful step) returns. */
export interface SignupState {
  status: "pending" | "completed";
  completed_steps: number;
  total_steps: number;
  next_step: number | "done";
  next_step_name: SignupStepName | "done";
  account: { first_name: string; last_name: string; name: string; email: string; phone: string };
  company: SignupCompany | null;
  property: SignupProperty | null;
  photos: SignupPhoto[];
  description: string | null;
  headline: string | null;
  faqs: SignupFaq[];
  /** Tone last chosen on step 5 (null until saved). */
  tone: ContentTone | null;
  /** Currency code of the account's prices. */
  currency: string;
  theme: { palette_id: string | null; font_family: string } | null;
  ai_available: boolean;
  /** AI writing is set up but not in the account's plan (paid plans only). */
  ai_locked?: boolean;
  /** Sign of the account's currency (back-office currency data). */
  currency_sign?: string;
  /** System options > Price format and currency position. */
  price_format?: { price_format: number; currency_place: "front" | "back" };
  ai_generations_left: number;
  login_url?: string;
  /* Extra keys some steps add */
  signup_token?: string;
  resumed?: boolean;
  logo_error?: string;
  photo_errors?: { file: string; error: string }[];
  ical_import?: { status: "OK" | "ERR"; text: string };
  theme_applied?: boolean;
}

/** Verified Google account details returned for a new sign-up. */
export interface GoogleProfile {
  email: string;
  name: string;
}

export interface Country {
  id: string;
  alpha_2: string;
  name: string | null;
}

export interface ApiTheme {
  id: string;
  name: string;
  colors: {
    brand: string;
    accent: string;
    text: string;
    background: string;
    price: string;
    page_background: string;
  };
  /** The free theme (the first one). */
  free?: boolean;
  /** Needs a plan with themes that this account doesn't have. */
  locked?: boolean;
}

/** A plan from the back office (Subscriptions > Plans), for the upgrade dialog. */
export interface ApiPlan {
  id: number;
  code: string;
  name: string;
  description: string;
  /** null: no price set yet (can't be bought online). */
  price: number | null;
  currency: string;
  billing_interval: "month" | "year";
  interval_count: number;
  trial_days: number;
  features: { key: string; label: string }[];
  includes_themes: boolean;
  /** Can be bought online (active, public, with a price). */
  purchasable: boolean;
}

export type PaymentMethodId = "paypal" | "authorize" | "razorpay" | "stripe" | "cash";

/**
 * A payment method of the host's property (Properties > Payments in the back office).
 * Secret fields are never sent back, only whether one is saved (per mode).
 */
export interface PaymentMethodState {
  payment_method: PaymentMethodId;
  name: string;
  /** free: every plan (PayPal, cash); pro: plans with "Payment gateway choice". */
  tier: "free" | "pro";
  /** Cash: only switched on / off (no keys, no test mode). */
  offline: boolean;
  /** Pro method without a plan that includes it. */
  locked: boolean;
  is_active: boolean;
  is_test_mode: boolean;
  label: string;
  /** Saved values of the non-secret fields, per mode. */
  values: { live: Record<string, string>; test: Record<string, string> };
  /** Secret fields with a saved value, per mode. */
  saved_secrets: { live: Record<string, boolean>; test: Record<string, boolean> };
  /** Online gateways switched on for the property (sent back by a save). */
  active_gateways?: string[];
}

/** Fields of pjActionSavePaymentMethod. keys: JSON {field: value} for the mode sent (an empty secret keeps the saved one). */
export interface PaymentMethodRequest {
  payment_method: PaymentMethodId;
  is_active: 0 | 1;
  is_test_mode: 0 | 1;
  label: string;
  keys: string;
}

/* ------------------------------------------------------------ Endpoints */

type Fields = Record<string, string | number | undefined>;

export const signupApi = {
  account: (fields: Fields, token?: string | null) =>
    apiRequest<SignupState>("pjActionSignupAccount", fields, { token }),

  company: (form: FormData, token: string) => apiRequest<SignupState>("pjActionSignupCompany", form, { token }),

  property: (fields: Fields, token: string) => apiRequest<SignupState>("pjActionSignupProperty", fields, { token }),

  photos: (files: File[], token: string) => {
    const form = new FormData();
    files.forEach((file) => form.append("photos[]", file, file.name));
    return apiRequest<SignupState>("pjActionSignupPhotos", form, { token });
  },

  deletePhoto: (photoId: number, token: string) =>
    apiRequest<SignupState>("pjActionSignupDeletePhoto", { photo_id: photoId }, { token }),

  /** AI texts in English. `field` + `current` rewrite one card; without them all three are written. */
  generateContent: (tone: ContentTone, token: string, field?: ContentField, current?: string) =>
    apiRequest<GeneratedContent>(
      "pjActionSignupGenerateDescription",
      { tone, field: field ?? "all", current: current || undefined },
      { token },
    ),

  description: (
    content: { headline: string; description: string; faqs: SignupFaq[]; tone: ContentTone },
    token: string,
  ) =>
    apiRequest<SignupState>(
      "pjActionSignupDescription",
      {
        headline: content.headline,
        description: content.description,
        faqs: JSON.stringify(content.faqs),
        tone: content.tone,
      },
      { token },
    ),

  themes: (token?: string | null) =>
    apiRequest<{ themes: ApiTheme[]; default_id: string; free_id?: string; allowed: boolean }>(
      "pjActionGetThemes",
      {},
      { token },
    ),

  /** Currencies of System options > Currency (with signs), the account's currency and the price format. */
  currencies: (token?: string | null) =>
    apiRequest<{
      currencies: { code: string; sign: string }[];
      default: string;
      price_format: number;
      currency_place: "front" | "back";
    }>("pjActionGetCurrencies", {}, { token }),

  /** Is this company name free? (The sign-up's own company doesn't count.) */
  checkCompanyName: (name: string, token?: string | null) =>
    apiRequest<{ available: boolean }>("pjActionCheckCompanyName", { name }, { token }),

  /** Is this property name free? (The sign-up's own property doesn't count.) */
  checkPropertyName: (name: string, token?: string | null) =>
    apiRequest<{ available: boolean }>("pjActionCheckPropertyName", { name }, { token }),

  /** Plans to buy, the account's current plan and the dashboard page where plans are bought. */
  plans: (token?: string | null) =>
    apiRequest<{
      plans: ApiPlan[];
      current: { code: string; name: string; status: string } | null;
      my_plan_url: string;
    }>("pjActionGetPlans", {}, { token }),

  theme: (paletteId: string, token: string) =>
    apiRequest<SignupState>("pjActionSignupTheme", { palette_id: paletteId }, { token }),

  status: (token: string) => apiRequest<SignupState>("pjActionSignupStatus", {}, { token }),

  resume: (email: string, password: string) => apiRequest<SignupState>("pjActionSignupResume", { email, password }),

  /** Host log-in (unfinished or completed sign-up): new token + state. 404 data.login_url: no StayOwned page. */
  login: (email: string, password: string) => apiRequest<SignupState>("pjActionSignupLogin", { email, password }),

  logout: (token: string) => apiRequest<unknown>("pjActionSignupLogout", {}, { token }),

  /** Settings for sign-in: Google OAuth client id ("" when Google sign-in is not set up). */
  authConfig: () => apiRequest<{ google_client_id: string }>("pjActionGetAuthConfig"),

  /** "Continue with Google": logs in (state + token), or tells that a new account is needed. */
  google: (accessToken: string, clientId: string) =>
    apiRequest<SignupState & { new_account?: boolean; google?: GoogleProfile }>("pjActionSignupGoogle", {
      access_token: accessToken,
      // Used by the back end only while its app/config/google.php has no client id.
      client_id: clientId,
    }),

  checkEmail: (email: string, token?: string | null) =>
    apiRequest<{ available: boolean }>("pjActionCheckEmail", { email }, { token }),

  checkPassword: (password: string) => apiRequest<{ valid: boolean }>("pjActionCheckPassword", { password }),

  countries: () => apiRequest<{ countries: Country[] }>("pjActionGetCountries"),

  /** Is this Airbnb listing already connected (its iCal link saved for a property)? Used by /api/airbnb-import. */
  checkAirbnbListing: (listingId: string, token: string) =>
    apiRequest<{ listing_id: string; status: "none" | "this_property" | "company" | "other" }>(
      "pjActionCheckAirbnbListing",
      { listing_id: listingId },
      { token },
    ),

  /** Saved Razorpay / Stripe settings of the property, to fill in the payment popups. */
  paymentMethods: (token: string) =>
    apiRequest<{
      payment_methods: PaymentMethodState[];
      pro_allowed: boolean;
      active_gateways: string[];
    }>("pjActionGetPaymentMethods", {}, { token }),

  /** Saves one payment method of the property (402: a Pro method without the plan, or no more gateways allowed). */
  savePaymentMethod: (fields: PaymentMethodRequest, token: string) =>
    apiRequest<PaymentMethodState>("pjActionSavePaymentMethod", { ...fields }, { token }),
};
