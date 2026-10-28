"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { Icon } from "@/components/ui/Icon";
import { PricingPlanCard, planCtaBase, planCtaClass, type PlanCardStyle } from "@/components/marketing/PricingPlanCard";
import { signupApi, type ApiPlan } from "@/lib/api/signup";
import { cn } from "@/lib/utils";

type PlansData = { plans: ApiPlan[]; current: { code: string; name: string; status: string } | null; myPlanUrl: string };

function formatPrice(plan: ApiPlan): string {
  if (plan.price === null) return "On request";
  if (plan.price === 0) return "Free";
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: plan.currency,
      maximumFractionDigits: Number.isInteger(plan.price) ? 0 : 2,
    }).format(plan.price);
  } catch {
    return `${plan.price} ${plan.currency}`;
  }
}

function periodLabel(plan: ApiPlan): string | undefined {
  if (!plan.price) return undefined;
  const unit = plan.billing_interval === "year" ? "year" : "month";
  return plan.interval_count > 1 ? `/${plan.interval_count} ${unit}s` : `/${unit}`;
}

/** Pricing page look: plans without themes plain, the first plan with themes "Most popular", higher ones dark. */
function cardStyle(plan: ApiPlan, plans: ApiPlan[]): PlanCardStyle {
  if (!plan.includes_themes) return "plain";
  const firstWithThemes = plans.find((item) => item.includes_themes);
  return firstWithThemes?.id === plan.id ? "popular" : "dark";
}

/**
 * "Everything in Starter" + what the plan adds, as on the Pricing page: the base is the biggest
 * earlier plan whose features this plan all has; without one, every feature is listed.
 */
function featureLines(plan: ApiPlan, earlier: ApiPlan[]): string[] {
  const keys = new Set(plan.features.map((feature) => feature.key));
  const base = earlier
    .filter((other) => other.features.length < plan.features.length && other.features.every((f) => keys.has(f.key)))
    .sort((x, y) => y.features.length - x.features.length)[0];
  if (!base) return plan.features.map((feature) => feature.label);
  const before = new Set(base.features.map((feature) => feature.key));
  return [`Everything in ${base.name}`, ...plan.features.filter((f) => !before.has(f.key)).map((f) => f.label)];
}

/**
 * "Unlock premium themes": every plan from the back office (Subscriptions > Plans, active and public),
 * shown like the Pricing page. Plans are bought in the dashboard (Subscriptions > My plan), which
 * takes the payment; plans without a price lead to the contact page.
 */
export function UpgradePlansDialog({
  open,
  token,
  themeName,
  onClose,
  onKeepFree,
  onRefresh,
}: {
  open: boolean;
  token: string | null;
  /** The paid theme the host chose. */
  themeName: string | null;
  onClose: () => void;
  /** Close and use the free theme. */
  onKeepFree: () => void;
  /** The host says they upgraded: load the themes again. */
  onRefresh: () => void;
}) {
  const [data, setData] = useState<PlansData | null>(null);
  const [error, setError] = useState<string>();
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!open) return;
    let active = true;
    void signupApi.plans(token).then((result) => {
      if (!active) return;
      if (result.ok) {
        setData({ plans: result.data.plans, current: result.data.current, myPlanUrl: result.data.my_plan_url });
        setError(undefined);
      } else {
        setError(result.message);
      }
    });
    return () => {
      active = false;
    };
  }, [open, token, reload]);

  const plans = data?.plans ?? [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="xl"
      title="Unlock premium themes"
      description={
        <>
          {themeName ? (
            <>
              <strong className="text-heading">{themeName}</strong> is a premium theme.{" "}
            </>
          ) : null}
          The first theme is free on every plan; choose a plan with themes to use the others.
        </>
      }
      icon={
        <span className="grid size-12 shrink-0 place-items-center rounded-input bg-primary-soft text-primary">
          <Icon name="lock" size={22} />
        </span>
      }
      footer={
        <>
          <p className="mr-auto max-w-xl text-caption text-muted">
            Plans are bought in your StayOwned dashboard (Subscriptions → My plan): log in there with the same email and
            password, then come back and check again.
          </p>
          <Button variant="secondary" onClick={onRefresh}>
            <Icon name="refresh" size={15} /> I&apos;ve upgraded — check again
          </Button>
        </>
      }
    >
      {error ? (
        <Notice tone="error" role="alert" title="Plans could not be loaded">
          <p>{error}</p>
          <Button size="sm" variant="outline" className="mt-3" onClick={() => setReload((n) => n + 1)}>
            <Icon name="refresh" size={14} /> Try again
          </Button>
        </Notice>
      ) : !data ? (
        <div className="grid gap-6 md:grid-cols-3" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-96 animate-pulse rounded-plan bg-surface-muted" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <Notice tone="info" title="No plans to show yet">
          Plans haven&apos;t been set up yet.{" "}
          <Link className="font-semibold underline" href="/contact">
            Contact us
          </Link>{" "}
          to unlock premium themes.
        </Notice>
      ) : (
        <div className="px-1 pb-2 pt-6 sm:px-2">
          <ul
            className={cn(
              "mx-auto grid grid-cols-1 items-start gap-6",
              plans.length === 2 && "max-w-3xl md:grid-cols-2",
              plans.length >= 3 && "md:grid-cols-3",
            )}
          >
            {plans.map((plan, index) => {
              const style = cardStyle(plan, plans);
              const current = data.current?.code === plan.code;
              const cta = cn(planCtaBase, planCtaClass[style]);
              return (
                <PricingPlanCard
                  key={plan.id}
                  name={plan.name}
                  price={formatPrice(plan)}
                  period={periodLabel(plan)}
                  note={plan.trial_days > 0 && plan.price !== 0 ? `${plan.trial_days}-day free trial` : undefined}
                  features={featureLines(plan, plans.slice(0, index))}
                  style={style}
                  badge={current ? "Current plan" : style === "popular" ? "Most popular" : undefined}
                  cta={
                    current ? (
                      <button type="button" className={cta} onClick={onRefresh}>
                        Check my themes again
                      </button>
                    ) : !plan.includes_themes ? (
                      <button type="button" className={cta} onClick={onKeepFree}>
                        Keep the free theme
                      </button>
                    ) : plan.purchasable ? (
                      <a href={data.myPlanUrl} target="_blank" rel="noopener noreferrer" className={cta}>
                        Buy {plan.name} <Icon name="externalLink" size={15} />
                        <span className="sr-only"> (opens your dashboard in a new tab)</span>
                      </a>
                    ) : (
                      <Link href="/contact" className={cta}>
                        Contact us
                      </Link>
                    )
                  }
                />
              );
            })}
          </ul>
        </div>
      )}
    </Dialog>
  );
}
