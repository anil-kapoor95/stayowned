import { PricingPage } from "@/components/marketing/PricingPage";
import { getPublicPlans } from "@/lib/api/plans";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Pricing",
  description:
    "Keep more of every direct booking. Start free, upgrade when you need more. 0% commission on every plan.",
  path: "/pricing",
});

// The plans (prices, limits, features) come from the back office on each request.
export const instant = false;

export default async function Page() {
  const plans = await getPublicPlans();
  return <PricingPage plans={plans} />;
}
