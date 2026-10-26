"use client";

import Link from "next/link";

import { useState, type ReactNode } from "react";
import { Badge, Tag } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Card";
import { Icon, WhatsAppMark } from "@/components/ui/Icon";
import { bookingLinkHost } from "@/config/site";
import { cn } from "@/lib/utils";
import { draftToProperty } from "../draft-to-property";
import { useDraft } from "../draft-store";
import { useSignupSession } from "../signup-session";
import { PREVIEW_HREF } from "../steps";
import { LivePreviewCard } from "../components/LivePreviewCard";
import { PaymentGatewayDialog } from "../components/PaymentGatewayDialog";
import {
  GATEWAY_CONFIGS,
  emptyGatewaySettings,
  type GatewayId,
  type GatewaySettings,
} from "../payment-gateways";

const GATEWAYS: readonly {
  name: string;
  initial: string;
  tone: string;
  text: string;
  /** Gateways with a connection popup. */
  connect?: GatewayId;
}[] = [
  { connect: "stripe", name: "Stripe", initial: "S", tone: "bg-brand-stripe", text: "International cards, Apple Pay & 135+ currencies" },
  { name: "PayPal", initial: "P", tone: "bg-brand-paypal", text: "Trusted by global travelers worldwide" },
  { name: "Cashfree", initial: "C", tone: "bg-brand-cashfree", text: "UPI, cards, and instant settlement" },
  { name: "PayU", initial: "U", tone: "bg-brand-payu", text: "UPI, cards, EMI & PayLater options" },
];

export function LiveStep() {
  const draft = useDraft();
  const { state } = useSignupSession();
  const loginUrl = state?.login_url;
  // Companies added in the back office may not have a property yet.
  const hasProperty = Boolean(state?.property);
  const property = draftToProperty(draft);
  const slug = property.slug || "your-page";
  const link = `${bookingLinkHost}/${slug}`;
  const [copied, setCopied] = useState(false);
  const [demoMessage, setDemoMessage] = useState<string | null>(null);
  const [openGateway, setOpenGateway] = useState<GatewayId | null>(null);
  // Kept in memory only for this visit; never stored or sent anywhere.
  const [gatewaySettings, setGatewaySettings] = useState<Record<GatewayId, GatewaySettings>>(() => ({
    razorpay: emptyGatewaySettings(GATEWAY_CONFIGS.razorpay),
    stripe: emptyGatewaySettings(GATEWAY_CONFIGS.stripe),
  }));
  const [savedGateways, setSavedGateways] = useState<GatewayId[]>([]);

  function saveGateway(id: GatewayId, settings: GatewaySettings) {
    const name = GATEWAY_CONFIGS[id].name;
    setGatewaySettings((current) => ({ ...current, [id]: settings }));
    setSavedGateways((current) => (current.includes(id) ? current : [...current, id]));
    setOpenGateway(null);
    setDemoMessage(
      settings.enabled
        ? `Your ${name} details look right${settings.testMode ? " (test mode)" : ""}. Connecting needs the StayOwned backend, which isn't part of this static demo, so nothing was sent to ${name}.`
        : `${name} payments are switched off. Nothing was sent to ${name}.`,
    );
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`https://${link}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setDemoMessage("Your browser blocked clipboard access — select the link and copy it manually.");
    }
  }

  const whatsappText = encodeURIComponent(`Book ${property.name} directly here: https://${link}`);

  return (
    <div className="container-page py-8 sm:py-10">
      {hasProperty ? (
        <section
          aria-labelledby="live-title"
          className="panel-gradient grid grid-cols-1 gap-8 overflow-hidden rounded-panel p-6 text-on-dark shadow-panel sm:p-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-center lg:p-14"
        >
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-pill border border-accent/40 bg-accent/10 px-3 py-1 text-caption font-bold uppercase tracking-wide text-accent">
              <span className="size-2 rounded-pill bg-accent" aria-hidden="true" />
              {draft.published ? "Published & accepting bookings" : "Preview — not published yet"}
            </p>
            <h1 id="live-title" className="mt-5 text-hero text-on-dark">
              {property.name} is{" "}
              <span className="text-brand underline decoration-wavy decoration-from-font underline-offset-8">
                {draft.published ? "live" : "ready"}
              </span>
              .
            </h1>
            {state?.theme_applied === false ? (
              <p className="mt-3 text-small text-on-dark-muted">Your plan uses the default theme for now.</p>
            ) : null}
            <p className="mt-4 max-w-xl text-lead text-on-dark-muted">
              Your page is ready to share. Send your direct link to guests messaging you on WhatsApp or Instagram to skip
              OTA commissions.
            </p>

            <div className="mt-7 flex max-w-xl items-center gap-3 rounded-input border border-white/15 bg-white/5 p-2 pl-4">
              <Icon name="link" size={18} className="shrink-0 text-primary" />
              <span className="min-w-0 flex-1 truncate font-semibold" id="page-link">
                {link}
              </span>
              <Button
                variant="outline"
                size="md"
                onClick={copyLink}
                aria-describedby="page-link"
                className="border-transparent"
              >
                <Icon name={copied ? "check" : "copy"} size={16} />
                {copied ? "Copied" : "Copy link"}
              </Button>
            </div>
            <p className="sr-only" aria-live="polite">
              {copied ? "Link copied to clipboard" : ""}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button variant="whatsapp" size="lg" href={`https://wa.me/?text=${whatsappText}`} external>
                <WhatsAppMark /> Share on WhatsApp
                <span className="sr-only"> (opens in a new tab)</span>
              </Button>
              <Button variant="onDark" size="lg" href={PREVIEW_HREF}>
                <Icon name="externalLink" size={17} /> View my page
              </Button>
              {loginUrl ? (
                <a
                  href={loginUrl}
                  className="rounded-sm font-semibold text-on-dark-muted underline underline-offset-4 hover:text-on-dark focus-visible:outline-none focus-visible:focus-ring"
                >
                  Edit page
                  <span className="sr-only"> in your dashboard</span>
                </a>
              ) : null}
            </div>
          </div>

          <div className="mx-auto w-full max-w-80 rounded-device border-10 border-secondary-active bg-secondary-active shadow-panel">
            <div className="overflow-hidden rounded-device-screen">
              <LivePreviewCard property={property} variant="phone" />
            </div>
          </div>
        </section>
      ) : (
        <NoPropertyHero companyName={state?.company?.name || state?.account.name || "Your account"} loginUrl={loginUrl} />
      )}

      {demoMessage ? (
        <Notice tone="info" role="status" className="mt-6" title="Demo mode">
          {demoMessage}
        </Notice>
      ) : null}

      {(Object.keys(GATEWAY_CONFIGS) as GatewayId[]).map((id) => (
        <PaymentGatewayDialog
          key={id}
          config={GATEWAY_CONFIGS[id]}
          open={openGateway === id}
          initial={gatewaySettings[id]}
          onClose={() => setOpenGateway(null)}
          onSave={(settings) => saveGateway(id, settings)}
        />
      ))}

      <div className="mt-10 grid grid-cols-1 items-start gap-7 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <section aria-labelledby="checklist-title">
          <p className="text-eyebrow uppercase text-primary">Checklist to launch</p>
          <h2 id="checklist-title" className="mt-1 text-section">
            Next: start taking direct bookings
          </h2>

          <ol className="mt-6 grid gap-5">
            <li className="rounded-card border-2 border-primary bg-primary-tint p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <StepNumber n={1} solid />
                <div className="flex-1">
                  <h3 className="flex flex-wrap items-center gap-2 font-heading text-title">
                    Set up payments <Badge variant="warning">Needed to accept bookings</Badge>
                  </h3>
                  <p className="mt-1 text-small text-body-strong">
                    Connect Razorpay to get paid instantly by UPI (Google Pay, PhonePe), credit/debit cards, and net
                    banking.
                  </p>
                </div>
                <Button size="lg" aria-haspopup="dialog" onClick={() => setOpenGateway("razorpay")}>
                  {savedGateways.includes("razorpay") ? "Edit Razorpay" : "Connect Razorpay"}{" "}
                  <Icon name="arrowRight" size={16} />
                </Button>
              </div>
            </li>

            <li
              className="list-none rounded-card border border-border bg-card p-5 shadow-card sm:p-7"
              aria-label="More gateways on Pro"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-heading text-title">More Gateways on pro</h3>
                <Link
                  href="/pricing"
                  className="flex items-center gap-1.5 rounded-sm text-small font-semibold text-heading hover:text-link-hover focus-visible:outline-none focus-visible:focus-ring"
                >
                  <Icon name="lock" size={14} /> Upgrade for international payments
                </Link>
              </div>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {GATEWAYS.map((gateway) => {
                  const content = (
                    <>
                      <span
                        className={cn(
                          "grid size-9 shrink-0 place-items-center rounded-sm font-bold text-white",
                          gateway.tone,
                        )}
                      >
                        {gateway.initial}
                      </span>
                      <div>
                        <p className="flex items-center gap-2 font-semibold text-heading">
                          {gateway.name} <Badge variant="pro">Pro</Badge>
                        </p>
                        <p className="mt-0.5 text-caption text-body">{gateway.text}</p>
                      </div>
                    </>
                  );
                  const connect = gateway.connect;
                  return (
                    <li key={gateway.name}>
                      {connect ? (
                        <button
                          type="button"
                          aria-haspopup="dialog"
                          onClick={() => setOpenGateway(connect)}
                          className="flex h-full w-full gap-3 rounded-input border border-border bg-background p-4 text-left transition-colors hover:border-border-strong focus-visible:outline-none focus-visible:focus-ring"
                        >
                          {content}
                          <span className="sr-only">: open {gateway.name} connection settings</span>
                        </button>
                      ) : (
                        <div className="flex h-full gap-3 rounded-input border border-border bg-background p-4">{content}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </li>

            <li className="rounded-card border border-border bg-card p-5 shadow-card sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <StepNumber n={2} />
                <div className="flex-1">
                  <h3 className="flex flex-wrap items-center gap-2 font-heading text-title">
                    Connect your Airbnb calendar <Tag>Recommended</Tag>
                  </h3>
                  <p className="mt-1 text-small text-body">
                    Dates booked on Airbnb get blocked here automatically, and direct bookings block your Airbnb
                    calendar so you never get double bookings.
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-caption text-body">
                      <span className="h-1.5 w-28 rounded-pill bg-primary-strong" aria-hidden="true" />
                      <span>
                        <strong className="text-heading">1 of 1</strong> calendar included in your plan
                      </span>
                    </div>
                    <Link
                      href="/pricing"
                      className="flex items-center gap-1.5 rounded-sm text-caption font-semibold text-heading underline underline-offset-2 hover:text-link-hover"
                    >
                      <Icon name="lock" size={12} /> Add more calendars with Pro
                    </Link>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() =>
                    setDemoMessage(
                      "Calendar sync needs the StayOwned backend, which isn't part of this static demo. Nothing was synced.",
                    )
                  }
                >
                  <Icon name="calendar" size={16} /> Sync Calendar
                </Button>
              </div>
            </li>

            <li
              className="list-none rounded-card border border-primary-subtle bg-warning-soft p-5 sm:p-6"
              aria-label="Custom domain"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <h3 className="flex items-center gap-2 font-heading text-title">
                    <Badge variant="solid">Pro</Badge> Use your own custom domain
                  </h3>
                  <p className="mt-1 text-small text-body-strong">
                    Upgrade <code className="rounded-sm bg-surface px-1.5 py-0.5 text-caption">{link}</code> into{" "}
                    <strong className="text-heading">www.{slug.replace(/-/g, "")}.com</strong> with free SSL
                    and unlock all 4 premium designer themes (Luxe, Homestay, Urban, Coastal).
                  </p>
                </div>
                <Button href="/pricing" variant="outline" className="border-primary-subtle">
                  Upgrade to Pro <Icon name="arrowRight" size={16} />
                </Button>
              </div>
            </li>
          </ol>
        </section>

        <aside className="grid gap-5" aria-label="Help">
          <SideCard title="How it works">
            <ol className="grid gap-4">
              {[
                ["Click Connect", "and sign in to your Razorpay account (or create one in 2 minutes)."],
                ["Guests pay directly", "on your branded StayOwned website via UPI or card."],
                [
                  "Direct deposit",
                  ": Payments settle straight into your verified bank account with 0% StayOwned commission.",
                ],
              ].map(([strong, rest], index) => (
                <li key={strong} className="flex gap-3 text-small text-body">
                  <span className="grid size-6 shrink-0 place-items-center rounded-pill bg-primary-soft text-caption font-bold text-primary-strong">
                    {index + 1}
                  </span>
                  <p>
                    <strong className="text-heading">{strong}</strong>
                    {rest.startsWith(":") ? rest : ` ${rest}`}
                  </p>
                </li>
              ))}
            </ol>
          </SideCard>
          <SideCard title="Need help setting up?">
            <p className="text-small text-body">
              Our onboarding team can walk you through API keys or account setup directly on WhatsApp.
            </p>
            <Button href="/contact" variant="outline" fullWidth className="mt-4">
              <WhatsAppMark size={16} /> Chat with us on WhatsApp
            </Button>
          </SideCard>
        </aside>
      </div>
    </div>
  );
}

function StepNumber({ n, solid = false }: { n: number; solid?: boolean }) {
  return (
    <span
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-pill font-heading text-title",
        solid ? "bg-primary text-on-primary" : "border border-border bg-surface text-heading",
      )}
      aria-hidden="true"
    >
      {n}
    </span>
  );
}

function SideCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-card border border-border bg-card p-5 shadow-card sm:p-6">
      <h2 className="mb-4 font-body text-caption font-bold uppercase tracking-wider text-muted">{title}</h2>
      {children}
    </section>
  );
}

/** Hero for a company without a property (added in the back office): no page or link to share yet. */
function NoPropertyHero({ companyName, loginUrl }: { companyName: string; loginUrl?: string }) {
  return (
    <section
      aria-labelledby="live-title"
      className="panel-gradient overflow-hidden rounded-panel p-6 text-on-dark shadow-panel sm:p-10 lg:p-14"
    >
      <p className="inline-flex items-center gap-2 rounded-pill border border-white/20 bg-white/5 px-3 py-1 text-caption font-bold uppercase tracking-wide text-on-dark-muted">
        <span className="size-2 rounded-pill bg-primary" aria-hidden="true" />
        No property yet
      </p>
      <h1 id="live-title" className="mt-5 text-hero text-on-dark">
        Welcome, {companyName}.
      </h1>
      <p className="mt-4 max-w-2xl text-lead text-on-dark-muted">
        Your account is ready. Add your first property in your dashboard — with its photos and price — to get your
        booking page and a direct link to share with guests.
      </p>
      {loginUrl ? (
        <div className="mt-7">
          <Button href={loginUrl} size="lg" external>
            <Icon name="plus" size={18} /> Add a property in the dashboard
            <span className="sr-only"> (opens in a new tab)</span>
          </Button>
        </div>
      ) : null}
    </section>
  );
}
