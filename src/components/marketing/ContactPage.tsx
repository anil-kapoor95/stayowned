import { Button } from "@/components/ui/Button";
import { Icon, WhatsAppMark } from "@/components/ui/Icon";
import { ContactUsForm } from "./ContactUsForm";
import { FaqAccordion } from "./FaqAccordion";
import { CONTACT_FAQS } from "./faq-data";
import { MarketingIcon, type MarketingIconName } from "./icons";
import { CtaBanner, Eyebrow, SectionHeader, SUPPORT } from "./ui";

const SOCIAL: { label: string; icon: MarketingIconName }[] = [
  { label: "Instagram", icon: "instagram" },
  { label: "Facebook", icon: "facebook" },
  { label: "LinkedIn", icon: "linkedin" },
  { label: "X", icon: "xLogo" },
  { label: "YouTube", icon: "youtube" },
];

/** Contact page from the Figma "Contact Us" frame. */
export function ContactPage() {
  return (
    <>
      <section
        aria-labelledby="contact-title"
        className="relative overflow-hidden bg-linear-to-br from-primary-soft via-primary-tint to-surface"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-24 size-[34rem] rounded-pill border border-primary-subtle/70"
        />
        <div className="container-page relative py-14 text-center sm:py-20">
          <Eyebrow variant="pill">Support</Eyebrow>
          <h1 id="contact-title" className="mt-5 text-hero">
            We&apos;re here to help. <span className="block text-brand">Let&apos;s connect.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lead text-body">
            Talk to our onboarding team about migrating your property, setting up payments, or launching your direct
            booking website.
          </p>
          <ul className="mt-7 flex flex-wrap justify-center gap-2.5 text-caption font-semibold text-heading">
            <li className="flex items-center gap-1.5 rounded-pill border border-border bg-surface px-3.5 py-2 shadow-card">
              <MarketingIcon name="bolt" size={14} className="text-brand" /> WhatsApp reply &lt; 5 mins
            </li>
            <li className="flex items-center gap-1.5 rounded-pill border border-border bg-surface px-3.5 py-2 shadow-card">
              <MarketingIcon name="badgeCheck" size={14} className="text-brand" /> 100% Free Concierge Setup
            </li>
            <li className="flex items-center gap-1.5 rounded-pill border border-border bg-surface px-3.5 py-2 shadow-card">
              <MarketingIcon name="coins" size={14} className="text-brand" /> 0% Commission Guaranteed
            </li>
          </ul>
        </div>
      </section>

      <section aria-label="Contact options" className="container-page py-section">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="rounded-panel border border-border bg-surface p-6 shadow-card sm:p-9">
            <h2 id="contact-form-title" className="font-heading text-section">
              Send us a message
            </h2>
            <p className="mt-2 text-small text-body">Tell us what you need and we&apos;ll get back to you.</p>
            <div className="mt-7">
              <ContactUsForm />
            </div>
          </div>

          <aside className="grid gap-4" aria-label="Other ways to reach us">
            <div className="rounded-card bg-secondary-active p-6 text-on-dark">
              <span className="grid size-11 place-items-center rounded-input bg-whatsapp text-white" aria-hidden="true">
                <WhatsAppMark size={22} />
              </span>
              <p className="mt-4 font-heading text-title text-on-dark">Chat with us</p>
              <p className="mt-1 text-small text-on-dark-muted">
                The fastest way to reach our team, usually within 5 minutes.
              </p>
              <Button href={SUPPORT.whatsappHref} external variant="whatsapp" fullWidth className="mt-5">
                <WhatsAppMark size={18} /> Open WhatsApp
              </Button>
            </div>

            <a
              href={SUPPORT.phoneHref}
              className="flex items-center gap-4 rounded-card border border-border bg-surface p-5 shadow-card transition-colors hover:border-primary focus-visible:outline-none focus-visible:focus-ring"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-input bg-primary-soft text-primary-strong">
                <MarketingIcon name="phone" size={20} />
              </span>
              <span>
                <span className="block text-caption font-bold uppercase tracking-wider text-muted">Phone</span>
                <span className="block font-semibold text-heading">{SUPPORT.phoneDisplay}</span>
              </span>
            </a>

            <a
              href={`mailto:${SUPPORT.email}`}
              className="flex items-center gap-4 rounded-card border border-border bg-surface p-5 shadow-card transition-colors hover:border-primary focus-visible:outline-none focus-visible:focus-ring"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-input bg-primary-soft text-primary-strong">
                <Icon name="mail" size={20} />
              </span>
              <span className="min-w-0">
                <span className="block text-caption font-bold uppercase tracking-wider text-muted">Email</span>
                <span className="block truncate font-semibold text-heading">{SUPPORT.email}</span>
              </span>
            </a>

            <div className="rounded-card bg-primary-soft p-5">
              <p className="font-heading text-title">Follow us</p>
              <p className="mt-1 text-caption text-body">Tips for hosts and new features.</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {SOCIAL.map((item) => (
                  <li key={item.label}>
                    <span
                      title={item.label}
                      className="grid size-10 place-items-center rounded-input bg-surface text-heading shadow-card"
                    >
                      <MarketingIcon name={item.icon} size={18} />
                      <span className="sr-only">{item.label}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section aria-labelledby="contact-faq-title" className="bg-primary-tint py-section">
        <div className="container-page">
          <SectionHeader id="contact-faq-title" eyebrow="Good to know" title="Frequently asked questions" />
          <div className="mt-10">
            <FaqAccordion items={CONTACT_FAQS} showSupport={false} />
          </div>
        </div>
      </section>

      <CtaBanner title="Ready to launch your direct booking website" />
    </>
  );
}
