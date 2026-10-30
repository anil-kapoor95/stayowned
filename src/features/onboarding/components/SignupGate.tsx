"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { clearSignupFlash, ensureSignupLoaded, useSignupSession, type SignupSession } from "../signup-session";
import { ACCOUNT_HREF, LIVE_HREF, hrefForNextStep, stepNumber } from "../steps";

type GateStep = number | "live" | "preview";

/** Where a visitor on step `step` (1-6, "live" or "preview") must go instead, or null when they may stay. */
function redirectFor(session: SignupSession, step: GateStep, editing: boolean): string | null {
  const { token, state } = session;
  if (!token || !state) {
    return step === 1 && !editing ? null : ACCOUNT_HREF;
  }
  if (state.status === "completed") {
    // A company added in the back office may have no property yet: nothing to preview.
    if (step === "preview" && !state.property) return LIVE_HREF;
    return step === "live" || step === "preview" ? null : LIVE_HREF;
  }
  // The preview needs a property (step 2) to show.
  if (step === "preview") return state.completed_steps >= stepNumber("property") ? null : hrefForNextStep(state.next_step);
  if (step === "live") return hrefForNextStep(state.next_step);
  // Step 1 is done once: coming back to it (also /setup/account/edit) continues where the sign-up stopped.
  if (step === 1 && state.completed_steps >= 1) return hrefForNextStep(state.next_step);
  // Steps cannot be skipped: every earlier step must be done.
  if (step > state.completed_steps + 1) return hrefForNextStep(state.next_step);
  return null;
}

/**
 * Wraps a sign-up page: loads the saved sign-up (token in localStorage), sends the
 * visitor to the step they have to do next, and shows one-off messages.
 * Step 1 (account) is done once: `/setup/account/edit` also sends the host on to the next step.
 */
export function SignupGate({
  step,
  children,
  fallbackClassName,
  editing = false,
  flashClassName,
  showFlash = true,
}: {
  step: GateStep;
  children: ReactNode;
  /** Wrapper for the loading / error state when the gate is used outside the wizard layout. */
  fallbackClassName?: string;
  /** Step 1 opened again to change it (/setup/account/edit): no redirect to the next step. */
  editing?: boolean;
  /** Wrapper of the one-off message (default: fallbackClassName). */
  flashClassName?: string;
  /** False: the page shows no one-off message (it waits for the next page). */
  showFlash?: boolean;
}) {
  const router = useRouter();
  const session = useSignupSession();

  useEffect(() => {
    void ensureSignupLoaded();
  }, []);

  const target = session.phase === "ready" && !session.error ? redirectFor(session, step, editing) : null;

  useEffect(() => {
    if (target) router.replace(target);
  }, [router, target]);

  // Show a flash message once, then drop it.
  useEffect(() => {
    if (!session.flash || !showFlash) return;
    const timer = window.setTimeout(clearSignupFlash, 8000);
    return () => window.clearTimeout(timer);
  }, [session.flash, showFlash]);

  if (session.phase !== "ready" || target) {
    return (
      <div className={fallbackClassName}>
        <div
          role="status"
          aria-live="polite"
          className="flex min-h-80 items-center justify-center gap-3 rounded-card border border-border bg-card p-card-sm text-body shadow-card"
        >
          <span
            className="size-5 animate-spin rounded-pill border-2 border-border border-t-primary"
            aria-hidden="true"
          />
          Loading your registration…
        </div>
      </div>
    );
  }

  if (session.error && step !== 1) {
    return (
      <div className={fallbackClassName}>
        <Notice tone="error" role="alert" title="We couldn't load your registration">
          <p>{session.error}</p>
          <Button size="sm" variant="outline" className="mt-3" onClick={() => void ensureSignupLoaded(true)}>
            <Icon name="refresh" size={14} /> Try again
          </Button>
        </Notice>
      </div>
    );
  }

  return (
    <>
      {session.flash && showFlash ? (
        <div className={flashClassName ?? fallbackClassName}>
          <Notice tone={session.flash.tone} role="status" className="mb-5">
            {session.flash.text}
          </Notice>
        </div>
      ) : null}
      {children}
    </>
  );
}
