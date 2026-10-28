"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Card";
import { SelectField, TextareaField, TextField } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { PhoneField } from "@/components/ui/PhoneField";
import { signupApi } from "@/lib/api/signup";
import { DEFAULT_PHONE_COUNTRY, getPhoneCountry, splitInternational, toInternational, validatePhoneNumber } from "@/lib/phone";
import { validateEmail, validateRequired } from "@/lib/validation";
import { setSignupFlash, updateSignupState, useSignupSession } from "../signup-session";
import { hrefForNextStep, stepNumber } from "../steps";
import { defaultCountryId, useCountries } from "../use-countries";
import { StepCard, StepFooter } from "../components/WizardShell";

const FIELDS = [
  "name",
  "address_1",
  "address_2",
  "city",
  "state",
  "zip",
  "country_id",
  "company_email",
  "phone",
  "website",
  "contact_person",
  "legal_name",
  "registration_no",
  "tax_no",
  "description",
] as const;
type Field = (typeof FIELDS)[number] | "logo";
type Values = Record<(typeof FIELDS)[number], string>;

const MAX_LOGO_BYTES = 5 * 1024 * 1024;

/**
 * Step 3 — company details (pjActionSignupCompany). Not in the Figma file: it uses
 * the same form components as the other steps. The back end creates the company with
 * the property (step 2), filled in from the account and the property address, exactly
 * like Companies > Add company in the back office; here the host checks and completes it.
 */
/** "example.com", "www.example.com/page" or a full http(s) link. */
function isWebsite(value: string) {
  try {
    const url = new URL(/^https?:\/\//i.test(value.trim()) ? value.trim() : `https://${value.trim()}`);
    return /^[^.\s]+(\.[^.\s]+)+$/.test(url.hostname);
  } catch {
    return false;
  }
}

export function CompanyStep() {
  const router = useRouter();
  const { token, state } = useSignupSession();
  const { countries, failed: countriesFailed, retry } = useCountries();
  const saved = state?.company;
  const account = state?.account;
  // Phone: country code + number (saved as "+91 9876543210"); starts from the account's WhatsApp number.
  const [initialPhone] = useState(() => {
    const accountCountry = splitInternational(account?.phone ?? "").country;
    return splitInternational(saved?.phone || account?.phone || "", accountCountry || DEFAULT_PHONE_COUNTRY);
  });
  const [phoneCountry, setPhoneCountry] = useState(initialPhone.country);

  // Empty company fields start from the property (step 2) and the account.
  const property = state?.property;
  const [values, setValues] = useState<Values>(() => ({
    name: saved?.name || property?.name || account?.name || "",
    address_1: saved?.address_1 || property?.address_1 || "",
    address_2: saved?.address_2 ?? "",
    city: saved?.city || property?.city || "",
    state: saved?.state || property?.state || "",
    zip: saved?.zip || property?.zip || "",
    country_id: saved?.country_id || property?.country_id || "",
    company_email: saved?.email || account?.email || "",
    phone: initialPhone.number,
    website: saved?.website ?? "",
    contact_person: saved?.contact_person || account?.name || "",
    legal_name: saved?.legal_name ?? "",
    registration_no: saved?.registration_no ?? "",
    tax_no: saved?.tax_no ?? "",
    description: saved?.description ?? "",
  }));
  const [logo, setLogo] = useState<File | null>(null);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [moreOpen, setMoreOpen] = useState(
    Boolean(saved?.legal_name || saved?.registration_no || saved?.tax_no || saved?.description),
  );
  const logoInput = useRef<HTMLInputElement>(null);

  const countryId = values.country_id || defaultCountryId(countries);

  const set = (key: (typeof FIELDS)[number]) => (value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  function onLogoChange(file: File | undefined) {
    setErrors((current) => ({ ...current, logo: undefined }));
    if (!file) return setLogo(null);
    if (!/^image\/(jpeg|png|gif|webp)$/.test(file.type)) {
      setErrors((current) => ({ ...current, logo: "Logo must be a JPG, PNG, GIF or WEBP image." }));
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setErrors((current) => ({ ...current, logo: "Logo must be smaller than 5 MB." }));
      return;
    }
    setLogo(file);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setFormError(null);
    const next: Partial<Record<Field, string>> = {
      name: validateRequired(values.name, "your company name"),
      address_1: validateRequired(values.address_1, "the address"),
      city: validateRequired(values.city, "the city"),
      country_id: countryId ? undefined : "Please choose a country.",
      company_email: values.company_email ? validateEmail(values.company_email) : undefined,
      website: values.website.trim() && !isWebsite(values.website) ? "Enter a website like www.example.com." : undefined,
      phone: validatePhoneNumber(getPhoneCountry(phoneCountry), values.phone, { required: false }),
    };
    setErrors(next);
    const firstInvalid = (Object.keys(next) as Field[]).find((key) => next[key]);
    if (firstInvalid) {
      if (
        ["legal_name", "registration_no", "tax_no", "description", "contact_person", "address_2"].includes(firstInvalid)
      )
        setMoreOpen(true);
      document.getElementById(`company-${firstInvalid}`)?.focus();
      return;
    }

    const form = new FormData();
    for (const key of FIELDS) {
      if (key === "country_id") form.append(key, countryId);
      else if (key === "phone")
        form.append(key, values.phone.trim() ? toInternational(getPhoneCountry(phoneCountry), values.phone) : "");
      else form.append(key, values[key].trim());
    }
    if (logo) form.append("logo", logo, logo.name);

    setSubmitting(true);
    const result = await signupApi.company(form, token);
    setSubmitting(false);

    if (result.ok) {
      updateSignupState(result.data);
      if (result.data.logo_error) {
        setSignupFlash({ tone: "warning", text: `Company saved, but the logo was not: ${result.data.logo_error}` });
      }
      router.push(hrefForNextStep(result.data.next_step));
      return;
    }
    if (result.code === 409 && result.data) {
      router.push(hrefForNextStep((result.data as { next_step: number | "done" }).next_step));
      return;
    }
    const mapped = result.errors as Partial<Record<Field, string>>;
    setErrors(mapped);
    const first = Object.keys(mapped)[0] as Field | undefined;
    if (first) {
      if (["legal_name", "registration_no", "tax_no", "description", "contact_person", "address_2"].includes(first))
        setMoreOpen(true);
      document.getElementById(`company-${first}`)?.focus();
    } else {
      setFormError(result.message);
    }
  }

  const text = (key: (typeof FIELDS)[number], label: string, extra: Partial<Parameters<typeof TextField>[0]> = {}) => (
    <TextField
      id={`company-${key}`}
      name={key}
      label={label}
      value={values[key]}
      onChange={(event) => set(key)(event.target.value)}
      error={errors[key]}
      {...extra}
    />
  );

  return (
    <StepCard
      title="Your company"
      description="Tell guests who they're booking with. You can change these details later."
    >
      {formError ? (
        <Notice tone="error" role="alert" className="mb-5">
          {formError}
        </Notice>
      ) : null}

      {(state?.completed_steps ?? 0) < stepNumber("company") && (saved || property) ? (
        <Notice tone="info" className="mb-5" title="We've filled this in for you">
          The name and address come from your property, and the contact details from your account. Check them and
          change anything that&apos;s different for your company.
        </Notice>
      ) : null}

      <form noValidate onSubmit={onSubmit} className="grid grid-cols-1 gap-5">
        {text("name", "Company or host name", {
          required: true,
          autoComplete: "organization",
          placeholder: "e.g. Green Casa Stays",
        })}
        {text("address_1", "Address", {
          required: true,
          autoComplete: "address-line1",
          placeholder: "Street and number",
        })}
        <div className="grid gap-5 sm:grid-cols-2 sm:gap-3">
          {text("city", "City", { required: true, autoComplete: "address-level2" })}
          {text("state", "State / region", { autoComplete: "address-level1" })}
        </div>
        <div className="grid gap-5 sm:grid-cols-[minmax(0,0.6fr)_minmax(0,1fr)] sm:gap-3">
          {text("zip", "Postcode", { autoComplete: "postal-code" })}
          <SelectField
            id="company-country_id"
            label="Country"
            required
            value={countryId}
            onChange={(event) => set("country_id")(event.target.value)}
            error={errors.country_id ?? (countriesFailed ? "Countries could not be loaded." : undefined)}
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
        {countriesFailed ? (
          <Button size="sm" variant="outline" className="justify-self-start" onClick={retry}>
            <Icon name="refresh" size={14} /> Reload countries
          </Button>
        ) : null}
        {text("company_email", "Company email", {
          type: "email",
          autoComplete: "email",
          hint: "Guests' booking emails go here.",
        })}
        <PhoneField
          id="company-phone"
          label="Company phone (optional)"
          country={phoneCountry}
          number={values.phone}
          onChange={({ country, number }) => {
            setPhoneCountry(country);
            set("phone")(number);
          }}
          error={errors.phone}
          hint="Leave empty to use your WhatsApp number."
        />
        {text("website", "Website (optional)", { type: "url", inputMode: "url", placeholder: "www.example.com" })}

        <div>
          <p className="mb-2 text-small font-semibold text-heading">Logo (optional)</p>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={() => logoInput.current?.click()}>
              <Icon name="upload" size={16} /> {logo ? "Change logo" : saved?.logo ? "Replace logo" : "Upload logo"}
            </Button>
            <span className="text-small text-body">
              {logo ? logo.name : saved?.logo ? "A logo is saved." : "JPG, PNG, GIF or WEBP, up to 5 MB"}
            </span>
            <input
              ref={logoInput}
              id="company-logo"
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="sr-only"
              tabIndex={-1}
              aria-label="Choose a logo"
              onChange={(event) => {
                onLogoChange(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </div>
          {errors.logo ? (
            <p className="mt-2 flex items-center gap-1.5 text-caption font-medium text-error" role="alert">
              <Icon name="alert" size={14} /> {errors.logo}
            </p>
          ) : null}
        </div>

        <div className="rounded-input border border-border">
          <button
            type="button"
            onClick={() => setMoreOpen((open) => !open)}
            aria-expanded={moreOpen}
            aria-controls="company-more"
            className="flex w-full items-center justify-between gap-3 rounded-input px-4 py-3 text-left text-small font-semibold text-heading hover:bg-surface-muted focus-visible:outline-none focus-visible:focus-ring"
          >
            Business details (optional)
            <Icon
              name="chevronDown"
              size={18}
              className={moreOpen ? "rotate-180 transition-transform" : "transition-transform"}
            />
          </button>
          <div id="company-more" hidden={!moreOpen} className="grid gap-5 border-t border-divider p-4">
            {text("contact_person", "Contact person", { autoComplete: "name" })}
            {text("address_2", "Address line 2", { autoComplete: "address-line2" })}
            {text("legal_name", "Legal name")}
            <div className="grid gap-5 sm:grid-cols-2 sm:gap-3">
              {text("registration_no", "Registration number")}
              {text("tax_no", "Tax / GST number")}
            </div>
            <TextareaField
              id="company-description"
              label="About your company"
              rows={3}
              value={values.description}
              onChange={(event) => set("description")(event.target.value)}
              error={errors.description}
            />
          </div>
        </div>

        <StepFooter
          start={
            <Button href="/setup/property" variant="text">
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
