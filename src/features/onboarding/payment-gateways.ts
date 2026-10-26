/**
 * Payment gateway connection forms (front end only — nothing is sent to the provider).
 * Razorpay copy comes from the "Connect Razorpay" design; Stripe uses the same layout with
 * the fields of the existing Stripe settings form (public key, secret key, authorization).
 */

export type GatewayId = "razorpay" | "stripe";

export interface GatewayKeyField {
  id: string;
  label: string;
  /** Placeholders for live and test mode. */
  placeholder: { live: string; test: string };
  hint: string;
  /** Secret keys are masked and get a Show/Hide toggle. */
  secret: boolean;
  /** Expected key prefixes, e.g. rzp_live_ / rzp_test_. Omitted for secrets the provider doesn't prefix. */
  prefix?: { live: string; test: string };
}

export interface GatewayExtraToggle {
  id: string;
  title: string;
  description?: string;
}

export interface GatewayConfig {
  id: GatewayId;
  name: string;
  /** Letter shown in the square logo tile. */
  initial: string;
  /** Background class of the logo tile (a colour token). */
  tileClass: string;
  description: string;
  allowHint: string;
  labelPlaceholder: string;
  keys: GatewayKeyField[];
  extraToggles: GatewayExtraToggle[];
}

export interface GatewaySettings {
  enabled: boolean;
  label: string;
  testMode: boolean;
  keys: Record<string, string>;
  toggles: Record<string, boolean>;
}

export const GATEWAY_CONFIGS: Record<GatewayId, GatewayConfig> = {
  razorpay: {
    id: "razorpay",
    name: "Razorpay",
    initial: "R",
    tileClass: "bg-secondary",
    description: "Get paid by UPI, cards and net banking. Money goes straight to your account.",
    allowHint: "Guests can pay with Razorpay at checkout.",
    labelPlaceholder: "Pay with UPI, card or net banking",
    keys: [
      {
        id: "keyId",
        label: "Razorpay key ID",
        placeholder: { live: "rzp_live_xxxxxxxxxxxxxx", test: "rzp_test_xxxxxxxxxxxxxx" },
        hint: "This is your Razorpay key ID, found in Dashboard > Account & Settings > API Keys.",
        secret: false,
        prefix: { live: "rzp_live_", test: "rzp_test_" },
      },
      {
        id: "keySecret",
        label: "Razorpay key secret",
        placeholder: { live: "Your key secret", test: "Your key secret" },
        hint: "This is your Razorpay key secret. Keep it private.",
        secret: true,
      },
    ],
    extraToggles: [],
  },
  stripe: {
    id: "stripe",
    name: "Stripe",
    initial: "S",
    tileClass: "bg-brand-stripe",
    // Adapted from the existing gateway list copy ("International cards, Apple Pay & 135+ currencies").
    description: "Get paid by international cards and Apple Pay in 135+ currencies. Money goes straight to your account.",
    allowHint: "Guests can pay with Stripe at checkout.",
    // The old Stripe form's default label was "Stripe".
    labelPlaceholder: "Stripe",
    keys: [
      {
        id: "publicKey",
        label: "Stripe public key",
        placeholder: { live: "pk_live_xxxxxxxxxxxxxx", test: "pk_test_xxxxxxxxxxxxxx" },
        hint: "This is your Stripe public key.",
        secret: false,
        prefix: { live: "pk_live_", test: "pk_test_" },
      },
      {
        id: "secretKey",
        label: "Stripe secret key",
        placeholder: { live: "sk_live_xxxxxxxxxxxxxx", test: "sk_test_xxxxxxxxxxxxxx" },
        hint: "This is your Stripe secret key. Keep it private.",
        secret: true,
        prefix: { live: "sk_live_", test: "sk_test_" },
      },
    ],
    // From the existing Stripe form. It has no description there, so none is shown.
    extraToggles: [{ id: "authorization", title: "Enable authorization" }],
  },
};

export function emptyGatewaySettings(config: GatewayConfig): GatewaySettings {
  return {
    enabled: true,
    label: "",
    testMode: false,
    keys: Object.fromEntries(config.keys.map((key) => [key.id, ""])),
    toggles: Object.fromEntries(config.extraToggles.map((toggle) => [toggle.id, false])),
  };
}

/** Field errors keyed by key id. Keys are only required while payments are allowed. */
export function validateGatewaySettings(config: GatewayConfig, settings: GatewaySettings): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!settings.enabled) return errors;
  const mode = settings.testMode ? "test" : "live";
  for (const key of config.keys) {
    const value = (settings.keys[key.id] ?? "").trim();
    if (!value) {
      errors[key.id] = `Enter your ${key.label}.`;
    } else if (key.prefix && !value.startsWith(key.prefix[mode])) {
      const other = mode === "live" ? "test" : "live";
      errors[key.id] = value.startsWith(key.prefix[other])
        ? `Test mode is ${settings.testMode ? "on" : "off"}, so use your ${mode} key (${key.prefix[mode]}…).`
        : `This doesn't look like a ${config.name} key. It should start with ${key.prefix[mode]}.`;
    } else if (/\s/.test(value)) {
      errors[key.id] = "Remove the spaces from the key.";
    }
  }
  return errors;
}
