import type { PaymentMethodRequest, PaymentMethodState } from "@/lib/api/signup";

/**
 * Payment gateway connection forms. Saved to the back office with pjActionSavePaymentMethod
 * (nothing is sent to Razorpay or Stripe from here), into the same fields as the back office's
 * Properties > Payments. Secret keys are write-only: the server only reports whether one is saved.
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
  /** A secret key is already saved on the server for live / test mode (empty field = keep it). */
  savedSecret: { live: boolean; test: boolean };
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
    savedSecret: { live: false, test: false },
  };
}

function keyFields(config: GatewayConfig) {
  const publicKey = config.keys.find((key) => !key.secret);
  const secretKey = config.keys.find((key) => key.secret);
  if (!publicKey || !secretKey) throw new Error(`${config.name}: a public and a secret key field are required`);
  return { publicKey, secretKey };
}

/** Form values -> API fields. "Enable authorization" is not sent: the back office has no setting for it yet. */
export function toPaymentMethodRequest(config: GatewayConfig, settings: GatewaySettings): PaymentMethodRequest {
  const { publicKey, secretKey } = keyFields(config);
  if (!settings.enabled) {
    // Switched off: the settings are hidden, so only the switch is saved. Empty values
    // leave the saved label and keys as they are (they are back when switched on again).
    return {
      payment_method: config.id,
      is_active: 0,
      is_test_mode: settings.testMode ? 1 : 0,
      label: "",
      public_key: "",
      secret_key: "",
    };
  }
  return {
    payment_method: config.id,
    is_active: 1,
    is_test_mode: settings.testMode ? 1 : 0,
    label: settings.label.trim(),
    public_key: (settings.keys[publicKey.id] ?? "").trim(),
    secret_key: (settings.keys[secretKey.id] ?? "").trim(),
  };
}

/** Saved state from the API -> form values. The secret field is left empty (it is never sent back). */
export function fromPaymentMethodState(
  config: GatewayConfig,
  current: GatewaySettings,
  state: PaymentMethodState,
): GatewaySettings {
  const { publicKey, secretKey } = keyFields(config);
  return {
    ...current,
    enabled: state.is_active,
    testMode: state.is_test_mode,
    label: state.label,
    keys: {
      ...current.keys,
      [publicKey.id]: state.is_test_mode ? state.test_public_key : state.public_key,
      [secretKey.id]: "",
    },
    savedSecret: { live: state.has_secret_key, test: state.has_test_secret_key },
  };
}

/** True when anything was saved for the gateway (otherwise the form starts blank, switched on). */
export function hasSavedPaymentMethod(state: PaymentMethodState): boolean {
  return Boolean(
    state.is_active ||
      state.public_key ||
      state.test_public_key ||
      state.has_secret_key ||
      state.has_test_secret_key ||
      state.label,
  );
}

/** API error field -> form field id. */
export function formFieldForServerError(config: GatewayConfig, field: string): string | null {
  const { publicKey, secretKey } = keyFields(config);
  if (field === "public_key") return publicKey.id;
  if (field === "secret_key") return secretKey.id;
  if (field === "label") return "label";
  return null;
}

/** Field errors keyed by key id. Keys are only required while payments are allowed. */
export function validateGatewaySettings(config: GatewayConfig, settings: GatewaySettings): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!settings.enabled) return errors;
  const mode = settings.testMode ? "test" : "live";
  for (const key of config.keys) {
    const value = (settings.keys[key.id] ?? "").trim();
    if (!value && key.secret && settings.savedSecret[mode]) {
      continue; // keep the secret key already saved for this mode
    }
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
