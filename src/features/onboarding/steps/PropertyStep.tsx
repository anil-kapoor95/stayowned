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
import { properties } from "@/data/properties";
import { bookingLinkHost } from "@/config/site";
import { slugify } from "@/lib/utils";
import { validateAirbnbUrl, validateRequired } from "@/lib/validation";
import { CURRENCIES, PROPERTY_TYPES, type AmenityId, type CurrencyCode } from "@/types/property";
import { DEFAULT_DRAFT, updateDraft, useDraft } from "../draft-store";
import type { DraftProperty } from "../types";
import { StepCard, StepFooter } from "../components/WizardShell";

const currencySymbols: Record<CurrencyCode, string> = { INR: "₹", USD: "$", EUR: "€", GBP: "£" };
const typeOptions = PROPERTY_TYPES.map((value) => ({ value, label: PROPERTY_TYPE_LABELS[value] }));

type Errors = Partial<Record<"name" | "location" | "price" | "slug", string>>;

export function PropertyStep() {
  const router = useRouter();
  const draft = useDraft();
  const property = draft.property;
  const [errors, setErrors] = useState<Errors>({});
  const [airbnbUrl, setAirbnbUrl] = useState("");
  const [importState, setImportState] = useState<{ error?: string; done?: boolean }>({});
  const [editingSlug, setEditingSlug] = useState(false);

  const update = (patch: Partial<DraftProperty>) =>
    updateDraft((current) => {
      const next = { ...current.property, ...patch };
      if (patch.name !== undefined && !next.slugEdited) next.slug = slugify(patch.name);
      return { ...current, property: next };
    });

  const clearError = (key: keyof Errors) => errors[key] && setErrors((current) => ({ ...current, [key]: undefined }));

  function toggleAmenity(id: AmenityId) {
    update({
      amenities: property.amenities.includes(id)
        ? property.amenities.filter((item) => item !== id)
        : [...property.amenities, id],
    });
  }

  function onImport() {
    const error = validateAirbnbUrl(airbnbUrl);
    if (error) {
      setImportState({ error });
      return;
    }
    // Demo: nothing is fetched from Airbnb — we fill the form with the sample listing.
    const sample = properties[0];
    update({
      ...DEFAULT_DRAFT.property,
      amenities: sample.amenities,
      slugEdited: false,
    });
    setImportState({ done: true });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: Errors = {
      name: validateRequired(property.name, "a property name", 2),
      location: validateRequired(property.location, "the location"),
      price: !property.price || property.price <= 0 ? "Enter a nightly price greater than 0." : undefined,
      slug: !property.slug ? "Choose a link for your page." : undefined,
    };
    setErrors(next);
    const firstInvalid = (Object.keys(next) as (keyof Errors)[]).find((key) => next[key]);
    if (firstInvalid) {
      if (firstInvalid === "slug") setEditingSlug(true);
      document.getElementById(`property-${firstInvalid}`)?.focus();
      return;
    }
    router.push("/setup/photos");
  }

  return (
    <StepCard title="Tell us about your property" description="Just the basics. You can add more later.">
      <section aria-labelledby="import-title" className="rounded-input border border-primary-subtle bg-primary-tint p-4 sm:p-5">
        <h2 id="import-title" className="flex items-center gap-2 font-body text-base font-bold text-heading">
          <Icon name="link" size={18} className="text-primary" /> Already on Airbnb? Import your listing
        </h2>
        <p className="mt-1 text-small text-body">
          Paste your listing link and we&apos;ll fill in the details for you. You can review everything before publishing.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <TextField
            id="property-airbnb"
            label="Airbnb listing link"
            srOnlyLabel
            type="url"
            inputMode="url"
            placeholder="https://www.airbnb.co.in/rooms/12345678"
            prefix={<Icon name="link" size={16} className="text-primary" />}
            value={airbnbUrl}
            onChange={(event) => {
              setAirbnbUrl(event.target.value);
              setImportState({});
            }}
            error={importState.error}
            wrapperClassName="flex-1"
          />
          <Button variant="secondary" size="lg" onClick={onImport} className="sm:self-start">
            Import
          </Button>
        </div>
        {importState.done ? (
          <Notice tone="success" role="status" className="mt-3" title="Details filled in">
            Demo mode: no data was fetched from Airbnb — the form was filled with the sample listing so you can try the flow.
          </Notice>
        ) : (
          <p className="mt-2 text-caption text-muted">Not on Airbnb? Just fill in the details below.</p>
        )}
      </section>

      <form noValidate onSubmit={onSubmit} className="mt-7 grid grid-cols-1 gap-6">
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
          id="property-location"
          label="Location"
          placeholder="Area, city, state"
          autoComplete="address-level2"
          prefix={<Icon name="mapPin" size={17} className="text-primary" />}
          value={property.location}
          onChange={(event) => {
            update({ location: event.target.value });
            clearError("location");
          }}
          error={errors.location}
          required
        />

        <div className="grid gap-3 sm:grid-cols-3">
          <Counter id="property-bedrooms" label="Bedrooms" value={property.bedrooms} min={1} max={30} onChange={(bedrooms) => update({ bedrooms })} />
          <Counter id="property-bathrooms" label="Bathrooms" value={property.bathrooms} min={1} max={30} onChange={(bathrooms) => update({ bathrooms })} />
          <Counter id="property-guests" label="Max guests" value={property.maxGuests} min={1} max={50} onChange={(maxGuests) => update({ maxGuests })} />
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

        <div>
          <p aria-hidden="true" className="mb-2 text-small font-semibold text-heading">
            Price per night <span className="text-primary" aria-hidden="true">*</span>
          </p>
          <div className="grid grid-cols-[minmax(0,8.5rem)_minmax(0,1fr)] items-start gap-3">
            <SelectField
              id="property-currency"
              label="Currency"
              srOnlyLabel
              value={property.currency}
              onChange={(event) => update({ currency: event.target.value as CurrencyCode })}
            >
              {CURRENCIES.map((code) => (
                <option key={code} value={code}>
                  {currencySymbols[code]} {code}
                </option>
              ))}
            </SelectField>
            <TextField
              id="property-price"
              label="Price per night"
              srOnlyLabel
              inputMode="numeric"
              placeholder="8,500"
              value={property.price ? new Intl.NumberFormat("en-IN").format(property.price) : ""}
              onChange={(event) => {
                const digits = event.target.value.replace(/\D/g, "").slice(0, 7);
                update({ price: digits ? Number(digits) : null });
                clearError("price");
              }}
              error={errors.price}
            />
          </div>
        </div>

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

        <StepFooter
          start={<span>Next: add photos</span>}
          end={
            <Button type="submit" size="lg">
              Continue
            </Button>
          }
        />
      </form>
    </StepCard>
  );
}
