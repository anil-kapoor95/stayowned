import Link from "next/link";
import { PLANS, PLAN_STATS, type Plan } from "@/data/plans";
import { cn } from "@/lib/utils";
import { DisplaySectionHeader, FaqSection, LaunchCta } from "./display";
import { PRICING_FAQS } from "./faq-data";
import { PlanTickIcon } from "./figma-icons";
import { HeroAccent, PageHero } from "./PageHero";

/** "Pricing" page from the Figma "pricing page" frame (132:478). */
export function PricingPage() {
  return (
    <div className="bg-surface">
      <PageHero
        id="pricing-title"
        eyebrow="Simple pricing"
        title={
          <>
            Keep More of Every <span className="block">
              <HeroAccent>Direct Booking</HeroAccent>
            </span>
          </>
        }
        intro="No commissions. No hidden fees. Just the tools you need to turn more lookers into bookers."
      />
      <Plans />
      <Stats />
      <FaqSection id="pricing-faq-title" items={PRICING_FAQS} />
      <LaunchCta />
    </div>
  );
}

/* ------------------------------------------------------------ Plans */

function Plans() {
  return (
    <section aria-labelledby="plans-title" className="pb-section pt-[49px] sm:pb-[104px]">
      <div className="container-page">
        <DisplaySectionHeader
          id="plans-title"
          eyebrow="No surprises"
          title="Simple pricing"
          description="Start free. Upgrade when you want your own domain."
        />
        <ul className="mx-auto mt-[67px] grid max-w-[1112px] grid-cols-1 items-start gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const dark = plan.style === "dark";
  const popular = plan.style === "popular";
  return (
    <li
      className={cn(
        "relative flex flex-col rounded-plan border-2 px-[38px] py-11",
        plan.style === "plain" && "border-border bg-surface",
        popular && "border-brand bg-surface shadow-plan-popular max-md:mt-3 md:-mt-3",
        dark && "border-secondary bg-secondary",
      )}
    >
      {popular ? (
        <span className="absolute -top-3.5 left-9 rounded-pill bg-primary px-4 py-[4.6px] font-heading text-caption font-extrabold uppercase leading-[19.2px] tracking-[0.06em] text-on-primary drop-shadow-popular-badge">
          Most popular
        </span>
      ) : null}

      <h3 className={cn("font-heading text-[1.5rem] font-extrabold leading-[1.1] tracking-[-0.035em]", dark ? "text-white" : "text-heading")}>
        {plan.name}
      </h3>
      <p className="flex items-baseline gap-1 pb-[26px] pt-4">
        <span className={cn("font-display text-price opsz-14", dark ? "text-white" : "text-heading")}>{plan.price}</span>
        {plan.period ? <span className="font-heading text-[0.9375rem] font-medium text-body">{plan.period}</span> : null}
      </p>

      <ul className={cn("flex flex-col pb-9", plan.style === "plain" ? "gap-3.5" : "gap-[13.5px]")}>
        {plan.features.map((feature) => (
          <li
            key={feature}
            className={cn(
              "flex items-center gap-3 font-heading text-[0.9375rem] font-semibold leading-6",
              dark ? "text-plan-text-on-dark" : "text-plan-text",
              plan.style === "plain" && "py-[12.6px]",
            )}
          >
            <PlanTickIcon onDark={dark} />
            {feature}
          </li>
        ))}
      </ul>

      <Link
        href={plan.cta.href}
        className={cn(
          "flex h-[52px] w-full items-center justify-center rounded-pill px-[29px] font-heading text-[0.9375rem] font-bold leading-6 transition-colors",
          "focus-visible:outline-none focus-visible:focus-ring",
          plan.style === "plain" &&
            "border border-border bg-surface text-heading drop-shadow-plan-button hover:border-border-strong",
          popular && "bg-primary text-on-primary shadow-plan-cta hover:bg-primary-hover",
          dark && "bg-white text-heading hover:bg-surface-muted",
        )}
      >
        {plan.cta.label}
      </Link>
    </li>
  );
}

/* ------------------------------------------------------------ Stats */

function Stats() {
  return (
    <section aria-labelledby="stats-title" className="bg-section-warm pb-[100px] pt-[85px]">
      <div className="container-page text-center">
        <p className="font-display text-[0.6875rem] font-extrabold leading-[16.5px] tracking-[0.16em] text-stat opsz-96">
          EVERY PLAN INCLUDES
        </p>
        <h2 id="stats-title" className="pt-[15px] font-display text-section-xl text-ink-strong opsz-14 sm:leading-[49px] sm:tracking-[-0.045em]">
          A better booking experience, <span className="sm:block">right from day one.</span>
        </h2>
        <ul className="mx-auto mt-[54px] grid max-w-[1000px] grid-cols-2 overflow-hidden rounded-[22px] border-[0.667px] border-stat-border md:grid-cols-4">
          {PLAN_STATS.map((stat, index) => (
            <li
              key={stat.label}
              className={cn(
                "flex flex-col items-center px-5 py-[35px]",
                index < PLAN_STATS.length - 1 && "md:border-r-[0.667px] md:border-stat-divider",
                index % 2 === 0 && "max-md:border-r-[0.667px] max-md:border-stat-divider",
                index < 2 && "max-md:border-b-[0.667px] max-md:border-stat-divider",
              )}
            >
              <span className="font-display text-[2.125rem] font-bold leading-[51px] text-stat opsz-14">{stat.value}</span>
              <span className="font-display text-[0.8125rem] leading-[19.5px] text-slate opsz-14">{stat.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
