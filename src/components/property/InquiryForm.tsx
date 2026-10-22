"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Card";
import { SelectField, TextareaField, TextField } from "@/components/ui/Field";
import { formatPrice } from "@/lib/utils";
import { isoDate, validateEmail, validateRequired } from "@/lib/validation";
import type { Property } from "@/types/property";

type Values = {
  checkIn: string;
  checkOut: string;
  guests: string;
  name: string;
  email: string;
  phone: string;
  message: string;
};
type Errors = Partial<Record<keyof Values, string>>;

const DAY = 24 * 60 * 60 * 1000;
const noopSubscribe = () => () => {};
/** Today's date on the client only (the server prerender has no "today"). */
const useToday = () => useSyncExternalStore(noopSubscribe, () => isoDate(new Date()), () => undefined);
const nightsBetween = (from: string, to: string) =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY);

/**
 * Booking inquiry with client-side validation. There is no backend in this
 * build: a valid submission shows a summary and says clearly that nothing was sent.
 */
export function InquiryForm({ property }: { property: Property }) {
  const today = useToday();
  const [values, setValues] = useState<Values>({
    checkIn: "",
    checkOut: "",
    guests: "2",
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState<Values | null>(null);

  const set = (key: keyof Values) => (value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const nights = values.checkIn && values.checkOut ? nightsBetween(values.checkIn, values.checkOut) : 0;
  const { minNights, booked } = property.availability;

  function validate(): Errors {
    const next: Errors = {};
    const now = today ?? isoDate(new Date());
    if (!values.checkIn) next.checkIn = "Choose a check-in date.";
    else if (values.checkIn < now) next.checkIn = "Check-in can't be in the past.";
    if (!values.checkOut) next.checkOut = "Choose a check-out date.";
    else if (values.checkIn && nights <= 0) next.checkOut = "Check-out must be after check-in.";
    else if (values.checkIn && nights < minNights) next.checkOut = `Minimum stay is ${minNights} nights.`;
    if (!next.checkIn && !next.checkOut) {
      const clash = booked.find((range) => values.checkIn < range.to && values.checkOut > range.from);
      if (clash) next.checkIn = `Those dates overlap an existing booking (${clash.from} to ${clash.to}).`;
    }
    next.name = validateRequired(values.name, "your name", 2);
    next.email = validateEmail(values.email);
    if (values.phone && values.phone.replace(/\D/g, "").length < 8) next.phone = "Enter a valid phone number or leave it empty.";
    return next;
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    const firstInvalid = (Object.keys(next) as (keyof Values)[]).find((key) => next[key]);
    if (firstInvalid) {
      document.getElementById(`inquiry-${firstInvalid}`)?.focus();
      return;
    }
    setSubmitted(values);
  }

  if (submitted) {
    return (
      <div className="grid gap-4">
        <Notice tone="info" role="status" title="Demo mode — nothing was sent">
          This static demo has no booking backend, so the host was not contacted and no dates were held. When the API is
          connected, this inquiry would be delivered to {property.host.name}.
        </Notice>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-input bg-surface-muted p-4 text-small">
          <dt className="text-muted">Dates</dt>
          <dd className="text-heading">
            {submitted.checkIn} → {submitted.checkOut}
          </dd>
          <dt className="text-muted">Guests</dt>
          <dd className="text-heading">{submitted.guests}</dd>
          {property.price.amount > 0 ? (
            <>
              <dt className="text-muted">Estimated total</dt>
              <dd className="font-semibold text-heading">{formatPrice(property.price.amount * nights, property.price.currency)}</dd>
            </>
          ) : null}
        </dl>
        <Button variant="outline" onClick={() => setSubmitted(null)}>
          Edit inquiry
        </Button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} className="grid gap-4" aria-label={`Booking inquiry for ${property.name}`}>
      <div className="grid grid-cols-2 gap-3">
        <TextField
          id="inquiry-checkIn"
          label="Check-in"
          type="date"
          min={today}
          value={values.checkIn}
          onChange={(event) => set("checkIn")(event.target.value)}
          error={errors.checkIn}
          required
        />
        <TextField
          id="inquiry-checkOut"
          label="Check-out"
          type="date"
          min={values.checkIn || today}
          value={values.checkOut}
          onChange={(event) => set("checkOut")(event.target.value)}
          error={errors.checkOut}
          required
        />
      </div>
      <SelectField id="inquiry-guests" label="Guests" value={values.guests} onChange={(event) => set("guests")(event.target.value)}>
        {Array.from({ length: property.maxGuests }, (_, i) => String(i + 1)).map((count) => (
          <option key={count} value={count}>
            {count} {count === "1" ? "guest" : "guests"}
          </option>
        ))}
      </SelectField>
      <TextField
        id="inquiry-name"
        label="Your name"
        autoComplete="name"
        value={values.name}
        onChange={(event) => set("name")(event.target.value)}
        error={errors.name}
        required
      />
      <TextField
        id="inquiry-email"
        label="Email"
        type="email"
        autoComplete="email"
        value={values.email}
        onChange={(event) => set("email")(event.target.value)}
        error={errors.email}
        required
      />
      <TextField
        id="inquiry-phone"
        label="Phone (optional)"
        type="tel"
        autoComplete="tel"
        value={values.phone}
        onChange={(event) => set("phone")(event.target.value)}
        error={errors.phone}
      />
      <TextareaField
        id="inquiry-message"
        label="Message (optional)"
        rows={3}
        maxLength={600}
        placeholder="Arrival time, special requests…"
        value={values.message}
        onChange={(event) => set("message")(event.target.value)}
      />
      {nights > 0 && property.price.amount > 0 ? (
        <p className="flex justify-between border-t border-divider pt-3 text-small text-body">
          <span>
            {formatPrice(property.price.amount, property.price.currency)} × {nights} night{nights === 1 ? "" : "s"}
          </span>
          <strong className="text-heading">{formatPrice(property.price.amount * nights, property.price.currency)}</strong>
        </p>
      ) : null}
      <Button type="submit" size="lg" fullWidth>
        Request to book
      </Button>
      <p className="text-center text-caption text-muted">You won&apos;t be charged — the host confirms availability first.</p>
    </form>
  );
}
