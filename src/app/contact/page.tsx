import { ContactForm } from "@/components/info/ContactForm";
import { InfoPageLayout } from "@/components/info/InfoPageLayout";
import { Notice } from "@/components/ui/Card";
import { pageMetadata } from "@/lib/seo";

const description = "Questions about setting up your booking page, payments or Pro? Send us a message.";

export const metadata = pageMetadata({ title: "Contact us", description, path: "/contact" });

export default function ContactPage() {
  return (
    <InfoPageLayout title="Contact us" description={description} path="/contact">
      <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="rounded-card border border-border bg-card p-card-sm shadow-card sm:p-card" aria-label="Contact form">
          <ContactForm />
        </section>
        <aside className="grid gap-4">
          <Notice tone="info" title="WhatsApp support">
            The onboarding team&apos;s WhatsApp number will be added here once it is confirmed — it isn&apos;t part of the design
            files.
          </Notice>
        </aside>
      </div>
    </InfoPageLayout>
  );
}
