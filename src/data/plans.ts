/** Pricing page: the plans themselves come from the back office (Subscriptions > Plans, see getPublicPlans). */

/** "Every plan includes" stats. */
export const PLAN_STATS = [
  { value: "0%", label: "Commission on bookings" },
  { value: "5 min", label: "Average setup time" },
  { value: "24/7", label: "Your website stays open" },
  { value: "100%", label: "Built for mobile" },
] as const;
