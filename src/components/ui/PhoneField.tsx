"use client";

import type { ReactNode } from "react";
import { PHONE_COUNTRIES } from "@/data/phone-countries";
import { flagEmoji, getPhoneCountry, splitInternational } from "@/lib/phone";
import { SelectField, TextField } from "./Field";

const PADDING: Record<number, string> = { 2: "pl-11", 3: "pl-14", 4: "pl-16" };

/**
 * Country calling code (every country, searchable by typing its name) + phone number.
 * Pasting a full international number ("+44 7400 123456") picks the country by itself.
 */
export function PhoneField({
  id,
  label,
  countryLabel = "Country code",
  country,
  number,
  onChange,
  error,
  hint,
  required,
  autoComplete = "tel-national",
}: {
  id: string;
  label: ReactNode;
  countryLabel?: ReactNode;
  /** ISO code, e.g. "IN" */
  country: string;
  number: string;
  onChange: (value: { country: string; number: string }) => void;
  error?: string;
  hint?: ReactNode;
  required?: boolean;
  autoComplete?: string;
}) {
  const current = getPhoneCountry(country);
  return (
    <div className="grid gap-5 sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] sm:gap-3">
      <SelectField
        id={`${id}-country`}
        label={countryLabel}
        autoComplete="tel-country-code"
        value={current.code}
        onChange={(event) => onChange({ country: event.target.value, number })}
      >
        {PHONE_COUNTRIES.map((item) => (
          <option key={item.code} value={item.code}>
            {`${flagEmoji(item.code)} ${item.name} (${item.dialCode})`}
          </option>
        ))}
      </SelectField>
      <TextField
        id={id}
        label={label}
        type="tel"
        inputMode="tel"
        autoComplete={autoComplete}
        placeholder={current.example || "Phone number"}
        prefix={<span className="font-semibold text-heading">{current.dialCode}</span>}
        prefixPadding={PADDING[current.dialCode.length] ?? "pl-16"}
        maxLength={24}
        value={number}
        onChange={(event) => {
          const value = event.target.value;
          if (value.trim().startsWith("+")) {
            // A full international number was typed or pasted: take its country.
            onChange(splitInternational(value, current.code));
            return;
          }
          onChange({ country: current.code, number: value });
        }}
        error={error}
        hint={hint}
        required={required}
      />
    </div>
  );
}
