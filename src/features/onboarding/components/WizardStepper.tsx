"use client";

import Link from "next/link";
import { Fragment } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { useSignupSession } from "../signup-session";
import { ACCOUNT_EDIT_HREF, WIZARD_STEPS, type WizardStepId } from "../steps";

/**
 * Pill-shaped progress indicator: "① Account — ② Company — ③ Property …".
 * Done/reachable states come from the saved sign-up on the server.
 */
export function WizardStepper({ current }: { current: WizardStepId }) {
  const { state } = useSignupSession();
  const completed = state?.completed_steps ?? 0;

  return (
    <nav aria-label="Setup progress">
      <ol className="inline-flex max-w-full items-center gap-2 rounded-pill border border-border bg-surface px-3 py-2 sm:gap-3 sm:px-4">
        {WIZARD_STEPS.map((step, index) => {
          const isCurrent = step.id === current;
          const done = !isCurrent && step.number <= completed;
          const reachable = step.number <= completed + 1;
          // Step 1 done: its link opens the account form again (/setup/account itself resumes at the next step).
          const href = step.id === "account" && completed >= 1 ? ACCOUNT_EDIT_HREF : step.href;
          const content = (
            <>
              <span
                className={cn(
                  "grid size-5 place-items-center rounded-pill text-caption font-semibold",
                  isCurrent && "bg-primary-strong text-on-primary",
                  done && "bg-primary-soft text-primary-strong",
                  !isCurrent && !done && "border border-muted text-muted",
                )}
              >
                {done ? <Icon name="check" size={12} strokeWidth={3} /> : step.number}
                {done ? <span className="sr-only">Completed:</span> : null}
              </span>
              <span className={cn(isCurrent ? "font-semibold text-heading" : "sr-only text-muted sm:not-sr-only")}>
                {step.label}
              </span>
            </>
          );
          return (
            <Fragment key={step.id}>
              {index > 0 ? <li aria-hidden="true" className="h-px w-3 bg-divider sm:w-6" /> : null}
              <li>
                {reachable || isCurrent ? (
                  <Link
                    href={href}
                    aria-current={isCurrent ? "step" : undefined}
                    className="flex items-center gap-2 rounded-pill text-small focus-visible:outline-none focus-visible:focus-ring"
                  >
                    {content}
                  </Link>
                ) : (
                  <span className="flex cursor-not-allowed items-center gap-2 text-small" aria-disabled="true">
                    {content}
                  </span>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
