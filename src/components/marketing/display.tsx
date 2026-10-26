import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { FaqAccordion } from "./FaqAccordion";
import type { FaqItem } from "./faq-data";
import { ArrowIcon } from "./figma-icons";

/**
 * Section pieces of the Figma "pricing page" and "Themes page" frames, which use larger
 * Bricolage Grotesque display headings than the other marketing pages.
 */

export function DisplayEyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("font-body text-caption font-extrabold uppercase leading-[18px] tracking-[0.12em] text-brand", className)}>
      {children}
    </p>
  );
}

/** "NO SURPRISES / Simple pricing / Start free…" style header. */
export function DisplaySectionHeader({
  id,
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: {
  id: string;
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div className={cn(align === "center" ? "mx-auto max-w-[650px] text-center" : "max-w-[650px]", className)}>
      {eyebrow ? <DisplayEyebrow className="pb-[18px] pt-[5px]">{eyebrow}</DisplayEyebrow> : null}
      <h2 id={id} className="font-display text-section-xl text-ink-strong opsz-14">
        {title}
      </h2>
      {description ? <p className="pt-3 font-body text-base leading-[1.65] text-slate">{description}</p> : null}
    </div>
  );
}

/** "GOOD TO KNOW / Frequently asked questions" with the shared accordion and support box. */
export function FaqSection({ id, items }: { id: string; items: FaqItem[] }) {
  return (
    <section aria-labelledby={id} className="py-section sm:py-[104px]">
      <div className="container-page">
        <DisplaySectionHeader id={id} eyebrow="Good to know" title="Frequently asked questions" />
        <div className="mt-[42px]">
          <FaqAccordion items={items} className="max-w-[900px]" />
        </div>
      </div>
    </section>
  );
}

/** Navy "Ready to launch your direct booking website" card. */
export function LaunchCta() {
  return (
    <section aria-labelledby="launch-cta-title" className="container-page pb-section pt-5 sm:pb-20">
      <div className="relative mx-auto max-w-[1024px] overflow-hidden rounded-[30px] bg-cta-panel px-6 py-12 text-center sm:px-12 sm:py-[42px] sm:pb-[43px]">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -left-[180px] -top-[140px] size-[400px] rounded-pill border-[0.667px] border-white/16 bg-cta-circle"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-[734px] top-[180px] size-[520px] rounded-pill border-[0.667px] border-white/16 bg-cta-circle max-sm:left-auto max-sm:-right-[300px]"
        />
        <div className="relative mx-auto max-w-[575px]">
          <DisplayEyebrow className="pb-[18px] pt-[5px]">Your website. Your guests.</DisplayEyebrow>
          <h2
            id="launch-cta-title"
            className="mx-auto max-w-[554px] font-display text-section-xl font-semibold text-white opsz-14 sm:leading-[64.8px] sm:tracking-[-0.048em]"
          >
            Ready to launch your direct booking website
          </h2>
          <p className="pb-[25px] pt-3 font-body text-base leading-6 text-white/76">
            Your free booking website is only 5 minutes away.
          </p>
          <Button href="/setup/account" className="font-bold">
            Create my free website <ArrowIcon />
          </Button>
        </div>
      </div>
    </section>
  );
}
