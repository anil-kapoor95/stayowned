/** Small client-side validators shared by the demo forms. */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateRequired(value: string, label: string, min = 1): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return `Please enter ${label}.`;
  if (trimmed.length < min) return `${capitalise(label)} must be at least ${min} characters.`;
  return undefined;
}

export function validateEmail(value: string): string | undefined {
  if (!value.trim()) return "Please enter your email address.";
  if (!EMAIL_RE.test(value.trim())) return "Enter a valid email address, like you@example.com.";
  return undefined;
}

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function validatePhone(value: string, pattern: RegExp, example: string): string | undefined {
  const digits = digitsOnly(value);
  if (!digits) return "Please enter your WhatsApp number.";
  if (!pattern.test(digits)) return `Enter a valid mobile number, like ${example}.`;
  return undefined;
}

/** 0 = empty, 1 = weak, 2 = fair, 3 = strong */
export function passwordStrength(value: string): 0 | 1 | 2 | 3 {
  if (!value) return 0;
  let score = 0;
  if (value.length >= 8) score++;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
  if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score++;
  if (value.length >= 12) score++;
  return Math.max(1, Math.min(3, score)) as 1 | 2 | 3;
}

export function validatePassword(value: string): string | undefined {
  if (!value) return "Please choose a password.";
  if (value.length < 8) return "Use at least 8 characters.";
  return undefined;
}

const AIRBNB_RE = /^(https?:\/\/)?(www\.)?airbnb\.[a-z.]{2,8}\/rooms\/\d+/i;
export function validateAirbnbUrl(value: string): string | undefined {
  if (!value.trim()) return "Paste your Airbnb listing link first.";
  if (!AIRBNB_RE.test(value.trim())) return "That doesn't look like an Airbnb listing link (…airbnb.com/rooms/12345).";
  return undefined;
}

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function capitalise(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
