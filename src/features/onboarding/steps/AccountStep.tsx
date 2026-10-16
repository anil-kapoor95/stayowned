"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Card";
import { SelectField, TextField } from "@/components/ui/Field";
import { GoogleMark } from "@/components/ui/Icon";
import { COUNTRIES, getCountry } from "@/data/countries";
import { cn } from "@/lib/utils";
import {
  digitsOnly,
  passwordStrength,
  validateEmail,
  validatePassword,
  validatePhone,
  validateRequired,
} from "@/lib/validation";
import { updateDraft, useDraft } from "../draft-store";
import { StepCard } from "../components/WizardShell";

type Errors = Partial<Record<"name" | "email" | "whatsapp" | "password", string>>;

const strengthLabel = ["", "Weak", "Fair", "Strong"] as const;

export function AccountStep() {
  const router = useRouter();
  const draft = useDraft();
  const [values, setValues] = useState({
    name: draft.account?.name ?? "",
    email: draft.account?.email ?? "",
    country: draft.account?.country ?? "IN",
    whatsapp: draft.account?.whatsapp ?? "",
    password: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [googleNotice, setGoogleNotice] = useState(false);

  const country = getCountry(values.country);
  const strength = passwordStrength(values.password);

  const set = (key: keyof typeof values) => (value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    if (errors[key as keyof Errors]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  function validate(): Errors {
    return {
      name: validateRequired(values.name, "your name", 2),
      email: validateEmail(values.email),
      whatsapp: validatePhone(values.whatsapp, country.phonePattern, country.phoneExample),
      password: validatePassword(values.password),
    };
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    const firstInvalid = (Object.keys(next) as (keyof Errors)[]).find((key) => next[key]);
    if (firstInvalid) {
      document.getElementById(`account-${firstInvalid}`)?.focus();
      return;
    }
    // Demo only: no account is created. The password is discarded and never stored.
    updateDraft((current) => ({
      ...current,
      account: {
        name: values.name.trim(),
        email: values.email.trim(),
        country: values.country,
        whatsapp: digitsOnly(values.whatsapp),
      },
    }));
    router.push("/setup/property");
  }

  return (
    <StepCard title="Create your free account" description="Your booking page will be ready in about 5 minutes.">
      <Button variant="outline" size="lg" fullWidth onClick={() => setGoogleNotice(true)}>
        <GoogleMark /> Continue with Google
      </Button>
      {googleNotice ? (
        <Notice tone="info" className="mt-3" role="status" title="Google sign-in isn't connected yet">
          This is a static demo without a backend. Please continue with email below.
        </Notice>
      ) : null}

      <div className="my-6 flex items-center gap-3 text-small text-body" role="separator" aria-label="or sign up with email">
        <span className="h-px flex-1 bg-divider" />
        <span aria-hidden="true">or sign up with email</span>
        <span className="h-px flex-1 bg-divider" />
      </div>

      <form noValidate onSubmit={onSubmit} className="grid grid-cols-1 gap-5">
        <TextField
          id="account-name"
          label="Your name"
          placeholder="e.g. Rahul Desai"
          autoComplete="name"
          value={values.name}
          onChange={(event) => set("name")(event.target.value)}
          error={errors.name}
          required
        />
        <TextField
          id="account-email"
          label="Email"
          type="email"
          inputMode="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={values.email}
          onChange={(event) => set("email")(event.target.value)}
          error={errors.email}
          required
        />
        <div className="grid gap-5 sm:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)] sm:gap-3">
          <SelectField
            id="account-country"
            label="Country"
            autoComplete="country"
            value={values.country}
            onChange={(event) => set("country")(event.target.value)}
          >
            {COUNTRIES.map((item) => (
              <option key={item.code} value={item.code}>
                {item.name}
              </option>
            ))}
          </SelectField>
          <TextField
            id="account-whatsapp"
            label="WhatsApp number"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder={country.phoneExample}
            prefix={<span className="font-semibold text-heading">{country.dialCode}</span>}
            prefixPadding={country.dialCode.length > 3 ? "pl-16" : "pl-14"}
            value={values.whatsapp}
            onChange={(event) => set("whatsapp")(event.target.value)}
            error={errors.whatsapp}
            required
          />
        </div>
        <div>
          <TextField
            id="account-password"
            label="Password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={values.password}
            onChange={(event) => set("password")(event.target.value)}
            error={errors.password}
            required
            suffix={
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-pressed={showPassword}
                aria-controls="account-password"
                className="rounded-sm px-3 py-1.5 text-small font-semibold text-heading hover:bg-surface-muted focus-visible:outline-none focus-visible:focus-ring"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            }
          />
          <div className="mt-2 grid grid-cols-3 gap-2" aria-hidden="true">
            {[1, 2, 3].map((level) => (
              <span
                key={level}
                className={cn(
                  "h-1 rounded-pill transition-colors",
                  strength >= level
                    ? strength === 1
                      ? "bg-error"
                      : strength === 2
                        ? "bg-primary"
                        : "bg-success"
                    : "bg-divider",
                )}
              />
            ))}
          </div>
          <p className="mt-1.5 text-caption text-muted" aria-live="polite">
            {strength ? `Password strength: ${strengthLabel[strength]}` : "Use 8+ characters with a mix of letters, numbers and symbols."}
          </p>
        </div>

        <Button type="submit" size="lg" fullWidth className="mt-1">
          Create account and add my property
        </Button>
        <p className="text-center text-caption text-body">
          By signing up you agree to our{" "}
          <Link href="/terms" className="font-semibold text-heading underline-offset-2 hover:underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="font-semibold text-heading underline-offset-2 hover:underline">
            Privacy Policy
          </Link>
          .
          <br />
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-heading underline-offset-2 hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </StepCard>
  );
}
