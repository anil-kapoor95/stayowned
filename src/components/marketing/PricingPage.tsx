import Link from "next/link";
import { PLANS, PLAN_STATS, type Plan } from "@/data/plans";
import { cn } from "@/lib/utils";
import { DisplaySectionHeader, FaqSection, LaunchCta } from "./display";
import { PRICING_FAQS } from "./faq-data";
import { HeroAccent, PageHero } from "./PageHero";
import { PricingPlanCard, planCtaBase, planCtaClass } from "./PricingPlanCard";

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
  return (
    <PricingPlanCard
      name={plan.name}
      price={plan.price}
      period={plan.period}
      features={plan.features}
      style={plan.style}
      badge={plan.style === "popular" ? "Most popular" : undefined}
      cta={
        <Link href={plan.cta.href} className={cn(planCtaBase, planCtaClass[plan.style])}>
          {plan.cta.label}
        </Link>
      }
    />
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
