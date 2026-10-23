import Image from "next/image";
import type { ReactNode } from "react";
import { ThemePreview } from "@/components/theme/ThemePreview";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { THEMES } from "@/data/themes";
import { cn } from "@/lib/utils";
import { FaqAccordion } from "./FaqAccordion";
import { HOME_FAQS } from "./faq-data";
import { CheckItem, CtaBanner, Eyebrow, SectionHeader } from "./ui";

/** Home page from the Figma "Homepage" frame. Photos are the project's placeholder images. */
export function HomePage() {
  return (
    <>
      <Hero />
      <StayTypes />
      <HowSteps />
      <BookingFlow />
      <FeatureCards />
      <AiAssistant />
      <Themes />
      <Pricing />
      <section aria-labelledby="home-faq-title" className="bg-primary-tint py-section">
        <div className="container-page">
          <SectionHeader id="home-faq-title" eyebrow="Good to know" title="Frequently asked questions" />
          <div className="mt-10">
            <FaqAccordion items={HOME_FAQS} />
          </div>
        </div>
      </section>
      <CtaBanner title="Give your guests a place to book you directly" />
    </>
  );
}

/* ------------------------------------------------------------------ Hero */

function Hero() {
  return (
    <section
      aria-labelledby="home-title"
      className="relative overflow-hidden bg-linear-to-br from-primary-soft via-primary-tint to-surface"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-10 size-[38rem] rounded-pill border border-primary-subtle/70"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 top-32 size-[26rem] rounded-pill border border-primary-subtle/70"
      />
      <div className="container-page relative grid grid-cols-1 items-center gap-12 py-14 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)]">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-caption font-bold uppercase tracking-wider text-primary-strong">
            <span className="size-2 rounded-pill bg-brand" aria-hidden="true" />
            The easiest way to book direct
          </p>
          <h1 id="home-title" className="mt-4 text-hero">
            Your own website, <span className="text-brand">Direct Bookings</span> Zero guest hassle.
          </h1>
          <p className="mt-5 max-w-lg text-lead text-body">
            Already on Airbnb? Get your own booking page in 5 minutes. Add your property details, AI writes the rest,
            and you get a link to share with guests on WhatsApp.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button href="/setup/account" size="lg">
              Create my free website
            </Button>
            <Button href="/how-it-works" size="lg" variant="outline" className="rounded-pill">
              See how it works
            </Button>
          </div>
          <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-caption text-body">
            {["Free to start", "1-click Airbnb import", "Instant UPI & payouts"].map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <Icon name="check" size={12} strokeWidth={3} className="text-primary" /> {item}
              </li>
            ))}
          </ul>
        </div>
        <HeroVisual />
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md pb-24 sm:pb-16" aria-hidden="true">
      <div className="overflow-hidden rounded-card bg-surface shadow-panel">
        <div className="flex items-center gap-3 border-b border-divider px-3 py-2">
          <span className="flex gap-1.5">
            <span className="size-2.5 rounded-pill bg-window-close" />
            <span className="size-2.5 rounded-pill bg-window-minimise" />
            <span className="size-2.5 rounded-pill bg-window-zoom" />
          </span>
          <span className="flex-1 truncate rounded-sm bg-surface-muted px-3 py-1 text-center text-caption font-semibold text-heading">
            stayowned.com/<span className="text-primary-strong">green-casa</span>
          </span>
        </div>
        <div className="relative aspect-photo">
          <Image
            src="/images/properties/green-casa/1.jpg"
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 28rem, 90vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-image-scrim via-image-scrim/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 text-on-dark">
            <p className="text-micro font-bold uppercase tracking-wider">
              <span className="text-rating">★</span> 4.96 · Entire luxury pool villa
            </p>
            <p className="font-heading text-stat">Green Casa Assagao</p>
            <p className="text-caption text-on-dark-muted">3 bedrooms · Assagao, North Goa</p>
          </div>
        </div>
        <div className="flex justify-end px-4 py-3">
          <span className="rounded-pill bg-primary px-4 py-1.5 text-caption font-semibold text-on-primary">
            Book direct
          </span>
        </div>
      </div>

      <div className="absolute -bottom-2 -left-4 w-56 rounded-card border-[6px] border-secondary-active bg-surface p-3 shadow-panel sm:-left-10">
        <p className="flex items-center gap-2 text-caption font-bold text-heading">
          <span className="grid size-5 place-items-center rounded-sm bg-secondary-active text-micro text-on-dark">
            G
          </span>
          Green Casa AI Host
        </p>
        <p className="mt-2 rounded-input bg-surface-muted px-3 py-2 text-micro text-heading">
          Is it free 12–15 Dec for 6 people? Can we bring our dog?
        </p>
        <p className="mt-2 rounded-input bg-secondary px-3 py-2 text-micro text-on-dark">
          Yes! 12–15 Dec is open for 6 guests, and pets are warmly welcome. Total is ₹25,500. Ready to book?
        </p>
      </div>

      <div className="absolute -right-2 bottom-20 w-40 rounded-input bg-surface p-3 shadow-card sm:-right-8 sm:bottom-12">
        <p className="text-caption font-bold text-heading">AI wrote your page</p>
        <p className="text-micro text-body">Description, highlights and FAQ</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ Stay types */

const STAY_TYPES = [
  {
    title: "Private and pool villas",
    text: "Show off the pool, rooms and sunsets.",
    image: "/images/properties/green-casa/2.jpg",
  },
  {
    title: "Homestays and farm stays",
    text: "Tell your family's story and share home-cooked food.",
    image: "/images/properties/tamarind-homestay/1.jpg",
  },
  {
    title: "Serviced apartments",
    text: "Long and short stays for city travellers.",
    image: "/images/properties/bandra-skyline-loft/1.jpg",
  },
  {
    title: "Resorts and holiday homes",
    text: "Multiple properties, one booking page.",
    image: "/images/properties/coral-bay-apartment/1.jpg",
  },
];

function StayTypes() {
  return (
    <section aria-labelledby="stay-types-title" className="container-page py-section">
      <SectionHeader
        id="stay-types-title"
        align="left"
        eyebrow="Made for hosts"
        title="Made for every kind of stay"
        description="Villas, homestays, apartments and holiday homes. One page each, ready in minutes."
      />
      <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STAY_TYPES.map((item, index) => (
          <li key={item.title} className="relative aspect-[4/3] overflow-hidden rounded-card shadow-card sm:aspect-[4/5]">
            <Image
              src={item.image}
              alt=""
              fill
              sizes="(min-width: 1024px) 18rem, (min-width: 640px) 45vw, 90vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-secondary-active via-secondary-active/40 to-transparent" />
            <span className="absolute left-4 top-4 text-caption font-bold text-on-dark">0{index + 1}</span>
            <div className="absolute inset-x-0 bottom-0 p-5 text-on-dark">
              <h3 className="font-heading text-title text-on-dark">{item.title}</h3>
              <p className="mt-1 text-caption text-on-dark-muted">{item.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ----------------------------------------------------------- 4 steps */

function HowSteps() {
  const steps: { title: string; text: string; visual: ReactNode }[] = [
    {
      title: "Sign up free",
      text: "Just your name, email and phone. No card needed.",
      visual: (
        <div className="grid gap-1.5 text-micro text-body">
          <span>Name</span>
          <span className="h-4 rounded-sm bg-surface" />
          <span>Email</span>
          <span className="h-4 rounded-sm bg-surface" />
          <span className="mt-1 rounded-sm bg-primary py-1 text-center font-semibold text-on-primary">
            Create account
          </span>
        </div>
      ),
    },
    {
      title: "Add your property",
      text: "Name, location, bedrooms, price and a few photos.",
      visual: (
        <div className="grid gap-2">
          <div className="rounded-sm bg-surface p-2">
            <p className="text-caption font-bold text-heading">Green Casa</p>
            <p className="mt-1 flex flex-wrap gap-1 text-micro text-heading">
              {["Villa", "Goa", "3 bd", "₹8,500"].map((tag) => (
                <span key={tag} className="rounded-pill bg-primary-soft px-1.5">
                  {tag}
                </span>
              ))}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <span className="h-6 rounded-sm bg-secondary" />
            <span className="h-6 rounded-sm bg-brand/80" />
            <span className="h-6 rounded-sm bg-primary-subtle" />
          </div>
        </div>
      ),
    },
    {
      title: "AI builds your page",
      text: "We write the description and highlights, and apply a free theme.",
      visual: (
        <div className="grid gap-2">
          <span className="w-fit rounded-pill bg-secondary px-2 py-0.5 text-micro font-semibold text-on-dark">
            ✦ AI is writing
          </span>
          <div className="grid gap-1 rounded-sm bg-surface p-2">
            <span className="h-1.5 w-3/4 rounded-pill bg-brand" />
            <span className="h-1.5 rounded-pill bg-surface-muted" />
            <span className="h-1.5 w-5/6 rounded-pill bg-surface-muted" />
          </div>
          <p className="flex gap-1.5 text-micro font-semibold">
            <span className="rounded-pill border border-primary-subtle px-2 text-primary-strong">Casa theme</span>
            <span className="rounded-pill border border-border bg-surface px-2 text-heading">Free</span>
          </p>
        </div>
      ),
    },
    {
      title: "Share and get booked",
      text: "Send your link on WhatsApp. Guests check dates, book and pay.",
      visual: (
        <div className="grid gap-1.5 text-micro">
          <span className="w-4/5 rounded-sm bg-surface px-2 py-1 text-heading">Is Green Casa free 12–15 Dec?</span>
          <span className="ml-auto w-4/5 rounded-sm bg-primary px-2 py-1 text-on-primary">
            Yes! Book here: stayowned.com/green-casa
          </span>
          <span className="w-fit rounded-pill bg-secondary px-2 py-0.5 font-semibold text-on-dark">
            ✓ Booked and paid
          </span>
        </div>
      ),
    },
  ];
  return (
    <section aria-labelledby="steps-title" className="container-page pb-section">
      <div className="rounded-panel bg-primary-tint px-5 py-12 sm:px-12 sm:py-16">
        <p className="flex items-center gap-2 text-small font-semibold text-primary-strong">
          <span className="h-px w-6 bg-current" aria-hidden="true" /> From listing to live
        </p>
        <h2 id="steps-title" className="mt-3 text-display">
          Live in 5 minutes. Here&apos;s how.
        </h2>
        <p className="mt-2 text-lead text-body">No code. No complicated setup. Just four straightforward steps.</p>

        <ol className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.title} className="flex flex-col">
              <div className="mb-4 flex items-center gap-3" aria-hidden="true">
                <span className="grid size-9 shrink-0 place-items-center rounded-sm bg-secondary text-caption font-bold text-on-dark">
                  0{index + 1}
                </span>
                {index < steps.length - 1 ? <span className="hidden h-0.5 flex-1 bg-brand lg:block" /> : null}
              </div>
              <div className="flex flex-1 flex-col rounded-card border border-border bg-surface p-4">
                <div className="rounded-input bg-primary-soft p-3" aria-hidden="true">
                  {step.visual}
                </div>
                <h3 className="mt-4 font-heading text-title">
                  <span className="sr-only">Step {index + 1}: </span>
                  {step.title}
                </h3>
                <p className="mt-1 text-small text-body">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button href="/setup/account" size="lg">
            Create free page
          </Button>
          <p className="text-small text-body">
            <strong className="text-heading">Free to start.</strong> No card needed.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------- Booking flow */

function BookingFlow() {
  const cards: { label: string; title: string; tone: "orange" | "navy"; visual: ReactNode }[] = [
    {
      label: "Guest discovers you",
      title: "Airbnb, Booking.com, Instagram & Google",
      tone: "orange",
      visual: (
        <div className="grid justify-items-center gap-2">
          <span className="flex w-full items-center gap-2 rounded-pill bg-surface px-3 py-1.5 text-caption text-body shadow-card">
            <Icon name="search" size={13} className="text-brand" /> Villa in North Goa
          </span>
          <span className="flex flex-wrap justify-center gap-1.5 text-micro font-semibold">
            <span className="rounded-pill border border-border bg-surface px-2 py-1 text-heading">• Airbnb</span>
            <span className="rounded-pill bg-secondary px-2 py-1 text-on-dark">• Booking.com</span>
            <span className="rounded-pill border border-border bg-surface px-2 py-1 text-heading">• Instagram</span>
            <span className="rounded-pill bg-primary px-2 py-1 text-on-primary">• Google</span>
          </span>
        </div>
      ),
    },
    {
      label: "Guest asks",
      title: "“Is it free next weekend?” on WhatsApp",
      tone: "orange",
      visual: (
        <div className="grid gap-2 text-caption">
          <span className="w-fit rounded-pill bg-surface px-2 py-0.5 text-micro font-semibold text-whatsapp">
            ● WhatsApp
          </span>
          <span className="w-fit rounded-input bg-surface px-3 py-1.5 text-heading shadow-card">
            Is it free next weekend?
          </span>
          <span className="ml-auto rounded-input bg-secondary px-3 py-2 text-on-dark">
            Yes! Book directly here:
            <span className="mt-1 block rounded-sm bg-white/10 px-2 py-0.5 text-micro">stayowned.com/green-casa</span>
          </span>
        </div>
      ),
    },
    {
      label: "Send your link",
      title: "They check dates, book & pay you directly",
      tone: "navy",
      visual: (
        <div className="relative rounded-input bg-surface p-3 shadow-card">
          <p className="flex justify-between text-caption font-bold text-heading">
            Green Casa <span className="text-primary-strong">₹8,500 / night</span>
          </p>
          <p className="mt-2 grid grid-cols-2 rounded-sm border border-border text-micro">
            <span className="border-r border-border p-1.5">
              <span className="block text-muted">CHECK-IN</span>
              <strong className="text-heading">12 Dec</strong>
            </span>
            <span className="p-1.5">
              <span className="block text-muted">CHECK-OUT</span>
              <strong className="text-heading">15 Dec</strong>
            </span>
          </p>
          <p className="mt-2 rounded-pill bg-primary py-1.5 text-center text-caption font-semibold text-on-primary">
            Pay ₹25,500 & book
          </p>
          <span className="absolute -bottom-2 -right-2 rounded-pill bg-success px-2 py-0.5 text-micro font-semibold text-white">
            ✓ Paid
          </span>
        </div>
      ),
    },
  ];
  return (
    <section aria-labelledby="flow-title" className="container-page py-section">
      <SectionHeader
        id="flow-title"
        eyebrow="Direct booking flow"
        eyebrowVariant="pill"
        title="They found your property. Make it seamless to book with you."
        description="Guests find you on Airbnb, Instagram or Google — then message you on WhatsApp. Send them your branded StayOwned website instead of sending them back to pay OTA fees."
      />
      <ol className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
        {cards.map((card, index) => (
          <li key={card.label} className="relative rounded-card border border-border bg-surface p-3 shadow-card">
            <div className="grid min-h-40 place-items-center rounded-input bg-primary-soft p-4" aria-hidden="true">
              {card.visual}
            </div>
            <p className="mt-4 flex items-center gap-2 px-1 text-caption font-bold uppercase tracking-wide text-primary-strong">
              <span
                className={cn(
                  "grid size-6 place-items-center rounded-sm text-micro text-on-dark",
                  card.tone === "navy" ? "bg-secondary" : "bg-primary",
                )}
              >
                0{index + 1}
              </span>
              {card.label}
            </p>
            <h3 className="mt-2 px-1 pb-3 font-heading text-title">{card.title}</h3>
            {index < cards.length - 1 ? (
              <span
                aria-hidden="true"
                className="absolute -right-4 top-24 z-10 hidden size-7 place-items-center rounded-pill border border-primary-subtle bg-surface text-brand md:grid"
              >
                <Icon name="arrowRight" size={14} />
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ----------------------------------------------------- Feature cards */

function FeatureCards() {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const direct = [12, 13, 14, 26, 27];
  const airbnb = [5, 6, 18, 19, 20];
  return (
    <section aria-label="Features" className="bg-primary-tint py-section">
      <div className="container-page grid grid-cols-1 gap-6 lg:grid-cols-2">
        <article className="overflow-hidden rounded-card border border-border bg-surface shadow-card">
          <div className="h-1.5 bg-linear-to-r from-primary to-brand" aria-hidden="true" />
          <div className="p-5 sm:p-8">
            <div className="grid place-items-center rounded-card bg-primary-soft p-6 sm:p-10" aria-hidden="true">
              <div className="relative w-full max-w-xs rounded-card bg-surface p-5 shadow-panel">
                <div className="absolute -right-6 -top-8 size-24 overflow-hidden rounded-input border-4 border-surface shadow-card">
                  <Image src="/images/properties/green-casa/1.jpg" alt="" fill sizes="6rem" className="object-cover" />
                </div>
                <p className="font-heading text-stat text-heading">
                  ₹8,500 <span className="font-body text-caption font-normal text-body">/ night</span>
                </p>
                <p className="mt-3 grid grid-cols-2 rounded-sm border border-border text-micro">
                  <span className="border-r border-border p-2">
                    <span className="block text-muted">CHECK-IN</span>
                    <strong className="text-heading">12 Dec 2026</strong>
                  </span>
                  <span className="p-2">
                    <span className="block text-muted">CHECK-OUT</span>
                    <strong className="text-heading">15 Dec 2026</strong>
                  </span>
                </p>
                <p className="mt-3 flex justify-between text-caption text-body">
                  ₹8,500 × 3 nights <strong className="text-heading">₹25,500</strong>
                </p>
                <p className="mt-3 rounded-input bg-primary py-2 text-center text-small font-semibold text-on-primary">
                  Pay ₹25,500 & Book direct
                </p>
                <p className="mt-3 flex justify-center gap-1.5 text-micro text-body">
                  {["UPI Instant", "Credit / Debit", "Net Banking"].map((item) => (
                    <span key={item} className="rounded-pill bg-surface-muted px-2 py-0.5">
                      {item}
                    </span>
                  ))}
                </p>
              </div>
            </div>
            <Badge variant="warning" className="mt-6">
              Zero commission
            </Badge>
            <h2 className="mt-3 font-heading text-section">
              Your property. Your website. <span className="block text-brand">Your direct checkout.</span>
            </h2>
            <p className="mt-3 text-small text-body">
              Paste your Airbnb link and AI builds your entire booking page: description, photo gallery and house rules.
              Guests check live availability, select dates and pay straight to your bank account with zero middleman
              commissions.
            </p>
            <ul className="mt-5 grid gap-3">
              <CheckItem>1-click import from any Airbnb listing</CheckItem>
              <CheckItem>AI writes engaging headlines &amp; descriptions</CheckItem>
              <CheckItem>Instant UPI, cards &amp; direct bank payouts</CheckItem>
            </ul>
            <Button href="/setup/account" size="lg" className="mt-7 rounded-pill">
              Create my free website <Icon name="arrowRight" size={16} />
            </Button>
          </div>
        </article>

        <article className="overflow-hidden rounded-card border border-border bg-surface shadow-card">
          <div className="h-1.5 bg-secondary" aria-hidden="true" />
          <div className="p-5 sm:p-8">
            <div
              className="grid place-items-center rounded-card border border-dashed border-border bg-surface-muted p-6 sm:p-10"
              aria-hidden="true"
            >
              <div className="w-full max-w-xs rounded-card bg-surface p-5 shadow-panel">
                <p className="flex items-center justify-between gap-2">
                  <span className="font-heading text-small font-bold text-heading">December 2026</span>
                  <span className="flex items-center gap-1 rounded-pill bg-surface-muted px-2 py-0.5 text-micro font-semibold text-heading">
                    <span className="size-1.5 rounded-pill bg-accent" /> Live Airbnb sync
                  </span>
                </p>
                <div className="mt-3 grid grid-cols-7 gap-1 text-center text-micro">
                  {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                    <span key={i} className="text-muted">
                      {d}
                    </span>
                  ))}
                  <span />
                  {days.map((day) => (
                    <span
                      key={day}
                      className={cn(
                        "grid aspect-square place-items-center rounded-sm",
                        direct.includes(day)
                          ? "bg-primary font-bold text-on-primary"
                          : airbnb.includes(day)
                            ? "bg-secondary font-bold text-on-dark"
                            : "bg-surface-muted text-heading",
                      )}
                    >
                      {day}
                    </span>
                  ))}
                </div>
                <p className="mt-3 flex justify-center gap-3 text-micro text-body">
                  <span className="flex items-center gap-1">
                    <span className="size-2 rounded-pill bg-primary" /> Direct booking
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="size-2 rounded-pill bg-secondary" /> Airbnb synced
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="size-2 rounded-pill bg-surface-muted" /> Available
                  </span>
                </p>
              </div>
            </div>
            <Badge variant="neutral" className="mt-6">
              Calendar sync
            </Badge>
            <h2 className="mt-3 font-heading text-section">One calendar, every booking in perfect view.</h2>
            <p className="mt-3 text-small text-body">
              Direct bookings and your existing Airbnb or Booking.com calendar stay synchronised. When a guest books on
              your website, those dates lock on Airbnb, so you never suffer an embarrassing double-booking.
            </p>
            <ul className="mt-5 grid gap-3">
              <NavyCheck>Sync calendar with Airbnb &amp; more</NavyCheck>
              <NavyCheck>Dates lock on both sides</NavyCheck>
              <NavyCheck>No more double bookings</NavyCheck>
            </ul>
            <Button href="/setup/account" size="lg" variant="secondary" className="mt-7 rounded-pill">
              Connect my calendar <Icon name="arrowRight" size={16} />
            </Button>
          </div>
        </article>
      </div>
    </section>
  );
}

function NavyCheck({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-small font-semibold text-heading">
      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-pill bg-surface-muted text-heading">
        <Icon name="check" size={12} strokeWidth={3} />
      </span>
      {children}
    </li>
  );
}

/* ------------------------------------------------------ AI assistant */

function AiAssistant() {
  return (
    <section aria-labelledby="ai-title" className="container-page py-section">
      <div className="relative grid grid-cols-1 items-center gap-10 overflow-hidden rounded-panel bg-secondary-active p-6 text-on-dark sm:p-12 lg:grid-cols-2">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 -top-40 size-[32rem] rounded-pill border-[3rem] border-white/5"
        />
        <div className="relative">
          <Badge variant="warning">Business AI feature</Badge>
          <h2 id="ai-title" className="mt-4 text-display text-on-dark">
            Let AI handle repetitive guest queries
          </h2>
          <p className="mt-4 max-w-md text-lead text-on-dark-muted">
            Parking rules, pet policies, early check-in, nearest beaches — your custom AI host answers instantly using
            your listing data. It checks live calendar rates and sends guests straight to checkout.
          </p>
          <Button href="/pricing" size="lg" className="mt-7 rounded-pill">
            Try the AI assistant
          </Button>
        </div>
        <div className="relative grid gap-3 text-small" aria-hidden="true">
          <p className="ml-auto max-w-xs rounded-input bg-white/15 px-4 py-3">
            What time is check-in? Is there parking for 2 cars?
          </p>
          <p className="max-w-xs rounded-input bg-primary px-4 py-3">
            Check-in is at 2:00 PM, and you have free dedicated private parking for up to 2 vehicles!
          </p>
          <p className="ml-auto max-w-xs rounded-input bg-white/15 px-4 py-3">
            Is 20–22 Dec available for a family trip?
          </p>
          <div className="max-w-xs rounded-input bg-primary px-4 py-3">
            Yes, both dates are completely open! 2 nights comes to ₹17,000 all-inclusive.
            <span className="mt-2 block w-fit rounded-pill bg-surface px-3 py-1 text-caption font-semibold text-primary-strong">
              Reserve Dec 20–22 →
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ Themes */

function Themes() {
  return (
    <section aria-labelledby="themes-title" className="bg-primary-tint py-section">
      <div className="container-page">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow className="mb-3">Look like you</Eyebrow>
            <h2 id="themes-title" className="max-w-sm text-display">
              Beautiful themes, built for stays
            </h2>
          </div>
          <p className="text-small text-body">Start with a free theme. Switch any time.</p>
        </div>
        <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {THEMES.map((theme) => {
            const free = theme.plan === "free";
            return (
              <li
                key={theme.id}
                className={cn(
                  "rounded-card border bg-surface p-3 shadow-card",
                  free ? "border-primary ring-1 ring-primary" : "border-border",
                )}
              >
                <ThemePreview theme={theme} propertyName="Green Casa" place="Assagao, North Goa" />
                <div className="mt-3 flex items-center justify-between gap-3 px-1 pb-1">
                  <div className="min-w-0">
                    <h3 className="flex items-center gap-2 font-heading text-small font-bold">
                      {theme.name}
                      <Badge variant={free ? "free" : "pro"}>{free ? "Free" : "Pro"}</Badge>
                    </h3>
                    <p className="truncate text-caption text-body">{theme.description}</p>
                  </div>
                  {free ? (
                    <span className="rounded-sm bg-primary px-3 py-1.5 text-caption font-semibold text-on-primary">
                      Free
                    </span>
                  ) : (
                    <Button href="/themes" size="sm" variant="secondary">
                      <Icon name="lock" size={13} /> Preview
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- Pricing */

function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      period: "",
      features: [
        "stayowned.com/your-property",
        "1 property listing · Clean theme",
        "AI-written description & highlights",
        "1 payment gateway (Razorpay / Stripe)",
        "Direct WhatsApp sharing bar",
        "0% platform commissions",
      ],
      cta: { label: "Start free", href: "/setup/account" },
      style: "plain" as const,
    },
    {
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
      cta: { label: "Go Pro — 14-day trial", href: "/pricing" },
      style: "popular" as const,
    },
    {
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
      style: "dark" as const,
    },
  ];
  return (
    <section aria-labelledby="pricing-title" className="container-page py-section">
      <SectionHeader
        id="pricing-title"
        eyebrow="No surprises"
        title="Simple pricing"
        description="Start free. Upgrade when you want your own domain."
      />
      <ul className="mx-auto mt-12 grid max-w-5xl grid-cols-1 items-start gap-6 lg:grid-cols-3">
        {plans.map((plan) => {
          const dark = plan.style === "dark";
          return (
            <li
              key={plan.name}
              className={cn(
                "relative flex h-full flex-col rounded-card p-7",
                plan.style === "plain" && "border border-border bg-surface",
                plan.style === "popular" && "border-2 border-primary bg-surface shadow-panel",
                dark && "bg-secondary-active text-on-dark",
              )}
            >
              {plan.style === "popular" ? (
                <span className="absolute -top-3 left-7 rounded-pill bg-primary px-3 py-1 text-micro font-bold uppercase text-on-primary">
                  Most popular
                </span>
              ) : null}
              <h3 className={cn("font-heading text-title", dark && "text-on-dark")}>{plan.name}</h3>
              <p className="mt-2">
                <span className={cn("font-heading text-display", dark ? "text-on-dark" : "text-heading")}>
                  {plan.price}
                </span>
                {plan.period ? (
                  <span className={cn("ml-1 text-small", dark ? "text-on-dark-muted" : "text-body")}>
                    {plan.period}
                  </span>
                ) : null}
              </p>
              <ul className="mt-6 grid flex-1 gap-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className={cn("flex items-start gap-2.5 text-small", dark ? "text-on-dark" : "text-heading")}
                  >
                    <Icon name="check" size={14} strokeWidth={2.5} className="mt-0.5 text-primary-on-dark" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                href={plan.cta.href}
                size="lg"
                fullWidth
                variant={plan.style === "popular" ? "primary" : "outline"}
                className="mt-8 rounded-pill"
              >
                {plan.cta.label}
              </Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
