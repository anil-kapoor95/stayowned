"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ensureSignupLoaded, useSignupSession } from "@/features/onboarding/signup-session";
import { hrefForNextStep, WIZARD_STEPS } from "@/features/onboarding/steps";

/**
 * Shown on every page outside the sign-up while a registration on this browser is unfinished:
 * "Step 3 of 6: Property — Continue setup", so a host who left the wizard can pick it up again.
 */
export function ResumeBanner() {
  const pathname = usePathname();
  const { token, state } = useSignupSession();

  useEffect(() => {
    void ensureSignupLoaded();
  }, []);

  if (!token || !state || state.status === "completed" || pathname.startsWith("/setup") || pathname === "/login") {
    return null;
  }
  const next = WIZARD_STEPS.find((step) => step.number === state.next_step);
  return (
    <div className="border-b border-primary-subtle bg-primary-tint">
      <div className="container-page flex flex-wrap items-center justify-between gap-3 py-3 text-small">
        <p className="flex items-center gap-2 text-body-strong">
          <Icon name="info" size={16} className="shrink-0 text-primary" />
          <span>
            <strong className="text-heading">Your registration isn&apos;t finished.</strong>{" "}
            {next ? `Next: step ${next.number} of ${WIZARD_STEPS.length} — ${next.label}.` : null}
          </span>
        </p>
        <Button href={hrefForNextStep(state.next_step)} size="sm">
          Continue setup <Icon name="arrowRight" size={14} />
        </Button>
      </div>
    </div>
  );
}
