import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PlanTickIcon } from "./figma-icons";

export type PlanCardStyle = "plain" | "popular" | "dark";

/** Card styles of the Pricing page plans (Figma "pricing page", "Simple pricing"). */
export const planCtaClass: Record<PlanCardStyle, string> = {
  plain: "border border-border bg-surface text-heading drop-shadow-plan-button hover:border-border-strong",
  popular: "bg-primary text-on-primary shadow-plan-cta hover:bg-primary-hover",
  dark: "bg-white text-heading hover:bg-surface-muted",
};

export const planCtaBase =
  "flex h-[52px] w-full items-center justify-center gap-2 rounded-pill px-[29px] font-heading text-[0.9375rem] font-bold leading-6 transition-colors focus-visible:outline-none focus-visible:focus-ring disabled:cursor-default disabled:opacity-70";

/**
 * One plan card as on the Pricing page: name, price, ticked features and a call to action.
 * Shared by the Pricing page and the upgrade dialog of the theme step.
 */
export function PricingPlanCard({
  name,
  price,
  period,
  features,
  style,
  badge,
  cta,
  note,
  compact = false,
  as: Tag = "li",
}: {
  name: string;
  /** "Free", "₹1,499", "Price on request" … */
  price: string;
  period?: string;
  features: string[];
  style: PlanCardStyle;
  /** Ribbon on the top edge ("Most popular", "Current plan"). Shown on popular cards, or when set. */
  badge?: string;
  /** The button / link (use planCtaBase + planCtaClass[style]). */
  cta: ReactNode;
  /** Small line under the price, e.g. "14-day free trial". */
  note?: string;
  /** Smaller padding and no raised popular card (plans side by side in a window). */
  compact?: boolean;
  as?: "li" | "div";
}) {
  const dark = style === "dark";
  const popular = style === "popular";
  const longPrice = price.length > 9;
  return (
    <Tag
      className={cn(
        "relative flex snap-start flex-col rounded-plan border-2",
        compact ? "px-6 py-8" : "px-[38px] py-11",
        style === "plain" && "border-border bg-surface",
        popular && "border-brand bg-surface shadow-plan-popular",
        popular && !compact && "max-md:mt-3 md:-mt-3",
        dark && "border-secondary bg-secondary",
      )}
    >
      {badge ? (
        <span className={cn("absolute -top-3.5", compact ? "left-6" : "left-9", "rounded-pill bg-primary px-4 py-[4.6px] font-heading text-caption font-extrabold uppercase leading-[19.2px] tracking-[0.06em] text-on-primary drop-shadow-popular-badge")}>
          {badge}
        </span>
      ) : null}

      <h3 className={cn("font-heading text-[1.5rem] font-extrabold leading-[1.1] tracking-[-0.035em]", dark ? "text-white" : "text-heading")}>
        {name}
      </h3>
      <p className={cn("flex flex-wrap items-baseline gap-1 pt-4", note ? "pb-1" : "pb-[26px]")}>
        <span
          className={cn(
            "font-display opsz-14",
            longPrice ? "text-[1.75rem] font-bold leading-tight" : "text-price",
            dark ? "text-white" : "text-heading",
          )}
        >
          {price}
        </span>
        {period ? <span className="font-heading text-[0.9375rem] font-medium text-body">{period}</span> : null}
      </p>
      {note ? (
        <p className={cn("pb-[22px] font-heading text-small font-semibold", dark ? "text-plan-text-on-dark" : "text-success")}>
          {note}
        </p>
      ) : null}

      <ul className={cn("flex flex-1 flex-col pb-9", style === "plain" ? "gap-3.5" : "gap-[13.5px]")}>
        {features.map((feature) => (
          <li
            key={feature}
            className={cn(
              "flex items-center gap-3 font-heading text-[0.9375rem] font-semibold leading-6",
              dark ? "text-plan-text-on-dark" : "text-plan-text",
              style === "plain" && !compact && "py-[12.6px]",
            )}
          >
            <PlanTickIcon onDark={dark} />
            {feature}
          </li>
        ))}
      </ul>

      {cta}
    </Tag>
  );
}
