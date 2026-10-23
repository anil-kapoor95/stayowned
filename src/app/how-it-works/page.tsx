import { HowItWorksPage } from "@/components/marketing/HowItWorksPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "How it works",
  description:
    "Live in 5 minutes: sign up free, add your property, let AI build your page, then share your link and get booked directly.",
  path: "/how-it-works",
});

export default function Page() {
  return <HowItWorksPage />;
}
