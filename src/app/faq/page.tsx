import { FaqPage } from "@/components/marketing/FaqPage";
import { FAQ_GROUPS } from "@/components/marketing/faq-data";
import { JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "FAQ",
  description: "Everything about going live, getting paid and staying in sync with StayOwned.",
  path: "/faq",
});

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_GROUPS.flatMap((group) =>
    group.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  ),
};

export default function Page() {
  return (
    <>
      <JsonLd data={faqJsonLd} />
      <FaqPage />
    </>
  );
}
