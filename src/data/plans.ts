/** Plans from the Figma "pricing page" frame (section "Simple pricing"). */
export interface Plan {
  id: "starter" | "pro" | "business";
  name: string;
  price: string;
  period?: string;
  features: string[];
  cta: { label: string; href: string };
  style: "plain" | "popular" | "dark";
}

export const PLANS: readonly Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: "Free",
    features: [
      "stayowned.com/your-property",
      "1 property listing · Clean theme",
      "AI-written description & highlights",
      "1 payment gateway (Razorpay / Stripe)",
      "Direct WhatsApp sharing bar",
      "0% platform commissions",
    ],
    cta: { label: "Start free", href: "/setup/account" },
    style: "plain",
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹1,499",
    period: "/month",
    features: [
      "Everything in Starter",
      "Your own custom domain (SSL included)",
      "Airbnb & Booking.com 2-way calendar sync",
      "Multiple payment gateways (UPI, PayPal, Stripe)",
      "Unlock all 4 premium designer themes",
      "Discount coupons & promotional pricing",
      "Custom SEO tags & visitor analytics",
    ],
    // No checkout exists yet: the trial starts from sign-up.
    cta: { label: "Go Pro — 14-day trial", href: "/setup/account" },
    style: "popular",
  },
  {
    id: "business",
    name: "Business · AI",
    price: "₹3,499",
    period: "/month",
    features: [
      "Everything in Pro",
      "24/7 AI concierge on your website & WhatsApp",
      "Answers questions from your house rules",
      "Real-time availability and rate quotes",
      "Direct checkout guidance for inquiring guests",
      "Multi-property management dashboard",
      "Dedicated WhatsApp onboarding manager",
    ],
    cta: { label: "Join waitlist", href: "/contact" },
    style: "dark",
  },
];

/** "Every plan includes" stats. */
export const PLAN_STATS = [
  { value: "0%", label: "Commission on bookings" },
  { value: "5 min", label: "Average setup time" },
  { value: "24/7", label: "Your website stays open" },
  { value: "100%", label: "Built for mobile" },
] as const;
