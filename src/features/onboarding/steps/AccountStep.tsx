"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Card";
import { TextField } from "@/components/ui/Field";
import { PhoneField } from "@/components/ui/PhoneField";
import { signupApi, type SignupState } from "@/lib/api/signup";
import { cn } from "@/lib/utils";
import {
  DEFAULT_PHONE_COUNTRY,
  getPhoneCountry,
  splitInternational,
  toInternational,
  validatePhoneNumber,
} from "@/lib/phone";
import { passwordStrength, validateEmail, validateRequired } from "@/lib/validation";
import {
  clearSignupSession,
  setSignupFlash,
  startSignupSession,
  updateSignupState,
  useSignupSession,
} from "../signup-session";
import { hrefForNextStep, LIVE_HREF } from "../steps";
import { setPendingGoogle, usePendingGoogle, type PendingGoogle } from "../google";
import { GoogleButton } from "../components/GoogleButton";
import { StepCard } from "../components/WizardShell";

type Field = "name" | "email" | "whatsapp" | "password" | "confirm";
type Errors = Partial<Record<Field, string>>;

const strengthLabel = ["", "Weak", "Fair", "Strong"] as const;

/** Server field names -> form fields. */
const SERVER_FIELDS: Record<string, Field> = {
  first_name: "name",
  last_name: "name",
  name: "name",
  email: "email",
  phone: "whatsapp",
  password: "password",
  confirm_password: "confirm",
};

export function AccountStep() {
  const { token, state } = useSignupSession();
  const pendingGoogle = usePendingGoogle();
  // Signed in with Google but no account yet: name and e-mail come from Google.
  const google = token && state ? null : pendingGoogle;
  // A new form when the sign-up changes (e.g. "Start a new registration", or a Google account chosen).
  return <AccountForm key={token ?? (google ? `google:${google.email}` : "new")} google={google} />;
}

function AccountForm({ google }: { google: PendingGoogle | null }) {
  const router = useRouter();
  const { token, state } = useSignupSession();
  const editing = Boolean(token && state);
  const saved = state?.account;
  const savedPhone = splitInternational(saved?.phone ?? "");

  const [values, setValues] = useState({
    name: saved?.name ?? google?.name ?? "",
    email: saved?.email ?? google?.email ?? "",
    country: saved ? savedPhone.country : DEFAULT_PHONE_COUNTRY,
    whatsapp: saved ? savedPhone.number : "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);

  const country = getPhoneCountry(values.country);
  const strength = passwordStrength(values.password);

  const set = (key: keyof typeof values) => (value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    if (errors[key as Field]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  /** Live check: is this e-mail already registered? */
  async function onEmailBlur() {
    const email = values.email.trim();
    if (validateEmail(email) || (editing && email === saved?.email)) return;
    const result = await signupApi.checkEmail(email, token);
    if (!result.ok && result.errors.email) setErrors((current) => ({ ...current, email: result.errors.email }));
  }

  /** Live check against the password rules configured in the back office. */
  async function onPasswordBlur() {
    if (!values.password) return;
    const result = await signupApi.checkPassword(values.password);
    if (!result.ok && result.errors.password) {
      setErrors((current) => ({
        ...current,
        password: result.errors.password,
      }));
    }
  }

  function validate(): Errors {
    const next: Errors = {
      name: validateRequired(values.name, "your name", 2),
      email: validateEmail(values.email),
      whatsapp: validatePhoneNumber(country, values.whatsapp, {
        label: "WhatsApp number",
      }),
    };
    // With Google no password is needed (one can still be chosen); when editing it is optional too.
    const passwordNeeded = (!editing && !google) || values.password !== "" || values.confirm !== "";
    if (passwordNeeded) {
      if (!values.password) next.password = "Please choose a password.";
      if (!values.confirm) next.confirm = "Please confirm your password.";
      else if (values.password && values.password !== values.confirm) next.confirm = "Passwords do not match.";
    }
    return next;
  }

  function goNext(next: SignupState) {
    router.push(next.status === "completed" ? LIVE_HREF : hrefForNextStep(next.next_step));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const next = validate();
    setErrors(next);
    const firstInvalid = (Object.keys(next) as Field[]).find((key) => next[key]);
    if (firstInvalid) {
      document.getElementById(`account-${firstInvalid}`)?.focus();
      return;
    }

    setSubmitting(true);
    const result = await signupApi.account(
      {
        name: values.name.trim(),
        email: values.email.trim(),
        phone: toInternational(country, values.whatsapp),
        password: values.password || undefined,
        confirm_password: values.confirm || undefined,
        google_access_token: google && !editing ? google.accessToken : undefined,
        google_client_id: google && !editing ? google.clientId : undefined,
      },
      editing ? token : undefined,
    );
    setSubmitting(false);

    if (result.ok) {
      const data = result.data;
      setPendingGoogle(null);
      if (data.signup_token) {
        startSignupSession(data.signup_token, data);
        if (data.resumed) setSignupFlash({ tone: "info", text: result.message });
      } else {
        updateSignupState(data);
      }
      goNext(data);
      return;
    }

    if (result.code === 409 && result.data) {
      goNext(result.data as SignupState);
      return;
    }
    if (google && result.code === 401) {
      // The Google sign-in expired (about an hour): choose the account again.
      setPendingGoogle(null);
      setFormError(`${result.message} Click "Continue with Google" again.`);
      return;
    }
    const mapped: Errors = {};
    for (const [field, text] of Object.entries(result.errors)) {
      const key = SERVER_FIELDS[field];
      if (key && !mapped[key]) mapped[key] = text;
    }
    setErrors(mapped);
    const first = (Object.keys(mapped) as Field[])[0];
    if (first) document.getElementById(`account-${first}`)?.focus();
    else setFormError(result.message);
  }

  return (
    <StepCard
      title={editing ? "Your account" : "Create your free account"}
      description={
        editing ? "Update your details, then continue." : "Your booking page will be ready in about 5 minutes."
      }
    >
      {!editing && google ? (
        <Notice tone="success" className="mb-6" title={`Signed in with Google as ${google.email}`}>
          <p>Add your WhatsApp number to create your account. No password needed — you log in with Google.</p>
          <button
            type="button"
            onClick={() => setPendingGoogle(null)}
            className="mt-2 rounded-sm font-semibold text-heading underline underline-offset-2 hover:text-link-hover focus-visible:outline-none focus-visible:focus-ring"
          >
            Sign up with a different e-mail
          </button>
        </Notice>
      ) : null}
      {!editing && !google ? <GoogleButton dividerText="or sign up with email" /> : null}

      {formError ? (
        <Notice tone="error" role="alert" className="mb-5">
          {formError}
        </Notice>
      ) : null}

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
          onBlur={google ? undefined : onEmailBlur}
          readOnly={Boolean(google && !editing)}
          hint={google && !editing ? "Your Google e-mail." : undefined}
          error={errors.email}
          required
        />
        <PhoneField
          id="account-whatsapp"
          label="WhatsApp number"
          country={values.country}
          number={values.whatsapp}
          onChange={({ country: code, number }) => {
            setValues((current) => ({
              ...current,
              country: code,
              whatsapp: number,
            }));
            if (errors.whatsapp) setErrors((current) => ({ ...current, whatsapp: undefined }));
          }}
          error={errors.whatsapp}
          required
        />
        {google && !editing ? null : (
          <>
            <div>
              <TextField
                id="account-password"
                label={editing ? "New password" : "Password"}
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder={editing ? "Leave empty to keep your password" : "Choose a password"}
                value={values.password}
                onChange={(event) => set("password")(event.target.value)}
                onBlur={onPasswordBlur}
                error={errors.password}
                required={!editing}
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-pressed={showPassword}
                    aria-controls="account-password account-confirm"
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
                {strength
                  ? `Password strength: ${strengthLabel[strength]}`
                  : "Use a mix of letters, numbers and symbols."}
              </p>
            </div>
            <TextField
              id="account-confirm"
              label="Confirm password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={values.confirm}
              onChange={(event) => set("confirm")(event.target.value)}
              error={errors.confirm}
              required={!editing}
            />
          </>
        )}

        <Button type="submit" size="lg" fullWidth className="mt-1" disabled={submitting} aria-busy={submitting}>
          {submitting ? "Saving…" : editing ? "Save and continue" : "Create account and add my property"}
        </Button>

        {editing ? (
          <p className="text-center text-caption text-body">
            Not {saved?.name || "you"}?{" "}
            <button
              type="button"
              onClick={() => clearSignupSession()}
              className="rounded-sm font-semibold text-heading underline-offset-2 hover:underline focus-visible:outline-none focus-visible:focus-ring"
            >
              Start a new registration
            </button>
          </p>
        ) : (
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
            Already started registering?{" "}
            <button
              type="button"
              onClick={() => setResumeOpen((open) => !open)}
              aria-expanded={resumeOpen}
              aria-controls="resume-form"
              className="rounded-sm font-semibold text-heading underline-offset-2 hover:underline focus-visible:outline-none focus-visible:focus-ring"
            >
              Continue where you left off
            </button>
          </p>
        )}
      </form>

      {!editing && resumeOpen ? <ResumeForm onResumed={goNext} /> : null}
    </StepCard>
  );
}

/** E-mail + password -> new sign-up token (other device, or the token was lost). */
function ResumeForm({ onResumed }: { onResumed: (state: SignupState) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [message, setMessage] = useState<{
    text: string;
    loginUrl?: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    const next = {
      email: validateEmail(email),
      password: password ? undefined : "Please enter your password.",
    };
    setErrors(next);
    if (next.email || next.password) return;
    setBusy(true);
    const result = await signupApi.resume(email.trim(), password);
    setBusy(false);
    if (result.ok && result.data.signup_token) {
      startSignupSession(result.data.signup_token, result.data);
      setSignupFlash({
        tone: "info",
        text: "Welcome back! Here's where you left off.",
      });
      onResumed(result.data);
      return;
    }
    if (!result.ok) {
      setErrors({
        email: result.errors.email,
        password: result.errors.password,
      });
      if (!result.errors.email && !result.errors.password) {
        setMessage({
          text: result.message,
          loginUrl: (result.data as SignupState | undefined)?.login_url,
        });
      }
    }
  }

  return (
    <form
      id="resume-form"
      noValidate
      onSubmit={onSubmit}
      className="mt-6 grid gap-4 rounded-input border border-border bg-surface-muted p-4 sm:p-5"
    >
      <h2 className="font-body text-base font-bold text-heading">Continue your registration</h2>
      {message ? (
        <Notice tone="error" role="alert">
          {message.text}{" "}
          {message.loginUrl ? (
            <a href={message.loginUrl} className="font-semibold underline">
              Log in
            </a>
          ) : null}
        </Notice>
      ) : null}
      <TextField
        id="resume-email"
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        required
      />
      <TextField
        id="resume-password"
        label="Password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        required
      />
      <Button type="submit" variant="secondary" disabled={busy} aria-busy={busy} className="justify-self-start">
        {busy ? "Checking…" : "Continue"}
      </Button>
    </form>
  );
}
