import { ContactPage } from "@/components/marketing/ContactPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact us",
  description:
    "Talk to our onboarding team about moving your property, setting up payments or launching your direct booking website.",
  path: "/contact",
});

export default function Page() {
  return <ContactPage />;
}
