import type { PlanCardStyle } from "@/components/marketing/PricingPlanCard";
import type { ApiPlan } from "@/lib/api/signup";

/**
 * How a plan from the back office (Subscriptions > Plans) is shown on plan cards: price, period, card style
 * and feature lines. Used by the Pricing page and the upgrade dialog of the sign-up.
 */

export function formatPlanPrice(plan: ApiPlan): string {
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

export function planPeriodLabel(plan: ApiPlan): string | undefined {
  if (!plan.price) return undefined;
  const unit = plan.billing_interval === "year" ? "year" : "month";
  return plan.interval_count > 1 ? `/${plan.interval_count} ${unit}s` : `/${unit}`;
}

/** Does the plan include the feature (themes by default)? */
export function planIncludes(plan: ApiPlan, featureKey?: string): boolean {
  return featureKey ? plan.features.some((feature) => feature.key === featureKey) : plan.includes_themes;
}

/** Plans without the feature plain, the first plan with it "Most popular", higher ones dark. */
export function planCardStyle(plan: ApiPlan, plans: ApiPlan[], featureKey?: string): PlanCardStyle {
  if (!planIncludes(plan, featureKey)) return "plain";
  const firstWith = plans.find((item) => planIncludes(item, featureKey));
  return firstWith?.id === plan.id ? "popular" : "dark";
}

/**
 * "Everything in Starter" + what the plan adds: the base is the biggest earlier plan whose features
 * this plan all has; without one, every feature is listed.
 */
export function planFeatureLines(plan: ApiPlan, earlier: ApiPlan[]): string[] {
  const keys = new Set(plan.features.map((feature) => feature.key));
  const base = earlier
    .filter((other) => other.features.length < plan.features.length && other.features.every((f) => keys.has(f.key)))
    .sort((x, y) => y.features.length - x.features.length)[0];
  if (!base) return plan.features.map((feature) => feature.label);
  const before = new Set(base.features.map((feature) => feature.key));
  return [`Everything in ${base.name}`, ...plan.features.filter((f) => !before.has(f.key)).map((f) => f.label)];
}

/** Limits of the plan as card lines ("1 property", "Unlimited properties" …); unlimited ones are left out unless all are. */
export function planLimitLines(plan: ApiPlan): string[] {
  const limits = plan.limits;
  if (!limits) return [];
  const line = (value: number | null, one: string, many: string) =>
    value === null ? null : `${value} ${value === 1 ? one : many}`;
  return [
    limits.max_properties === null ? "Unlimited properties" : line(limits.max_properties, "property", "properties"),
    line(limits.max_users, "team member", "team members"),
    line(limits.max_payment_gateways, "online payment gateway", "online payment gateways"),
  ].filter((value): value is string => Boolean(value));
}

/** Lines of a plan card: "Everything in …" first, then the limits, then the features (at most `max`). */
export function planCardLines(plan: ApiPlan, earlier: ApiPlan[], max = 9): string[] {
  const features = planFeatureLines(plan, earlier);
  const limits = planLimitLines(plan);
  const lines = features[0]?.startsWith("Everything in ")
    ? [features[0], ...limits, ...features.slice(1)]
    : [...limits, ...features];
  return lines.slice(0, max);
}
