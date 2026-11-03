import { HomePage } from "@/components/marketing/HomePage";
import { getPublicPlans } from "@/lib/api/plans";
import { pageMetadata } from "@/lib/seo";

const title = "StayOwned — your own direct booking website";
const description =
  "Get your own booking page in 5 minutes. Add your property, AI writes the rest, and guests book and pay you directly with 0% commission.";

export const metadata = { ...pageMetadata({ title, description, path: "/" }), title: { absolute: title } };

// The pricing section shows the plans of the back office (fresh on each request).
export const instant = false;

export default async function Page() {
  const plans = await getPublicPlans();
  return <HomePage plans={plans} />;
}
