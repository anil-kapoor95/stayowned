export interface Country {
  code: string;
  name: string;
  dialCode: string;
  /** National number pattern (digits only) used for client-side validation. */
  phonePattern: RegExp;
  phoneExample: string;
}

export const COUNTRIES: readonly Country[] = [
  { code: "IN", name: "India", dialCode: "+91", phonePattern: /^[6-9]\d{9}$/, phoneExample: "98765 43210" },
  { code: "AE", name: "United Arab Emirates", dialCode: "+971", phonePattern: /^5\d{8}$/, phoneExample: "50 123 4567" },
  { code: "GB", name: "United Kingdom", dialCode: "+44", phonePattern: /^7\d{9}$/, phoneExample: "7400 123456" },
  { code: "US", name: "United States", dialCode: "+1", phonePattern: /^[2-9]\d{9}$/, phoneExample: "201 555 0123" },
  { code: "SG", name: "Singapore", dialCode: "+65", phonePattern: /^[89]\d{7}$/, phoneExample: "8123 4567" },
  { code: "LK", name: "Sri Lanka", dialCode: "+94", phonePattern: /^7\d{8}$/, phoneExample: "71 234 5678" },
];

export function getCountry(code: string): Country {
  return COUNTRIES.find((country) => country.code === code) ?? COUNTRIES[0];
}
