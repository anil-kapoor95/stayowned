"use client";

import Link from "next/link";

import { useEffect, useState, type ReactNode } from "react";
import { Badge, Tag } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Card";
import { Icon, WhatsAppMark } from "@/components/ui/Icon";
import { bookingLinkHost } from "@/config/site";
import { signupApi, type PaymentMethodState } from "@/lib/api/signup";
import { cn, slugify } from "@/lib/utils";
import { draftToProperty } from "../draft-to-property";
import { useDraft } from "../draft-store";
import { useSignupSession } from "../signup-session";
import { LivePreviewCard } from "../components/LivePreviewCard";
import { PaymentGatewayDialog, type GatewaySaveResult } from "../components/PaymentGatewayDialog";
import { UpgradePlansDialog } from "../components/UpgradePlansDialog";
import {
  GATEWAY_CONFIGS,
  emptyGatewaySettings,
  fromPaymentMethodState,
  hasSavedPaymentMethod,
  toPaymentMethodRequest,
  type GatewayId,
  type GatewaySettings,
} from "../payment-gateways";

/** Order and plan of the payment methods until the back office answers (it decides, see pjJabbApi::$paymentGateways). */
const DEFAULT_METHODS: { id: GatewayId; tier: "free" | "pro" }[] = [
  { id: "paypal", tier: "free" },
  { id: "authorize", tier: "pro" },
  { id: "razorpay", tier: "pro" },
  { id: "stripe", tier: "pro" },
  { id: "cash", tier: "free" },
];

export function LiveStep() {
  const draft = useDraft();
  const { state, token } = useSignupSession();
  const loginUrl = state?.login_url;
  // Companies added in the back office may not have a property yet.
  const hasProperty = Boolean(state?.property);
  const property = draftToProperty(draft);
  const slug = property.slug || "your-page";
  const link = `${bookingLinkHost}/${slug}`;
  // The host's website: /property/<property name> (the server finds the property by this link).
  const websiteHref = state?.property?.name ? `/property/${slugify(state.property.name)}` : null;
  const [copied, setCopied] = useState(false);
  const [demoMessage, setDemoMessage] = useState<string | null>(null);
  const [openGateway, setOpenGateway] = useState<GatewayId | null>(null);
  // Values shown in the popups. Secret keys are only held while typing: after a save the
  // field is emptied again (the server never sends them back).
  const [gatewaySettings, setGatewaySettings] = useState<Record<GatewayId, GatewaySettings>>(
    () =>
      Object.fromEntries(
        (Object.keys(GATEWAY_CONFIGS) as GatewayId[]).map((id) => [id, emptyGatewaySettings(GATEWAY_CONFIGS[id])]),
      ) as Record<GatewayId, GatewaySettings>,
  );
  const [savedGateways, setSavedGateways] = useState<GatewayId[]>([]);
  // Payment methods of the property as the back office sees them (order, free / Pro, locked, on / off).
  const [methods, setMethods] = useState<PaymentMethodState[] | null>(null);
  const [plansOpen, setPlansOpen] = useState(false);
  const [gatewayLoadError, setGatewayLoadError] = useState<string | null>(null);

  // Fill the popups with what is already saved for the property (also after a reload / on another device).
  useEffect(() => {
    if (!token || !hasProperty) return;
    let cancelled = false;
    signupApi.paymentMethods(token).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        // Without the saved settings the popups would look unconnected: say so instead of failing silently.
        setGatewayLoadError(
          result.code === 401
            ? "Your session has ended. Please log in again to manage payments."
            : `We couldn't load your saved payment settings (${result.message}). Reload the page before changing them.`,
        );
        return;
      }
      setGatewayLoadError(null);
      const list = result.data.payment_methods.filter((state) => state.payment_method in GATEWAY_CONFIGS);
      const saved = list.filter(hasSavedPaymentMethod);
      setMethods(list);
      setGatewaySettings((current) => {
        const next = { ...current };
        for (const state of saved) {
          const id = state.payment_method;
          next[id] = fromPaymentMethodState(GATEWAY_CONFIGS[id], current[id], state);
        }
        return next;
      });
      setSavedGateways(saved.map((state) => state.payment_method));
    });
    return () => {
      cancelled = true;
    };
  }, [token, hasProperty]);
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);

  async function saveGateway(id: GatewayId, settings: GatewaySettings): Promise<GatewaySaveResult> {
    const config = GATEWAY_CONFIGS[id];
    if (!token) {
      return { ok: false, message: "Your session has ended. Please log in again.", errors: {} };
    }
    const result = await signupApi.savePaymentMethod(toPaymentMethodRequest(config, settings), token);
    if (!result.ok) {
      return { ok: false, message: result.message, errors: result.errors };
    }
    const saved = result.data;
    setGatewaySettings((current) => ({ ...current, [id]: fromPaymentMethodState(config, settings, saved) }));
    setSavedGateways((current) => (current.includes(id) ? current : [...current, id]));
    setMethods((current) => current?.map((state) => (state.payment_method === id ? saved : state)) ?? current);
    setOpenGateway(null);
    setPaymentMessage(
      saved.is_active
        ? config.offline
          ? "Cash payments are switched on. Guests can choose to pay when they arrive."
          : `${config.name} is switched on${saved.is_test_mode ? " in test mode" : ""}. Guests can pay with it at checkout.`
        : `${config.name} settings saved. ${config.name} payments are switched off.`,
    );
    return { ok: true };
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

  // Methods in the back office's order; free ones under "Set up payments", the others under "More gateways on Pro".
  const methodList = methods
    ? methods.map((state) => ({ id: state.payment_method, tier: state.tier, state }))
    : DEFAULT_METHODS.map((method) => ({ ...method, state: undefined as PaymentMethodState | undefined }));
  const freeMethods = methodList.filter((method) => method.tier === "free");
  const proMethods = methodList.filter((method) => method.tier === "pro");
  const proLocked = proMethods.some((method) => method.state?.locked);

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
              <span className="text-brand">
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
              <Button variant="onDark" size="lg" href={websiteHref ?? "/setup/preview"}>
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

      {gatewayLoadError ? (
        <Notice tone="warning" role="alert" className="mt-6" title="Payments">
          {gatewayLoadError}
        </Notice>
      ) : null}

      {paymentMessage ? (
        <Notice tone="success" role="status" className="mt-6" title="Payments">
          {paymentMessage}
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

      <UpgradePlansDialog
        open={plansOpen}
        token={token}
        themeName={null}
        featureKey="payment_gateway_choice"
        title="Unlock more payment gateways"
        intro="PayPal and cash are free on every plan. Authorize.Net, Razorpay and Stripe come with the plans that include payment gateway choice."
        keepFreeLabel="Keep PayPal and cash"
        onClose={() => setPlansOpen(false)}
        onKeepFree={() => setPlansOpen(false)}
        onRefresh={() => {
          setPlansOpen(false);
          window.location.reload();
        }}
      />

      <div className="mt-10 grid grid-cols-1 items-start gap-7 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <section aria-labelledby="checklist-title">
          <p className="text-eyebrow uppercase text-primary">Checklist to launch</p>
          <h2 id="checklist-title" className="mt-1 text-section">
            Next: start taking direct bookings
          </h2>

          <ol className="mt-6 grid gap-5">
            <li className="rounded-card border-2 border-primary bg-primary-tint p-5 sm:p-6">
              <div className="flex gap-4">
                <StepNumber n={1} solid />
                <div className="min-w-0 flex-1">
                  <h3 className="flex flex-wrap items-center gap-2 font-heading text-title">
                    Set up payments <Badge variant="warning">Needed to accept bookings</Badge>
                  </h3>
                  <p className="mt-1 text-small text-body-strong">
                    Free on every plan: get paid online with PayPal, or let guests pay in cash when they arrive.
                  </p>
                  <ul className="mt-4 grid gap-3">
                    {freeMethods.map((method) => (
                      <li key={method.id}>
                        <MethodRow
                          config={GATEWAY_CONFIGS[method.id]}
                          state={method.state}
                          connected={savedGateways.includes(method.id)}
                          onOpen={() => setOpenGateway(method.id)}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>

            {proMethods.length > 0 ? (
              <li
                className="list-none rounded-card border border-border bg-card p-5 shadow-card sm:p-7"
                aria-label="More gateways on Pro"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-heading text-title">More gateways on Pro</h3>
                  {proLocked ? (
                    <button
                      type="button"
                      aria-haspopup="dialog"
                      onClick={() => setPlansOpen(true)}
                      className="flex items-center gap-1.5 rounded-sm text-small font-semibold text-heading hover:text-link-hover focus-visible:outline-none focus-visible:focus-ring"
                    >
                      <Icon name="lock" size={14} /> Upgrade for more payment gateways
                    </button>
                  ) : (
                    <Tag>
                      <Icon name="check" size={12} className="mr-1" /> Included in your plan
                    </Tag>
                  )}
                </div>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {proMethods.map((method) => (
                    <li key={method.id}>
                      <MethodRow
                        config={GATEWAY_CONFIGS[method.id]}
                        state={method.state}
                        connected={savedGateways.includes(method.id)}
                        pro
                        locked={Boolean(method.state?.locked)}
                        onOpen={() => (method.state?.locked ? setPlansOpen(true) : setOpenGateway(method.id))}
                      />
                    </li>
                  ))}
                </ul>
              </li>
            ) : null}

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
                ["Click Connect", "and add the keys of your PayPal account, or switch on cash payments."],
                ["Guests pay directly", "on your StayOwned website, online or in cash on arrival."],
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

/** One payment method on the list: logo, name, plan, status and its button. */
function MethodRow({
  config,
  state,
  connected,
  pro = false,
  locked = false,
  onOpen,
}: {
  config: (typeof GATEWAY_CONFIGS)[GatewayId];
  state?: PaymentMethodState;
  connected: boolean;
  pro?: boolean;
  locked?: boolean;
  onOpen: () => void;
}) {
  const on = Boolean(state?.is_active);
  const status = locked ? null : on ? (state?.is_test_mode ? "On · test mode" : "On") : connected ? "Off" : null;
  const action = locked ? "Unlock" : config.offline ? (on ? "Edit" : "Turn on") : connected ? "Edit" : "Connect";
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      onClick={onOpen}
      className="flex h-full w-full items-center gap-3 rounded-input border border-border bg-background p-4 text-left transition-colors hover:border-border-strong focus-visible:outline-none focus-visible:focus-ring"
    >
      <span
        aria-hidden="true"
        className={cn("grid size-9 shrink-0 place-items-center rounded-sm font-bold text-white", config.tileClass, locked && "opacity-60")}
      >
        {config.initial}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2 font-semibold text-heading">
          {config.name}
          {pro ? <Badge variant="pro">Pro</Badge> : <Badge variant="free">Free</Badge>}
          {status ? <Tag className={on ? "text-success" : undefined}>{status}</Tag> : null}
        </span>
        <span className="mt-0.5 block text-caption text-body">{config.summary}</span>
      </span>
      <span className="shrink-0 text-small font-semibold text-primary">
        {action} <Icon name="arrowRight" size={14} className="inline" />
      </span>
    </button>
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
