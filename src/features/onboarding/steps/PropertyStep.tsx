"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Card";
import { RadioChips, ToggleChip } from "@/components/ui/Chip";
import { Counter } from "@/components/ui/Counter";
import { SelectField, TextField } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { AMENITIES, PROPERTY_TYPE_LABELS } from "@/data/amenities";
import { bookingLinkHost } from "@/config/site";
import { mapAmenities, mapPropertyType, type AirbnbImportResponse } from "@/lib/airbnb-import";
import { signupApi } from "@/lib/api/signup";
import { slugify } from "@/lib/utils";
import { validateRequired } from "@/lib/validation";
import { PROPERTY_TYPES, type AmenityId } from "@/types/property";
import { updateDraft, useDraft } from "../draft-store";
import { setSignupFlash, updateSignupState, useSignupSession } from "../signup-session";
import { hrefForNextStep } from "../steps";
import type { DraftProperty } from "../types";
import { defaultCountryId, useCountries } from "../use-countries";
import { StepCard, StepFooter } from "../components/WizardShell";
import { AirbnbImportCard } from "../components/AirbnbImportCard";

/** "8500", "99.5" (max 2 decimals) from what the host typed. */
function cleanPrice(value: string) {
  const [whole = "", ...rest] = value.replace(/[^\d.]/g, "").split(".");
  const decimals = rest.join("").slice(0, 2);
  return whole.slice(0, 8) + (rest.length > 0 ? `.${decimals}` : "");
}

function currencySymbol(code: string) {
  try {
    const part = new Intl.NumberFormat("en", { style: "currency", currency: code })
      .formatToParts(0)
      .find((item) => item.type === "currency");
    return part?.value ?? code;
  } catch {
    return code;
  }
}
const typeOptions = PROPERTY_TYPES.map((value) => ({ value, label: PROPERTY_TYPE_LABELS[value] }));

type AddressKey = "address_1" | "city" | "state" | "zip" | "country_id";
type Errors = Partial<
  Record<"name" | AddressKey | "ical_url" | "bedrooms" | "bathrooms" | "max_guests" | "price" | "slug", string>
>;

/**
 * Step 3 — property basics (pjActionSignupProperty): name, address, bedrooms,
 * bathrooms, guests ("Max people" in Limits), price per night (saved as the
 * property's default price on Properties > Prices) and an optional iCal link.
 * Type, amenities and page link have no field in the API yet: they stay in this
 * browser for the preview.
 * "Import your listing" fills the form from Airbnb (/api/airbnb-import); the host
 * reviews it and nothing is saved until Continue.
 */

interface ImportReview {
  filled: string[];
  missing: string[];
  notes: string[];
}
export function PropertyStep() {
  const router = useRouter();
  const draft = useDraft();
  const { token, state } = useSignupSession();
  const { countries } = useCountries();
  const property = draft.property;
  const saved = state?.property;
  const company = state?.company;

  const [address, setAddress] = useState<Record<AddressKey, string>>(() => ({
    address_1: saved?.address_1 ?? company?.address_1 ?? "",
    city: saved?.city ?? company?.city ?? "",
    state: saved?.state ?? company?.state ?? "",
    zip: saved?.zip ?? company?.zip ?? "",
    country_id: saved?.country_id ?? company?.country_id ?? "",
  }));
  const [icalUrl, setIcalUrl] = useState(saved?.ical_urls?.[0] ?? "");
  // The saved rate comes from the prices table, so a rate changed in the back office shows here.
  const [priceText, setPriceText] = useState(() => {
    const value = saved?.price ?? property.price;
    return value ? String(value) : "";
  });
  const currency = state?.currency || saved?.currency || property.currency;
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingSlug, setEditingSlug] = useState(false);
  const [importReview, setImportReview] = useState<ImportReview | null>(null);
  const countryId = address.country_id || defaultCountryId(countries);

  const update = (patch: Partial<DraftProperty>) =>
    updateDraft((current) => {
      const next = { ...current.property, ...patch };
      if (patch.name !== undefined && !next.slugEdited) next.slug = slugify(patch.name);
      return { ...current, property: next };
    });

  const clearError = (key: keyof Errors) => errors[key] && setErrors((current) => ({ ...current, [key]: undefined }));

  function setAddressField(key: AddressKey, value: string) {
    const next = { ...address, [key]: value };
    setAddress(next);
    clearError(key);
    // The live preview shows "City, State".
    if (key === "city" || key === "state") update({ location: [next.city, next.state].filter(Boolean).join(", ") });
  }

  /** Fills the form from an imported Airbnb listing. Only found values replace what is in the form. */
  function applyImport({ listing, already_connected }: AirbnbImportResponse) {
    const filled: string[] = [];
    const missing: string[] = [];
    const notes: string[] = [];
    const patch: Partial<DraftProperty> = {};

    if (listing.title) {
      patch.name = listing.title;
      filled.push("Property name");
    } else missing.push("Property name");

    const type = mapPropertyType(listing.property_type);
    if (type) {
      patch.type = type;
      filled.push("Property type");
    } else {
      missing.push("Property type");
      if (listing.property_type) notes.push(`Airbnb calls it "${listing.property_type}": choose the closest type.`);
    }

    const a = listing.address;
    const nextAddress = { ...address };
    if (a.line1) nextAddress.address_1 = a.line1;
    if (a.city) nextAddress.city = a.city;
    if (a.state) nextAddress.state = a.state;
    if (a.postcode) nextAddress.zip = a.postcode;
    const countryName = a.country_name?.toLowerCase();
    const country = countries?.find(
      (item) =>
        (a.country_code && item.alpha_2 === a.country_code) || (countryName && item.name?.toLowerCase() === countryName),
    );
    if (country) nextAddress.country_id = country.id;
    if (a.line1 || a.city) filled.push("Address");
    if (!a.line1) {
      missing.push("Street address");
      notes.push("Airbnb doesn't show the street address publicly: please add it.");
    }
    if (!a.city) missing.push("City");
    if ((a.country_code || a.country_name) && !country)
      notes.push(`Country "${a.country_name ?? a.country_code}" isn't in our list: choose it below.`);
    setAddress(nextAddress);
    patch.location = [nextAddress.city, nextAddress.state].filter(Boolean).join(", ");

    if (listing.bedrooms !== null) patch.bedrooms = Math.round(listing.bedrooms);
    if (listing.bathrooms !== null) {
      patch.bathrooms = Math.round(listing.bathrooms);
      if (!Number.isInteger(listing.bathrooms))
        notes.push(`Airbnb lists ${listing.bathrooms} bathrooms; we count whole rooms, so it is ${patch.bathrooms}.`);
    }
    if (listing.max_guests !== null) patch.maxGuests = Math.round(listing.max_guests);
    if (listing.bedrooms !== null || listing.bathrooms !== null || listing.max_guests !== null)
      filled.push("Rooms and guests");
    else missing.push("Rooms and guests");

    const { matched, unmatched } = mapAmenities(listing.amenities);
    if (matched.length > 0) {
      patch.amenities = [...new Set([...property.amenities, ...matched])];
      filled.push("Amenities");
    } else missing.push("Amenities");
    if (unmatched.length > 0)
      notes.push(`Not on our amenity list: ${unmatched.slice(0, 8).join(", ")}${unmatched.length > 8 ? "…" : ""}. Mention them in your description.`);

    if (listing.price && listing.price.currency === currency) {
      const text = String(listing.price.amount);
      setPriceText(text);
      patch.price = listing.price.amount;
      patch.currency = currency;
      filled.push("Price per night");
    } else {
      missing.push("Price per night");
      if (listing.price)
        notes.push(`Your Airbnb price is in ${listing.price.currency} and your account uses ${currency}: enter your ${currency} price.`);
      else notes.push("Airbnb only shows prices for chosen dates: please enter your price per night.");
    }

    if (listing.description) filled.push("Description (shown in step 5)");
    if (listing.photos.length > 0)
      notes.push(`${listing.photos.length} photo${listing.photos.length === 1 ? "" : "s"} found on Airbnb: add your photos in the Photos step.`);
    if (already_connected) notes.push("This listing's Airbnb calendar is already connected to this property.");
    else notes.push("Add your Airbnb calendar link below so dates booked on Airbnb stay blocked.");

    update(patch);
    updateDraft((current) => ({
      ...current,
      imported: {
        listingId: listing.listing_id,
        url: listing.url,
        description: listing.description,
        photos: listing.photos,
      },
    }));
    setErrors({});
    setFormError(null);
    setImportReview({ filled, missing, notes });
    window.requestAnimationFrame(() => document.getElementById("import-review")?.focus());
  }

  function toggleAmenity(id: AmenityId) {
    update({
      amenities: property.amenities.includes(id)
        ? property.amenities.filter((item) => item !== id)
        : [...property.amenities, id],
    });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setFormError(null);
    const next: Errors = {
      name: validateRequired(property.name, "a property name", 2),
      address_1: validateRequired(address.address_1, "the address"),
      city: validateRequired(address.city, "the city"),
      country_id: countryId ? undefined : "Please choose a country.",
      price: Number(priceText) > 0 ? undefined : "Please enter your price per night.",
      ical_url:
        icalUrl && !/^https?:\/\/\S+$/i.test(icalUrl.trim())
          ? "Enter a calendar link starting with https://"
          : undefined,
    };
    setErrors(next);
    const firstInvalid = (Object.keys(next) as (keyof Errors)[]).find((key) => next[key]);
    if (firstInvalid) {
      document.getElementById(`property-${firstInvalid}`)?.focus();
      return;
    }

    setSubmitting(true);
    const result = await signupApi.property(
      {
        name: property.name.trim(),
        address_1: address.address_1.trim(),
        city: address.city.trim(),
        state: address.state.trim(),
        zip: address.zip.trim(),
        country_id: countryId,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        ical_url: icalUrl.trim(),
        price: priceText,
        max_guests: property.maxGuests,
      },
      token,
    );
    setSubmitting(false);

    if (result.ok) {
      updateSignupState(result.data);
      const ical = result.data.ical_import;
      if (ical) setSignupFlash({ tone: ical.status === "OK" ? "success" : "warning", text: ical.text });
      router.push(hrefForNextStep(result.data.next_step));
      return;
    }
    if (result.code === 409 && result.data) {
      router.push(hrefForNextStep((result.data as { next_step: number | "done" }).next_step));
      return;
    }
    setErrors(result.errors as Errors);
    const first = Object.keys(result.errors)[0];
    if (first) document.getElementById(`property-${first}`)?.focus();
    else setFormError(result.message);
  }

  return (
    <StepCard title="Tell us about your property" description="Just the basics. You can add more later.">
      {formError ? (
        <Notice tone="error" role="alert" className="mb-5">
          {formError}
        </Notice>
      ) : null}

      <AirbnbImportCard token={token} onImported={applyImport} />

      <form noValidate onSubmit={onSubmit} className="mt-7 grid grid-cols-1 gap-6">
        {importReview ? (
          <div id="import-review" tabIndex={-1} className="grid gap-3 focus-visible:outline-none">
            <Notice tone="success" role="status" title="Imported from Airbnb — please check the details below">
              {importReview.filled.length > 0 ? <p className="mt-1">Filled in: {importReview.filled.join(", ")}.</p> : null}
              {importReview.missing.length > 0 ? (
                <p className="mt-1">Not found on Airbnb, please add: {importReview.missing.join(", ")}.</p>
              ) : null}
              {importReview.notes.length > 0 ? (
                <ul className="mt-2 list-disc pl-5">
                  {importReview.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              ) : null}
              <p className="mt-2">Nothing is saved until you press Continue.</p>
            </Notice>
          </div>
        ) : null}

        <TextField
          id="property-name"
          label="Property name"
          placeholder="e.g. Green Casa"
          value={property.name}
          onChange={(event) => {
            update({ name: event.target.value });
            clearError("name");
          }}
          error={errors.name}
          required
        />

        <RadioChips
          name="property-type"
          legend="Property type"
          options={typeOptions}
          value={property.type}
          onChange={(type) => update({ type })}
        />

        <TextField
          id="property-address_1"
          label="Address"
          placeholder="Street, area"
          autoComplete="address-line1"
          prefix={<Icon name="mapPin" size={17} className="text-primary" />}
          value={address.address_1}
          onChange={(event) => setAddressField("address_1", event.target.value)}
          error={errors.address_1}
          required
        />
        <div className="grid gap-5 sm:grid-cols-2 sm:gap-3">
          <TextField
            id="property-city"
            label="City / area"
            placeholder="e.g. Assagao"
            autoComplete="address-level2"
            value={address.city}
            onChange={(event) => setAddressField("city", event.target.value)}
            error={errors.city}
            required
          />
          <TextField
            id="property-state"
            label="State / region"
            placeholder="e.g. North Goa"
            autoComplete="address-level1"
            value={address.state}
            onChange={(event) => setAddressField("state", event.target.value)}
            error={errors.state}
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-[minmax(0,0.6fr)_minmax(0,1fr)] sm:gap-3">
          <TextField
            id="property-zip"
            label="Postcode"
            autoComplete="postal-code"
            value={address.zip}
            onChange={(event) => setAddressField("zip", event.target.value)}
            error={errors.zip}
          />
          <SelectField
            id="property-country_id"
            label="Country"
            required
            value={countryId}
            onChange={(event) => setAddressField("country_id", event.target.value)}
            error={errors.country_id}
            disabled={!countries}
          >
            {!countries ? <option value="">Loading countries…</option> : <option value="">Choose a country</option>}
            {countries?.map((country) => (
              <option key={country.id} value={country.id}>
                {country.name ?? country.alpha_2}
              </option>
            ))}
          </SelectField>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Counter
            id="property-bedrooms"
            label="Bedrooms"
            value={property.bedrooms}
            min={0}
            max={99}
            onChange={(bedrooms) => update({ bedrooms })}
          />
          <Counter
            id="property-bathrooms"
            label="Bathrooms"
            value={property.bathrooms}
            min={0}
            max={99}
            onChange={(bathrooms) => update({ bathrooms })}
          />
          <Counter
            id="property-guests"
            label="Max guests"
            value={property.maxGuests}
            min={1}
            max={50}
            onChange={(maxGuests) => update({ maxGuests })}
          />
        </div>

        <fieldset>
          <legend className="flex w-full flex-wrap items-baseline justify-between gap-2 text-small font-semibold text-heading">
            Amenities
            <span className="text-caption font-normal text-muted">Select all that apply</span>
          </legend>
          <p className="mb-3 mt-1 text-caption text-body">
            Helps our AI highlight top features and write better descriptions.
          </p>
          <div className="flex flex-wrap gap-2">
            {AMENITIES.map((amenity) => (
              <ToggleChip
                key={amenity.id}
                icon={amenity.icon}
                selected={property.amenities.includes(amenity.id)}
                onToggle={() => toggleAmenity(amenity.id)}
              >
                {amenity.label}
              </ToggleChip>
            ))}
          </div>
        </fieldset>

        <TextField
          id="property-price"
          label="Price per night"
          inputMode="decimal"
          autoComplete="off"
          placeholder="8500"
          required
          prefix={
            <span className="text-small font-semibold text-heading">
              {currencySymbol(currency)}
              {currencySymbol(currency) !== currency ? <span className="ml-1 font-normal text-body">{currency}</span> : null}
            </span>
          }
          prefixPadding={currencySymbol(currency) !== currency ? "pl-[4.75rem]" : "pl-16"}
          value={priceText}
          onChange={(event) => {
            const text = cleanPrice(event.target.value);
            setPriceText(text);
            clearError("price");
            update({ price: Number(text) > 0 ? Number(text) : null, currency });
          }}
          error={errors.price}
          hint={
            saved?.price_varies
              ? `Your rates differ by weekday (set in your dashboard); the lowest is shown. A new price here replaces them for every day.`
              : "Your default rate for every night. You can set weekend or seasonal rates later in your dashboard."
          }
        />

        <TextField
          id="property-ical_url"
          label={
            <>
              Airbnb calendar (iCal) link <span className="font-normal text-body">(optional)</span>
            </>
          }
          type="url"
          inputMode="url"
          placeholder="https://www.airbnb.co.in/calendar/ical/12345678.ics?s=…"
          prefix={<Icon name="link" size={16} className="text-primary" />}
          value={icalUrl}
          onChange={(event) => {
            setIcalUrl(event.target.value);
            clearError("ical_url");
          }}
          error={errors.ical_url}
          hint="Blocks the dates already booked on Airbnb and keeps them in sync. On Airbnb: Listing > Availability > Connect calendars > Export calendar. Booking.com and Vrbo links work too."
        />

        <div className="rounded-input bg-surface-muted px-4 py-3">
          {editingSlug ? (
            <TextField
              id="property-slug"
              label="Your page link"
              hint={`Lowercase letters, numbers and dashes. Full link: ${bookingLinkHost}/${property.slug || "…"}`}
              prefix={<span className="text-small text-body">{bookingLinkHost}/</span>}
              prefixPadding="pl-[8.5rem]"
              value={property.slug}
              onChange={(event) => {
                updateDraft((current) => ({
                  ...current,
                  property: { ...current.property, slug: slugify(event.target.value), slugEdited: true },
                }));
                clearError("slug");
              }}
              error={errors.slug}
              suffix={
                <Button size="sm" variant="soft" onClick={() => setEditingSlug(false)}>
                  Done
                </Button>
              }
            />
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2 text-small">
              <p className="min-w-0 break-all text-body">
                Your page link:{" "}
                <strong className="font-semibold text-heading">
                  {bookingLinkHost}/{property.slug || "…"}
                </strong>
              </p>
              <button
                type="button"
                onClick={() => setEditingSlug(true)}
                className="rounded-sm font-semibold text-heading underline underline-offset-2 hover:text-link-hover focus-visible:outline-none focus-visible:focus-ring"
              >
                Change<span className="sr-only"> page link</span>
              </button>
            </div>
          )}
        </div>

        <p className="text-caption text-muted">
          Property type, amenities and page link are kept in this browser for your preview for now; the address,
          rooms, guests, price and calendar are saved to your account.
        </p>

        <StepFooter
          start={
            <Button href="/setup/company" variant="text">
              Back
            </Button>
          }
          end={
            <Button type="submit" size="lg" disabled={submitting} aria-busy={submitting}>
              {submitting ? "Saving…" : "Continue"}
            </Button>
          }
        />
      </form>
    </StepCard>
  );
}
