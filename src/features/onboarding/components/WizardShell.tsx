import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { stepNumber, type WizardStepId } from "../steps";
import { SignupGate } from "./SignupGate";
import { WizardStepper } from "./WizardStepper";

/**
 * Two-column wizard layout from Figma: 694px form card + 464px preview column
 * (1188px container). Stacks on screens narrower than 1024px.
 */
export function WizardShell({
  step,
  aside,
  children,
  wide = false,
  editing = false,
}: {
  step: WizardStepId;
  /** Step 1 opened again after it was done (see SignupGate). */
  editing?: boolean;
  aside?: ReactNode;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="container-page py-8 sm:py-10">
      <WizardStepper current={step} />
      <div className="mt-6 sm:mt-8">
        <SignupGate step={stepNumber(step)} editing={editing}>
          <div
            className={cn(
              "grid grid-cols-1 items-start gap-7",
              !wide && Boolean(aside) && "lg:grid-cols-[minmax(0,1fr)_var(--container-aside)]",
            )}
          >
            <div className="min-w-0">{children}</div>
            {aside ? (
              <aside
                aria-label="Live preview"
                className="min-w-0 space-y-5 lg:sticky lg:top-[calc(var(--spacing-header)+1.5rem)]"
              >
                {aside}
              </aside>
            ) : null}
          </div>
        </SignupGate>
      </div>
    </div>
  );
}

/** White wizard card with the step heading. */
export function StepCard({
  title,
  description,
  children,
  headingAside,
}: {
  title: string;
  description: ReactNode;
  children: ReactNode;
  headingAside?: ReactNode;
}) {
  return (
    <section className="rounded-card border border-border bg-card p-card-sm shadow-card sm:p-card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-display">{title}</h1>
          <p className="mt-2 text-lead text-body">{description}</p>
        </div>
        {headingAside}
      </div>
      <div className="mt-7">{children}</div>
    </section>
  );
}

/** Footer row: "Back · Skip for now ……… Continue". */
export function StepFooter({ start, end }: { start?: ReactNode; end: ReactNode }) {
  return (
    <div className="mt-8 flex flex-col-reverse gap-4 border-t border-divider pt-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-5 text-small text-body">{start}</div>
      <div className="flex justify-end">{end}</div>
    </div>
  );
}
