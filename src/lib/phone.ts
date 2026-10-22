import { MAIN_COUNTRY_FOR_DIAL_CODE, PHONE_COUNTRIES, type PhoneCountry } from "@/data/phone-countries";

/** Country shown first when nothing else is known. */
export const DEFAULT_PHONE_COUNTRY = "IN";

const byCode = new Map(PHONE_COUNTRIES.map((country) => [country.code, country]));
const patternCache = new Map<string, RegExp>();

export function getPhoneCountry(code: string | null | undefined): PhoneCountry {
  return byCode.get((code ?? "").toUpperCase()) ?? byCode.get(DEFAULT_PHONE_COUNTRY)!;
}

/** 🇮🇳 from "IN" */
export function flagEmoji(code: string): string {
  return /^[A-Z]{2}$/.test(code)
    ? String.fromCodePoint(...[...code].map((char) => 0x1f1e6 + char.charCodeAt(0) - 65))
    : "";
}

function patternOf(country: PhoneCountry): RegExp {
  let re = patternCache.get(country.code);
  if (!re) {
    re = new RegExp(`^(?:${country.pattern})$`);
    patternCache.set(country.code, re);
  }
  return re;
}

function matches(country: PhoneCountry, digits: string) {
  return country.lengths.includes(digits.length) && patternOf(country).test(digits);
}

const detectCache = new Map<string, RegExp>();
/** A valid number that also fits this country's own area codes (only differs for shared calling codes). */
function belongs(country: PhoneCountry, digits: string) {
  if (!matches(country, digits)) return false;
  if (!country.detect) return true;
  let re = detectCache.get(country.code);
  if (!re) {
    re = new RegExp(country.detect);
    detectCache.set(country.code, re);
  }
  return re.test(digits);
}

/**
 * The national number of a valid phone number for this country (digits only), or null.
 * A trunk "0" typed in front (07400 123456) is accepted and removed.
 */
export function nationalNumber(country: PhoneCountry, input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (matches(country, digits)) return digits;
  const withoutTrunk = digits.replace(/^0+/, "");
  return withoutTrunk !== digits && matches(country, withoutTrunk) ? withoutTrunk : null;
}

/** Error text for a phone field, or undefined when it is valid (or empty and optional). */
export function validatePhoneNumber(
  country: PhoneCountry,
  input: string,
  { required = true, label = "phone number" } = {},
): string | undefined {
  if (!input.replace(/\D/g, "")) return required ? `Please enter your ${label}.` : undefined;
  if (nationalNumber(country, input) === null) {
    return `Enter a valid ${country.name} number${country.example ? `, like ${country.example}` : ""}.`;
  }
  return undefined;
}

/** "+91 9876543210": what the back end stores. */
export function toInternational(country: PhoneCountry, input: string): string {
  const national = nationalNumber(country, input) ?? input.replace(/\D/g, "");
  return `${country.dialCode} ${national}`;
}

/**
 * Splits a stored or pasted international number: "+44 7400 123456" -> { country: "GB", number: "7400123456" }.
 * For calling codes shared by several countries (+1, +44, +7…) the country whose rules fit the number wins.
 * Numbers without "+" stay with the fallback country.
 */
export function splitInternational(
  phone: string,
  fallback = DEFAULT_PHONE_COUNTRY,
): { country: string; number: string } {
  const trimmed = phone.trim();
  if (!trimmed.startsWith("+")) return { country: fallback, number: trimmed };
  const digits = trimmed.replace(/\D/g, "");
  for (let length = 3; length >= 1; length -= 1) {
    const dialCode = `+${digits.slice(0, length)}`;
    const main = MAIN_COUNTRY_FOR_DIAL_CODE[dialCode];
    if (!main) continue;
    const rest = digits.slice(length);
    // Several countries can share the code (+1 US/Canada/Jamaica…): the one whose area codes fit, main country first.
    const sharing = [getPhoneCountry(main), ...PHONE_COUNTRIES.filter((c) => c.dialCode === dialCode && c.code !== main)];
    const fitting = sharing.find((country) => belongs(country, rest)) ?? sharing.find((country) => matches(country, rest));
    return { country: fitting?.code ?? main, number: rest };
  }
  return { country: fallback, number: trimmed };
}
