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

/** Saved online payment gateway of the host's property. Secret keys are never sent back, only whether one is saved. */
export interface PaymentMethodState {
  payment_method: "razorpay" | "stripe";
  is_active: boolean;
  is_test_mode: boolean;
  label: string;
  public_key: string;
  test_public_key: string;
  has_secret_key: boolean;
  has_test_secret_key: boolean;
  /** Online gateways switched on for the property (sent back by a save). */
  active_gateways?: string[];
}

/** Fields of pjActionSavePaymentMethod. An empty secret_key keeps the saved one for that mode. */
export interface PaymentMethodRequest {
  payment_method: "razorpay" | "stripe";
  is_active: 0 | 1;
  is_test_mode: 0 | 1;
  label: string;
  public_key: string;
  secret_key: string;
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
      payment_methods: Partial<Record<PaymentMethodState["payment_method"], PaymentMethodState>>;
      active_gateways: string[];
    }>("pjActionGetPaymentMethods", {}, { token }),

  /** Saves one payment gateway of the property (402: the plan allows no more gateways). */
  savePaymentMethod: (fields: PaymentMethodRequest, token: string) =>
    apiRequest<PaymentMethodState>("pjActionSavePaymentMethod", { ...fields }, { token }),
};
