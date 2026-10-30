import type { PaymentMethodId, PaymentMethodRequest, PaymentMethodState } from "@/lib/api/signup";

/**
 * Payment method forms (PayPal, Authorize.Net, Razorpay, Stripe, Cash). Saved with pjActionSavePaymentMethod
 * into the same fields as the back office's Properties > Payments, per property; nothing is sent to the
 * providers from here. Which methods exist, which are free / Pro and whether one is locked come from the
 * back office; this file only has the wording of each form. Secret fields are write-only.
 */

export type GatewayId = PaymentMethodId;

export interface GatewayKeyField {
  /** Field name of the API (pjJabbApi::$paymentGateways). */
  id: string;
  label: string;
  placeholder: { live: string; test: string };
  hint: string;
  /** Masked, with a Show/Hide toggle; never sent back by the server. */
  secret: boolean;
  /** Not needed to switch the method on. */
  optional?: boolean;
  /** Select from the time zones instead of typing. */
  timezone?: boolean;
  /** Expected prefixes in live / test mode, e.g. rzp_live_ / rzp_test_. */
  prefix?: { live: string; test: string };
  /** Other accepted prefixes, e.g. Stripe restricted keys (rk_live_ / rk_test_). */
  altPrefixes?: { live: string[]; test: string[] };
}

export interface GatewayConfig {
  id: GatewayId;
  name: string;
  /** Letter shown in the square logo tile. */
  initial: string;
  /** Background class of the logo tile (a colour token). */
  tileClass: string;
  /** One line on the list. */
  summary: string;
  description: string;
  allowHint: string;
  labelPlaceholder: string;
  /** Cash: no keys, no test mode. */
  offline?: boolean;
  keys: GatewayKeyField[];
}

export interface GatewaySettings {
  enabled: boolean;
  label: string;
  testMode: boolean;
  /** Values typed for the current mode (secrets start empty). */
  keys: Record<string, string>;
  /** Saved values of the non-secret fields per mode (shown again when test mode is switched). */
  savedValues: { live: Record<string, string>; test: Record<string, string> };
  /** Secret fields with a saved value per mode (empty field = keep it). */
  savedSecret: { live: Record<string, boolean>; test: Record<string, boolean> };
}

export const GATEWAY_CONFIGS: Record<GatewayId, GatewayConfig> = {
  paypal: {
    id: "paypal",
    name: "PayPal",
    initial: "P",
    tileClass: "bg-brand-paypal",
    summary: "PayPal balance and cards, trusted by travellers worldwide",
    description: "Get paid with PayPal and cards. Money goes straight to your PayPal account.",
    allowHint: "Guests can pay with PayPal at checkout.",
    labelPlaceholder: "Pay with PayPal or card",
    keys: [
      {
        id: "client_id",
        label: "PayPal client ID",
        placeholder: { live: "Your live client ID", test: "Your sandbox client ID" },
        hint: "PayPal Developer Dashboard > Apps & Credentials (Live or Sandbox) > your app.",
        secret: false,
      },
      {
        id: "secret",
        label: "PayPal secret",
        placeholder: { live: "Your live secret", test: "Your sandbox secret" },
        hint: "Shown next to the client ID. Keep it private.",
        secret: true,
      },
    ],
  },
  authorize: {
    id: "authorize",
    name: "Authorize.Net",
    initial: "A",
    tileClass: "bg-secondary",
    summary: "Cards with a US merchant account",
    description: "Take card payments through your Authorize.Net merchant account.",
    allowHint: "Guests can pay by card with Authorize.Net at checkout.",
    labelPlaceholder: "Pay by card",
    keys: [
      {
        id: "login_id",
        label: "API login ID",
        placeholder: { live: "Your API login ID", test: "Your sandbox API login ID" },
        hint: "Merchant Interface > Account > Settings > API Credentials & Keys.",
        secret: false,
      },
      {
        id: "transaction_key",
        label: "Transaction key",
        placeholder: { live: "16 characters", test: "16 characters" },
        hint: "Created on the same page. Keep it private.",
        secret: true,
      },
      {
        id: "signature_key",
        label: "Signature key",
        placeholder: { live: "128 characters", test: "128 characters" },
        hint: "Used to check payment notifications. Keep it private.",
        secret: true,
        optional: true,
      },
      {
        id: "tz",
        label: "Time zone",
        placeholder: { live: "Choose a time zone", test: "Choose a time zone" },
        hint: "The time zone of your Authorize.Net account.",
        secret: false,
        timezone: true,
      },
    ],
  },
  razorpay: {
    id: "razorpay",
    name: "Razorpay",
    initial: "R",
    tileClass: "bg-brand-cashfree",
    summary: "UPI, cards, net banking and wallets in India",
    description: "Get paid by UPI, cards and net banking. Money goes straight to your account.",
    allowHint: "Guests can pay with Razorpay at checkout.",
    labelPlaceholder: "Pay with UPI, card or net banking",
    keys: [
      {
        id: "key_id",
        label: "Razorpay key ID",
        placeholder: { live: "rzp_live_xxxxxxxxxxxxxx", test: "rzp_test_xxxxxxxxxxxxxx" },
        hint: "Dashboard > Account & Settings > API Keys.",
        secret: false,
        prefix: { live: "rzp_live_", test: "rzp_test_" },
      },
      {
        id: "key_secret",
        label: "Razorpay key secret",
        placeholder: { live: "Your key secret", test: "Your key secret" },
        hint: "Shown once when the key is created. Keep it private.",
        secret: true,
      },
    ],
  },
  stripe: {
    id: "stripe",
    name: "Stripe",
    initial: "S",
    tileClass: "bg-brand-stripe",
    summary: "International cards, Apple Pay & 135+ currencies",
    description: "Get paid by international cards and Apple Pay in 135+ currencies. Money goes straight to your account.",
    allowHint: "Guests can pay with Stripe at checkout.",
    labelPlaceholder: "Stripe",
    keys: [
      {
        id: "public_key",
        label: "Stripe public key",
        placeholder: { live: "pk_live_xxxxxxxxxxxxxx", test: "pk_test_xxxxxxxxxxxxxx" },
        hint: "Developers > API keys.",
        secret: false,
        prefix: { live: "pk_live_", test: "pk_test_" },
      },
      {
        id: "secret_key",
        label: "Stripe secret key",
        placeholder: { live: "sk_live_xxxxxxxxxxxxxx", test: "sk_test_xxxxxxxxxxxxxx" },
        hint: "On the same page. Keep it private.",
        secret: true,
        prefix: { live: "sk_live_", test: "sk_test_" },
        altPrefixes: { live: ["rk_live_"], test: ["rk_test_"] },
      },
    ],
  },
  cash: {
    id: "cash",
    name: "Cash",
    initial: "C",
    tileClass: "bg-success",
    summary: "Guests pay you on arrival",
    description: "Guests book online and pay you in cash when they arrive.",
    allowHint: "Guests can choose to pay in cash at the property.",
    labelPlaceholder: "Pay in cash on arrival",
    offline: true,
    keys: [],
  },
};

export function emptyGatewaySettings(config: GatewayConfig): GatewaySettings {
  return {
    enabled: true,
    label: "",
    testMode: false,
    keys: Object.fromEntries(config.keys.map((key) => [key.id, ""])),
    savedValues: { live: {}, test: {} },
    savedSecret: { live: {}, test: {} },
  };
}

/** Values shown for a mode: the saved non-secret values, empty secrets. */
function keysForMode(config: GatewayConfig, settings: GatewaySettings, mode: "live" | "test") {
  return Object.fromEntries(config.keys.map((key) => [key.id, key.secret ? "" : settings.savedValues[mode][key.id] ?? ""]));
}

/** Switches the form between live and test mode: the fields show what is saved for the new mode. */
export function switchTestMode(config: GatewayConfig, settings: GatewaySettings, testMode: boolean): GatewaySettings {
  return { ...settings, testMode, keys: keysForMode(config, settings, testMode ? "test" : "live") };
}

/** Form values -> API fields. */
export function toPaymentMethodRequest(config: GatewayConfig, settings: GatewaySettings): PaymentMethodRequest {
  // Switched off: only the switch is saved; the saved label and keys stay for when it is switched on again.
  const keys = settings.enabled ? Object.fromEntries(Object.entries(settings.keys).map(([k, v]) => [k, v.trim()])) : {};
  return {
    payment_method: config.id,
    is_active: settings.enabled ? 1 : 0,
    is_test_mode: settings.testMode && !config.offline ? 1 : 0,
    label: settings.enabled ? settings.label.trim() : "",
    keys: JSON.stringify(keys),
  };
}

/** Saved state from the API -> form values. */
export function fromPaymentMethodState(config: GatewayConfig, current: GatewaySettings, state: PaymentMethodState): GatewaySettings {
  const next: GatewaySettings = {
    ...current,
    enabled: state.is_active,
    testMode: state.is_test_mode,
    label: state.label,
    savedValues: state.values,
    savedSecret: state.saved_secrets,
  };
  return { ...next, keys: keysForMode(config, next, state.is_test_mode ? "test" : "live") };
}

/** True when anything was saved for the method (otherwise the form starts blank, switched on). */
export function hasSavedPaymentMethod(state: PaymentMethodState): boolean {
  const any = (values: Record<string, string | boolean>) => Object.values(values).some(Boolean);
  return Boolean(
    state.is_active ||
      state.label ||
      any(state.values.live) ||
      any(state.values.test) ||
      any(state.saved_secrets.live) ||
      any(state.saved_secrets.test),
  );
}

/** API error field -> form field id (the API uses the same field names). */
export function formFieldForServerError(config: GatewayConfig, field: string): string | null {
  if (field === "label") return "label";
  return config.keys.some((key) => key.id === field) ? field : null;
}

/** Field errors keyed by field id. Fields are only required while the method is switched on. */
export function validateGatewaySettings(config: GatewayConfig, settings: GatewaySettings): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!settings.enabled) return errors;
  const mode = settings.testMode ? "test" : "live";
  for (const key of config.keys) {
    const value = (settings.keys[key.id] ?? "").trim();
    if (!value) {
      // a saved secret is kept; optional fields may stay empty
      if (key.optional || (key.secret && settings.savedSecret[mode][key.id])) continue;
      errors[key.id] = key.timezone ? "Choose the time zone of your account." : `Enter your ${key.label}.`;
    } else if (key.prefix && ![key.prefix[mode], ...(key.altPrefixes?.[mode] ?? [])].some((p) => value.startsWith(p))) {
      const other = mode === "live" ? "test" : "live";
      errors[key.id] = [key.prefix[other], ...(key.altPrefixes?.[other] ?? [])].some((p) => value.startsWith(p))
        ? `Test mode is ${settings.testMode ? "on" : "off"}, so use your ${mode} key (${key.prefix[mode]}…).`
        : `This doesn't look like a ${config.name} key. It should start with ${key.prefix[mode]}.`;
    } else if (!key.timezone && /\s/.test(value)) {
      errors[key.id] = "Remove the spaces from the key.";
    }
  }
  return errors;
}
