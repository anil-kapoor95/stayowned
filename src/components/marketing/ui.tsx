import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

/** Contact details shown on the marketing pages (from the Figma "Contact Us" frame — replace with the real ones). */
export const SUPPORT = {
  phoneDisplay: "+91 98765 43210",
  phoneHref: "tel:+919876543210",
  whatsappHref: "https://wa.me/919876543210",
  email: "hello@stayowned.com",
} as const;

/** Small uppercase label above a heading, in the three styles used in the Figma frames. */
export function Eyebrow({
  children,
  variant = "plain",
  className,
  onDark = false,
}: {
  children: ReactNode;
  variant?: "plain" | "pill" | "lines";
  className?: string;
  onDark?: boolean;
}) {
  if (variant === "pill") {
    return (
      <p
        className={cn(
          "inline-flex items-center gap-2 rounded-pill border border-primary-subtle bg-surface/80 px-3 py-1 text-caption font-bold uppercase tracking-wider text-primary-strong",
          className,
        )}
      >
        <span className="size-1.5 rounded-pill bg-brand" aria-hidden="true" />
        {children}
      </p>
    );
  }
  if (variant === "lines") {
    return (
      <p
        className={cn(
          "flex items-center justify-center gap-3 text-caption font-bold uppercase tracking-wider",
          onDark ? "text-primary-on-dark" : "text-primary-strong",
          className,
        )}
      >
        <span className="h-px w-5 bg-current" aria-hidden="true" />
        {children}
        <span className="h-px w-5 bg-current" aria-hidden="true" />
      </p>
    );
  }
  return (
    <p
      className={cn(
        "text-caption font-bold uppercase tracking-wider",
        onDark ? "text-primary-on-dark" : "text-primary-strong",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function SectionHeader({
  eyebrow,
  eyebrowVariant = "plain",
  title,
  description,
  align = "center",
  id,
  onDark = false,
}: {
  eyebrow?: ReactNode;
  eyebrowVariant?: "plain" | "pill" | "lines";
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
  id?: string;
  onDark?: boolean;
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
      {eyebrow ? (
        <Eyebrow variant={eyebrowVariant} onDark={onDark} className={cn("mb-3", align === "center" && "mx-auto")}>
          {eyebrow}
        </Eyebrow>
      ) : null}
      <h2 id={id} className={cn("text-display", onDark && "text-on-dark")}>
        {title}
      </h2>
      {description ? (
        <p className={cn("mt-3 text-lead", onDark ? "text-on-dark-muted" : "text-body")}>{description}</p>
      ) : null}
    </div>
  );
}

/** Orange round tick used in feature lists. */
export function CheckItem({ children, onDark = false }: { children: ReactNode; onDark?: boolean }) {
  return (
    <li className={cn("flex items-start gap-3 text-small font-semibold", onDark ? "text-on-dark" : "text-heading")}>
      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-pill bg-primary text-on-primary">
        <Icon name="check" size={12} strokeWidth={3} />
      </span>
      {children}
    </li>
  );
}

/** Navy closing banner ("Give your guests a place to book you directly"). */
export function CtaBanner({
  title,
  description = "Your free booking website is only 5 minutes away.",
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section aria-labelledby="cta-title" className="container-page py-section">
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-panel bg-secondary-active px-6 py-12 text-center text-on-dark sm:px-12 sm:py-14">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-24 size-64 rounded-pill bg-white/5"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -right-20 size-80 rounded-pill bg-white/5"
        />
        <div className="relative">
          <Eyebrow onDark className="mb-3">
            Your website. Your guests.
          </Eyebrow>
          <h2 id="cta-title" className="mx-auto max-w-xl text-display text-on-dark">
            {title}
          </h2>
          <p className="mt-3 text-base text-on-dark-muted">{description}</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {children ?? (
              <Button href="/setup/account" size="lg">
                Create my free website <Icon name="arrowRight" size={16} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
