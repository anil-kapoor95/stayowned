import { HomePage } from "@/components/marketing/HomePage";
import { pageMetadata } from "@/lib/seo";

const title = "StayOwned — your own direct booking website";
const description =
  "Get your own booking page in 5 minutes. Add your property, AI writes the rest, and guests book and pay you directly with 0% commission.";

export const metadata = { ...pageMetadata({ title, description, path: "/" }), title: { absolute: title } };

export default function Page() {
  return <HomePage />;
}
