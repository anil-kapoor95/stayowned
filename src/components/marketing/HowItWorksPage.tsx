import Image from "next/image";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GoogleMark, Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { FaqAccordion } from "./FaqAccordion";
import { HOME_FAQS } from "./faq-data";
import { CheckItem, CtaBanner, Eyebrow, SectionHeader } from "./ui";

/** "How it works" page from the Figma frame of the same name. */
export function HowItWorksPage() {
  return (
    <>
      <Hero />
      <Preparation />
      <BigSteps />
      <NextSteps />
      <WhyDirect />
      <GuestExperience />
      <Plans />
      <section aria-labelledby="hiw-faq-title" className="py-section">
        <div className="container-page">
          <SectionHeader id="hiw-faq-title" eyebrow="Good to know" title="Frequently asked questions" />
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

const BREAKDOWN = [
  { label: "Sign up free", time: "About 1 minute", minutes: 1, swatch: "bg-primary", stroke: "stroke-primary" },
  {
    label: "Add your property",
    time: "About 2 minutes",
    minutes: 2,
    swatch: "bg-primary-subtle",
    stroke: "stroke-primary-subtle",
  },
  {
    label: "AI builds your page",
    time: "About 1 minute",
    minutes: 1,
    swatch: "bg-secondary",
    stroke: "stroke-secondary",
  },
  { label: "Share & get booked", time: "About 1 minute", minutes: 1, swatch: "bg-heading", stroke: "stroke-heading" },
];

function Donut() {
  const r = 52;
  const c = 2 * Math.PI * r;
  const total = BREAKDOWN.reduce((sum, item) => sum + item.minutes, 0);
  const segments = BREAKDOWN.map((item, index) => {
    const before = BREAKDOWN.slice(0, index).reduce((sum, prev) => sum + prev.minutes, 0);
    return { ...item, length: (item.minutes / total) * c, offset: (before / total) * c };
  });
  return (
    <div className="relative size-40 shrink-0">
      <svg viewBox="0 0 140 140" className="size-full -rotate-90" aria-hidden="true">
        {segments.map((item) => (
          <circle
            key={item.label}
            cx="70"
            cy="70"
            r={r}
            fill="none"
            strokeWidth="18"
            className={item.stroke}
            strokeDasharray={`${item.length - 3} ${c - item.length + 3}`}
            strokeDashoffset={-item.offset}
          />
        ))}
      </svg>
      <p className="absolute inset-0 grid place-content-center text-center">
        <span className="font-heading text-stat text-heading">5</span>
        <span className="text-caption text-body">minutes</span>
      </p>
    </div>
  );
}

function Hero() {
  return (
    <section
      aria-labelledby="hiw-title"
      className="relative overflow-hidden bg-linear-to-br from-primary-soft via-primary-tint to-surface"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-10 size-[38rem] rounded-pill border border-primary-subtle/70"
      />
      <div className="container-page relative grid grid-cols-1 items-center gap-12 py-14 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)]">
        <div className="min-w-0">
          <Eyebrow variant="pill">How it works</Eyebrow>
          <h1 id="hiw-title" className="mt-5 text-hero">
            Live in 5 minutes. <span className="block text-brand">Here&apos;s how.</span>
          </h1>
          <p className="mt-5 max-w-lg text-lead text-body">
            No code. No complicated setup. Just four straightforward steps from listing to your own branded direct
            booking page.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button href="/setup/account" size="lg">
              Create my free website <Icon name="arrowRight" size={16} />
            </Button>
            <Button href="/properties" size="lg" variant="outline">
              See an example
            </Button>
          </div>
          <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-caption text-body">
            {["Free starter plan", "No credit card needed", "0% commission"].map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <Icon name="check" size={12} strokeWidth={3} className="text-primary" /> {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-card border border-border bg-surface p-6 shadow-panel">
          <div className="flex items-center justify-between gap-3">
            <p className="text-caption font-bold uppercase tracking-wider text-heading">Setup breakdown</p>
            <Badge variant="warning">5 min total</Badge>
          </div>
          <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row">
            <Donut />
            <ul className="grid w-full gap-3">
              {BREAKDOWN.map((item) => (
                <li key={item.label} className="flex items-start gap-3">
                  <span className={cn("mt-1 size-3 shrink-0 rounded-sm", item.swatch)} aria-hidden="true" />
                  <span>
                    <span className="block text-small font-semibold text-heading">{item.label}</span>
                    <span className="block text-caption text-body">{item.time}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- Preparation */

const PREPARATION = [
  {
    title: "Your property details",
    text: "Name, location, bedrooms and price. Or just your Airbnb listing link for 1-click import.",
  },
  {
    title: "A few photos",
    text: "The pool, the bedrooms, the view. You can add more photos anytime from your dashboard.",
  },
  {
    title: "Your WhatsApp number",
    text: "So guests can reach you directly, check dates, and receive your direct booking link.",
  },
  {
    title: "A payment account",
    text: "Needed to accept direct UPI and card bookings. You can connect it right after your page is live.",
  },
];

function Preparation() {
  return (
    <section aria-labelledby="prep-title" className="container-page py-section">
      <SectionHeader
        id="prep-title"
        eyebrow="Preparation"
        eyebrowVariant="lines"
        title="Before you start"
        description="Have these ready and you'll be done in minutes."
      />
      <ol className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PREPARATION.map((item, index) => (
          <li key={item.title} className="rounded-card bg-surface-muted p-6">
            <span
              className="grid size-10 place-items-center rounded-sm bg-secondary font-heading text-small font-bold text-on-dark"
              aria-hidden="true"
            >
              {index + 1}
            </span>
            <h3 className="mt-5 font-heading text-title">{item.title}</h3>
            <p className="mt-2 text-small text-body">{item.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ------------------------------------------------------------- Big steps */

function MockField({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn("block rounded-sm border border-border bg-surface px-3 py-2 text-caption text-heading", className)}
    >
      {children}
    </span>
  );
}

const BIG_STEPS: {
  title: string;
  text: string;
  tone: "light" | "lavender" | "navy";
  visual: ReactNode;
}[] = [
  {
    title: "Sign up free",
    text: "Just your name, email and phone. No card needed.",
    tone: "light",
    visual: (
      <div className="grid gap-2.5 rounded-input bg-surface p-5 shadow-card">
        <p className="font-heading text-small font-bold text-heading">Create your free account</p>
        <span className="flex items-center justify-center gap-2 rounded-sm border border-border py-2 text-caption font-semibold text-heading">
          <GoogleMark size={14} /> Continue with Google
        </span>
        <MockField>Rahul Desai</MockField>
        <MockField>+91 98765 43210</MockField>
        <span className="rounded-sm bg-primary py-2 text-center text-caption font-semibold text-on-primary">
          Create account and add my property
        </span>
      </div>
    ),
  },
  {
    title: "Add your property",
    text: "Name, location, bedrooms, price and a few photos. Or paste your Airbnb link and import it in one click.",
    tone: "light",
    visual: (
      <div className="grid gap-3 rounded-input bg-surface p-5 shadow-card">
        <p className="font-heading text-small font-bold text-heading">Import from Airbnb</p>
        <span className="flex gap-2">
          <MockField className="flex-1 truncate text-muted">airbnb.com/rooms/…</MockField>
          <span className="grid place-items-center rounded-sm bg-secondary px-3 text-caption font-semibold text-on-dark">
            Import
          </span>
        </span>
        <span className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((n) => (
            <span key={n} className="relative aspect-thumb overflow-hidden rounded-sm">
              <Image src={`/images/properties/green-casa/${n}.jpg`} alt="" fill sizes="6rem" className="object-cover" />
            </span>
          ))}
        </span>
        <span className="flex items-end justify-between gap-2">
          <span>
            <span className="block text-small font-bold text-heading">Green Casa</span>
            <span className="block text-micro text-body">3 bedrooms · 8 guests</span>
          </span>
          <span className="text-caption font-bold text-primary-strong">₹8,500 / night</span>
        </span>
      </div>
    ),
  },
  {
    title: "AI builds your page",
    text: "We write the description and highlights, and apply a free theme.",
    tone: "lavender",
    visual: (
      <div className="grid gap-3">
        <div className="rounded-input bg-surface p-4 shadow-card">
          <p className="text-micro font-bold uppercase tracking-wider text-muted">Your details</p>
          <p className="mt-2 flex flex-wrap gap-1.5 text-caption text-heading">
            {["Villa · Assagao", "3 beds · pool", "Wi-Fi · AC"].map((tag) => (
              <span key={tag} className="rounded-pill bg-surface-muted px-2 py-0.5">
                {tag}
              </span>
            ))}
          </p>
        </div>
        <span className="mx-auto grid size-9 place-items-center rounded-pill bg-secondary text-on-dark">
          <Icon name="sparkles" size={16} />
        </span>
        <div className="rounded-input bg-surface p-4 shadow-card">
          <p className="font-heading text-small font-bold text-heading">
            Your private pool villa, minutes from Vagator
          </p>
          <span className="mt-2 block h-1.5 rounded-pill bg-surface-muted" />
          <span className="mt-1.5 block h-1.5 w-4/5 rounded-pill bg-surface-muted" />
        </div>
      </div>
    ),
  },
  {
    title: "Share and get booked",
    text: "Send your link by WhatsApp or Instagram. Guests check dates, book and pay straight to your bank account.",
    tone: "navy",
    visual: (
      <div className="grid gap-2.5 text-caption">
        <span className="ml-auto max-w-[85%] rounded-input bg-whatsapp px-3 py-2 text-white">
          Hi! Here&apos;s our villa, book direct and skip the commission:{" "}
          <span className="font-semibold underline">stayowned.com/green-casa</span>
        </span>
        <span className="max-w-[80%] rounded-input bg-surface px-3 py-2 text-heading">
          Dates look free. Booking now!
        </span>
        <span className="flex items-center gap-2 rounded-input bg-surface px-3 py-2 text-heading">
          <span className="grid size-6 shrink-0 place-items-center rounded-pill bg-success text-white">
            <Icon name="check" size={12} strokeWidth={3} />
          </span>
          <span>
            <strong className="block">New booking · 3 nights</strong>
            <span className="text-micro text-body">₹25,500 paid by UPI</span>
          </span>
        </span>
      </div>
    ),
  },
];

function BigSteps() {
  return (
    <section aria-labelledby="big-steps-title" className="bg-primary-tint py-section">
      <div className="container-page">
        <SectionHeader
          id="big-steps-title"
          eyebrow="Step by step"
          eyebrowVariant="lines"
          title="Four steps to your own booking page"
        />
        <ol className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {BIG_STEPS.map((step, index) => {
            const navy = step.tone === "navy";
            return (
              <li
                key={step.title}
                className={cn(
                  "grid gap-6 rounded-panel p-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:p-8",
                  navy
                    ? "bg-secondary-active text-on-dark"
                    : step.tone === "lavender"
                      ? "bg-surface-muted"
                      : "bg-surface shadow-card",
                )}
              >
                <div>
                  <span
                    className={cn(
                      "grid size-11 place-items-center rounded-sm font-heading text-small font-bold",
                      navy ? "bg-primary text-on-primary" : "bg-secondary text-on-dark",
                    )}
                    aria-hidden="true"
                  >
                    0{index + 1}
                  </span>
                  <h3 className={cn("mt-5 font-heading text-section", navy && "text-on-dark")}>
                    <span className="sr-only">Step {index + 1}: </span>
                    {step.title}
                  </h3>
                  <p className={cn("mt-2 text-small", navy ? "text-on-dark-muted" : "text-body")}>{step.text}</p>
                </div>
                <div
                  className={cn("self-center rounded-card p-4", navy ? "bg-white/5" : "bg-primary-soft")}
                  aria-hidden="true"
                >
                  {step.visual}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ Next steps */

const NEXT = [
  {
    title: "Set up payments",
    badge: <Badge variant="warning">Needed</Badge>,
    icon: "lock" as const,
    text: "Connect Razorpay to get paid by UPI, cards and net banking. Money goes straight to your account.",
    pro: false,
  },
  {
    title: "Connect your Airbnb calendar",
    badge: null,
    icon: "calendar" as const,
    text: "Dates booked on Airbnb get blocked here automatically, so you don't get double bookings.",
    pro: false,
  },
  {
    title: "Use your own domain",
    badge: <Badge variant="pro">Pro</Badge>,
    icon: "link" as const,
    text: "Turn stayowned.com/green-casa into www.greencasa.com and unlock all premium themes.",
    pro: true,
  },
];

function NextSteps() {
  return (
    <section aria-labelledby="next-title" className="container-page py-section">
      <SectionHeader
        id="next-title"
        eyebrow="Next"
        eyebrowVariant="lines"
        title="Next: start taking bookings"
        description="Your page is live. Finish these when you're ready, any time from your dashboard."
      />
      <ul className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
        {NEXT.map((item) => (
          <li
            key={item.title}
            className={cn(
              "rounded-card border bg-surface p-6 shadow-card",
              item.pro ? "border-2 border-brand" : "border-border",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <span
                className="grid size-11 place-items-center rounded-input bg-primary-soft text-primary-strong"
                aria-hidden="true"
              >
                <Icon name={item.icon} size={20} />
              </span>
              {item.badge}
            </div>
            <h3 className="mt-5 font-heading text-title">{item.title}</h3>
            <p className="mt-2 text-small text-body">{item.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------ Why direct */

function WhyDirect() {
  const marketplace = [
    "A commission on every booking",
    "Your listing sits beside your competitors",
    "The platform sets the rules and the fees",
    "Guests find the platform, not your brand",
  ];
  const stayowned = [
    "0% commission on direct bookings",
    "Guests pay straight to your bank account",
    "Your own page and a link you can share anywhere",
    "Your Airbnb calendar kept in sync",
  ];
  return (
    <section aria-labelledby="why-title" className="bg-secondary-active py-section">
      <div className="container-page">
        <SectionHeader
          id="why-title"
          eyebrow="Why go direct"
          eyebrowVariant="lines"
          onDark
          title="Keep what you earn"
        />
        <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-5 md:grid-cols-2">
          <div className="rounded-card bg-surface p-7">
            <p className="text-caption font-bold uppercase tracking-wider text-muted">On a booking marketplace</p>
            <ul className="mt-5 grid gap-3">
              {marketplace.map((item) => (
                <li key={item} className="flex items-start gap-3 text-small font-semibold text-heading">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-pill bg-surface-muted text-body">
                    <Icon name="x" size={12} strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-card bg-primary-soft p-7">
            <p className="text-caption font-bold uppercase tracking-wider text-primary-strong">With StayOwned</p>
            <ul className="mt-5 grid gap-3">
              {stayowned.map((item) => (
                <CheckItem key={item}>{item}</CheckItem>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------ Guest experience */

const GUEST_STEPS = [
  { title: "Guest opens your link", text: "On WhatsApp, Instagram, Google or anywhere you share it." },
  { title: "Checks availability", text: "With your calendar connected, dates booked on Airbnb are already blocked." },
  { title: "Books and pays online", text: "By UPI, card or net banking, paid straight to your account." },
  { title: "Booking lands in dashboard", text: "It appears automatically in your dashboard and your synced calendar." },
  { title: "You get a booking email", text: "A basic email notification tells you about each new booking instantly." },
];

function GuestExperience() {
  return (
    <section aria-labelledby="guest-title" className="container-page py-section">
      <SectionHeader
        id="guest-title"
        eyebrow="The guest experience"
        eyebrowVariant="lines"
        title="What happens when a guest books"
        description="From your link to your calendar, with no back-and-forth."
      />
      <ol className="relative mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-5">
        <span
          aria-hidden="true"
          className="absolute left-[10%] right-[10%] top-6 hidden h-0.5 bg-primary-subtle lg:block"
        />
        {GUEST_STEPS.map((step, index) => (
          <li key={step.title} className="relative text-center">
            <span
              className={cn(
                "mx-auto grid size-12 place-items-center rounded-pill font-heading text-small font-bold ring-8 ring-surface",
                index === GUEST_STEPS.length - 1 ? "bg-secondary text-on-dark" : "bg-primary text-on-primary",
              )}
              aria-hidden="true"
            >
              {index + 1}
            </span>
            <h3 className="mt-5 font-heading text-title">{step.title}</h3>
            <p className="mt-2 text-small text-body">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ------------------------------------------------------------------ Plans */

function Plans() {
  return (
    <section aria-labelledby="plans-title" className="bg-primary-tint py-section">
      <div className="container-page">
        <SectionHeader
          id="plans-title"
          eyebrow="Plans"
          eyebrowVariant="lines"
          title="Start free. Upgrade when you grow."
        />
        <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-5 md:grid-cols-2">
          <div className="flex flex-col rounded-card border border-border bg-surface p-7 shadow-card">
            <Badge variant="free" className="w-fit">
              Free
            </Badge>
            <h3 className="mt-4 font-heading text-section">Everything to go live</h3>
            <ul className="mt-6 grid flex-1 content-start gap-3">
              <CheckItem>Live booking page with an AI-written description</CheckItem>
              <CheckItem>1 payment gateway (Razorpay for India)</CheckItem>
              <CheckItem>1 Airbnb calendar sync</CheckItem>
              <CheckItem>A free theme</CheckItem>
            </ul>
            <Button href="/setup/account" variant="outline" fullWidth className="mt-8">
              Start free
            </Button>
          </div>
          <div className="flex flex-col rounded-card bg-secondary-active p-7 text-on-dark shadow-panel">
            <p className="flex w-fit items-center gap-1.5 rounded-pill bg-primary px-3 py-1 text-caption font-bold uppercase tracking-wider text-on-primary">
              Pro <Icon name="lock" size={12} />
            </p>
            <h3 className="mt-4 font-heading text-section text-on-dark">Grow beyond one listing</h3>
            <ul className="mt-6 grid flex-1 content-start gap-3">
              <CheckItem onDark>Everything in Free</CheckItem>
              <CheckItem onDark>More gateways: Stripe, PayPal, Cashfree, PayU</CheckItem>
              <CheckItem onDark>More calendars with Airbnb and Booking.com</CheckItem>
              <CheckItem onDark>Your own domain with free SSL</CheckItem>
              <CheckItem onDark>4 premium designer themes</CheckItem>
            </ul>
            <Button href="/pricing" fullWidth className="mt-8">
              See Pro <Icon name="arrowRight" size={16} />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
