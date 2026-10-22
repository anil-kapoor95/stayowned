"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Card";
import { GoogleMark } from "@/components/ui/Icon";
import { signupApi } from "@/lib/api/signup";
import {
  GoogleCancelled,
  loadGoogleClientId,
  requestGoogleAccessToken,
  setPendingGoogle,
  useGoogleAvailable,
} from "../google";
import { setSignupFlash, startSignupSession } from "../signup-session";
import { ACCOUNT_HREF, hrefForNextStep, LIVE_HREF } from "../steps";

/**
 * "Continue with Google" + an "or …" divider. Hidden when Google sign-in is not set up.
 * Existing account -> logged in (payment page or next step). New account -> step 1 with the
 * Google name and e-mail filled in; the host only adds a WhatsApp number.
 */
export function GoogleButton({ dividerText }: { dividerText: string }) {
  const router = useRouter();
  const available = useGoogleAvailable();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ text: string; dashboard?: string } | null>(null);

  if (available === false) return null;

  async function onClick() {
    setError(null);
    setBusy(true);
    try {
      const accessToken = await requestGoogleAccessToken();
      const result = await signupApi.google(accessToken, await loadGoogleClientId());
      if (!result.ok) {
        const dashboard = (result.data as { login_url?: string } | undefined)?.login_url;
        setError({ text: result.message, dashboard });
        return;
      }
      const data = result.data;
      if (data.new_account && data.google) {
        setPendingGoogle({ ...data.google, accessToken, clientId: await loadGoogleClientId() });
        router.push(ACCOUNT_HREF);
        return;
      }
      if (data.signup_token) {
        setPendingGoogle(null);
        startSignupSession(data.signup_token, data);
        const name = data.account.first_name || data.account.name;
        if (data.status === "completed") {
          setSignupFlash({
            tone: "success",
            text: `Welcome back${name ? `, ${name}` : ""}. You're logged in with Google.`,
          });
          router.push(LIVE_HREF);
        } else {
          setSignupFlash({ tone: "info", text: "Welcome back. Continue your registration where you left off." });
          router.push(hrefForNextStep(data.next_step));
        }
      }
    } catch (caught) {
      if (!(caught instanceof GoogleCancelled)) {
        setError({ text: caught instanceof Error ? caught.message : "Google sign-in failed. Please try again." });
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div aria-hidden={available === null ? true : undefined} className={available === null ? "invisible" : undefined}>
      <Button variant="outline" size="lg" fullWidth onClick={onClick} disabled={busy} aria-busy={busy}>
        <GoogleMark /> {busy ? "Connecting to Google…" : "Continue with Google"}
      </Button>
      {error ? (
        <Notice tone="error" role="alert" className="mt-3">
          {error.text}{" "}
          {error.dashboard ? (
            <a href={error.dashboard} className="font-semibold underline underline-offset-2">
              Open the dashboard
            </a>
          ) : null}
        </Notice>
      ) : null}
      <div className="my-6 flex items-center gap-3 text-small text-body" role="separator" aria-label={dividerText}>
        <span className="h-px flex-1 bg-divider" />
        <span aria-hidden="true">{dividerText}</span>
        <span className="h-px flex-1 bg-divider" />
      </div>
    </div>
  );
}
