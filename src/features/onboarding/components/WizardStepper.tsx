import Link from "next/link";
import { Fragment } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { WIZARD_STEPS, type WizardStepId } from "../steps";

/** Pill-shaped progress indicator: "① Account — ② Property — ③ Photos …" */
export function WizardStepper({ current }: { current: WizardStepId }) {
  const currentIndex = WIZARD_STEPS.findIndex((step) => step.id === current);
  return (
    <nav aria-label="Setup progress" className="-mx-gutter overflow-x-auto px-gutter pb-1 sm:mx-0 sm:px-0">
      <ol className="inline-flex min-w-max items-center gap-3 rounded-pill border border-border bg-surface px-4 py-2">
        {WIZARD_STEPS.map((step, index) => {
          const state = index < currentIndex ? "done" : index === currentIndex ? "current" : "upcoming";
          return (
            <Fragment key={step.id}>
              {index > 0 ? <li aria-hidden="true" className="h-px w-6 bg-divider" /> : null}
              <li>
                <Link
                  href={step.href}
                  aria-current={state === "current" ? "step" : undefined}
                  className="flex items-center gap-2 rounded-pill text-small focus-visible:outline-none focus-visible:focus-ring"
                >
                  <span
                    className={cn(
                      "grid size-5 place-items-center rounded-pill text-caption font-semibold",
                      state === "current" && "bg-primary-strong text-on-primary",
                      state === "done" && "bg-primary-soft text-primary-strong",
                      state === "upcoming" && "border border-muted text-muted",
                    )}
                  >
                    {state === "done" ? <Icon name="check" size={12} strokeWidth={3} /> : index + 1}
                    {state === "done" ? <span className="sr-only">Completed:</span> : null}
                  </span>
                  <span
                    className={cn(
                      state === "current" ? "font-semibold text-heading" : "text-muted hover:text-heading",
                    )}
                  >
                    {step.label}
                  </span>
                </Link>
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
