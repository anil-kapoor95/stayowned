import { PricingPage } from "@/components/marketing/PricingPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Pricing",
  description:
    "Keep more of every direct booking. Start free, upgrade to Pro for your own domain. 0% commission on every plan.",
  path: "/pricing",
});

export default function Page() {
  return <PricingPage />;
}
