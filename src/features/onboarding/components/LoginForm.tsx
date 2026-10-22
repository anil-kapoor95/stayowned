"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Card";
import { TextField } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { signupApi } from "@/lib/api/signup";
import { validateEmail } from "@/lib/validation";
import {
  ensureSignupLoaded,
  logoutSignup,
  setSignupFlash,
  startSignupSession,
  useSignupSession,
} from "../signup-session";
import { ACCOUNT_HREF, hrefForNextStep, LIVE_HREF } from "../steps";
import { GoogleButton } from "./GoogleButton";

type Errors = Partial<Record<"email" | "password", string>>;

/**
 * Host log-in (pjActionSignupLogin): email + password of the account made with the sign-up.
 * A completed sign-up opens "your page is live" (payments); an unfinished one continues at its next step.
 */
export function LoginForm() {
  const router = useRouter();
  const { token, state, phase } = useSignupSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState<{ text: string; dashboard?: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void ensureSignupLoaded();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    const next: Errors = {
      email: validateEmail(email),
      password: password ? undefined : "Please enter your password.",
    };
    setErrors(next);
    const invalid = (Object.keys(next) as (keyof Errors)[]).find((key) => next[key]);
    if (invalid) {
      document.getElementById(`login-${invalid}`)?.focus();
      return;
    }
    setBusy(true);
    const result = await signupApi.login(email.trim(), password);
    setBusy(false);
    if (result.ok && result.data.signup_token) {
      const data = result.data;
      startSignupSession(data.signup_token!, data);
      if (data.status === "completed") {
        setSignupFlash({
          tone: "success",
          text: `Welcome back, ${data.account.first_name || data.account.name}. You're logged in.`,
        });
        router.push(LIVE_HREF);
      } else {
        setSignupFlash({ tone: "info", text: "Welcome back. Continue your registration where you left off." });
        router.push(hrefForNextStep(data.next_step));
      }
      return;
    }
    if (!result.ok) {
      setErrors(result.errors as Errors);
      const dashboard = (result.data as { login_url?: string } | undefined)?.login_url;
      if (Object.keys(result.errors).length === 0) setMessage({ text: result.message, dashboard });
    }
  }

  if (phase === "ready" && token && state) {
    const completed = state.status === "completed";
    return (
      <div className="grid gap-4">
        <Notice tone="success" title={`You're logged in as ${state.account.name || state.account.email}`}>
          {completed ? "Your booking page is live." : "Your registration isn't finished yet."}
        </Notice>
        <div className="flex flex-wrap gap-3">
          <Button href={completed ? LIVE_HREF : hrefForNextStep(state.next_step)}>
            {completed ? "Go to my page" : "Continue setup"} <Icon name="arrowRight" size={16} />
          </Button>
          <Button variant="outline" onClick={() => void logoutSignup()}>
            <Icon name="logout" size={16} /> Log out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <GoogleButton dividerText="or log in with email" />
      <form noValidate onSubmit={onSubmit} className="grid gap-5">
        {message ? (
          <Notice tone="error" role="alert">
            {message.text}{" "}
            {message.dashboard ? (
              <a href={message.dashboard} className="font-semibold underline underline-offset-2">
                Open the dashboard
              </a>
            ) : null}
          </Notice>
        ) : null}
        <TextField
          id="login-email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setErrors((current) => ({ ...current, email: undefined }));
          }}
          error={errors.email}
          required
        />
        <TextField
          id="login-password"
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setErrors((current) => ({ ...current, password: undefined }));
          }}
          error={errors.password}
          required
        />
        <Button type="submit" size="lg" fullWidth disabled={busy} aria-busy={busy}>
          {busy ? "Logging in…" : "Log in"}
        </Button>
        <p className="text-center text-small text-body">
          New to StayOwned?{" "}
          <Link
            href={ACCOUNT_HREF}
            className="rounded-sm font-semibold text-primary-strong underline underline-offset-2 hover:text-link-hover focus-visible:outline-none focus-visible:focus-ring"
          >
            Create your free page
          </Link>
        </p>
      </form>
    </>
  );
}
