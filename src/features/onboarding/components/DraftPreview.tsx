"use client";

import { useState } from "react";
import { PropertyDetails } from "@/components/property/PropertyDetails";
import { Button } from "@/components/ui/Button";
import { Icon, WhatsAppMark } from "@/components/ui/Icon";
import { bookingLinkHost } from "@/config/site";
import { cn } from "@/lib/utils";
import { draftToProperty } from "../draft-to-property";
import { useDraft } from "../draft-store";
import { useSignupSession } from "../signup-session";
import { hrefForNextStep, LIVE_HREF } from "../steps";
import { usePaletteStyle } from "../use-palette";

type Device = "desktop" | "mobile";

/** The host's page as guests see it: saved texts, photos, price and the chosen colour palette. */
function GuestPage() {
  const draft = useDraft();
  const { token, state } = useSignupSession();
  const property = draftToProperty(draft);
  const palette = usePaletteStyle(state?.theme?.palette_id, token);
  return (
    <div data-theme={property.theme} style={palette ?? undefined} className="bg-background">
      <PropertyDetails property={property} />
    </div>
  );
}

/**
 * Preview of the host's booking page: a toolbar (status, link, desktop / mobile view, share)
 * over the page in a browser window, or in a phone (an iframe, so the mobile layout is real).
 */
export function DraftPreview() {
  const draft = useDraft();
  const { state } = useSignupSession();
  const [device, setDevice] = useState<Device>("desktop");
  const [copied, setCopied] = useState(false);
  const live = state?.status === "completed";
  const property = draftToProperty(draft);
  const link = `${bookingLinkHost}/${property.slug || "your-page"}`;
  const backHref = live || !state ? LIVE_HREF : hrefForNextStep(state.next_step);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`https://${link}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard blocked: the link stays visible to copy by hand.
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-surface-muted">
      <div className="sticky top-(--spacing-header) z-30 bg-secondary text-on-dark shadow-panel">
        <div className="container-page flex flex-wrap items-center gap-x-4 gap-y-3 py-3">
          <Button href={backHref} variant="onDark" size="sm">
            <Icon name="arrowLeft" size={14} /> {live ? "Back" : "Back to setup"}
          </Button>

          <div className="flex min-w-0 flex-1 items-center gap-3">
            <h1 className="sr-only">Preview of {property.name}</h1>
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-pill px-2.5 py-1 text-caption font-bold uppercase tracking-wide",
                live ? "bg-accent/15 text-accent" : "bg-warning-soft text-warning",
              )}
            >
              <span aria-hidden="true" className={cn("size-1.5 rounded-pill", live ? "bg-accent" : "bg-warning")} />
              {live ? "Live" : "Draft"}
            </span>
            <span className="hidden min-w-0 items-center gap-2 rounded-pill border border-white/15 bg-white/5 px-3 py-1.5 text-small sm:flex">
              <Icon name="lock" size={13} className="shrink-0 text-accent" />
              <span className="truncate" id="preview-link">
                {link}
              </span>
            </span>
            <Button
              variant="onDark"
              size="sm"
              onClick={copyLink}
              aria-describedby="preview-link"
              className="shrink-0"
            >
              <Icon name={copied ? "check" : "copy"} size={14} />
              <span className="hidden sm:inline">{copied ? "Copied" : "Copy link"}</span>
              <span className="sr-only sm:hidden">{copied ? "Copied" : "Copy link"}</span>
            </Button>
            <span className="sr-only" aria-live="polite">
              {copied ? "Link copied to clipboard" : ""}
            </span>
          </div>

          <div role="group" aria-label="Preview size" className="hidden gap-1 rounded-pill bg-white/10 p-1 sm:flex">
            {(["desktop", "mobile"] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={device === value}
                onClick={() => setDevice(value)}
                className={cn(
                  "flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-small font-semibold transition-colors",
                  "focus-visible:outline-none focus-visible:focus-ring",
                  device === value ? "bg-surface text-heading" : "text-on-dark-muted hover:text-on-dark",
                )}
              >
                <Icon name={value === "desktop" ? "monitor" : "smartphone"} size={15} />
                {value === "desktop" ? "Desktop" : "Mobile"}
              </button>
            ))}
          </div>

          {live ? (
            <Button
              variant="whatsapp"
              size="sm"
              href={`https://wa.me/?text=${encodeURIComponent(`Book ${property.name} directly here: https://${link}`)}`}
              external
            >
              <WhatsAppMark size={15} /> Share
              <span className="sr-only"> on WhatsApp (opens in a new tab)</span>
            </Button>
          ) : (
            <Button href={backHref} size="sm">
              Continue setup <Icon name="arrowRight" size={14} />
            </Button>
          )}
        </div>
      </div>

      <div className="container-page flex-1 py-6 sm:py-10">
        {device === "mobile" ? (
          <div className="mx-auto w-full max-w-[24.5rem] rounded-device border-10 border-secondary-active bg-secondary-active shadow-panel">
            <iframe
              src="/setup/preview/frame"
              title={`Mobile preview of ${property.name}`}
              className="block h-[46rem] max-h-[75dvh] w-full rounded-device-screen bg-background"
            />
          </div>
        ) : (
          <div className="overflow-hidden rounded-panel border border-border bg-card shadow-panel">
            <div className="hidden items-center gap-3 border-b border-divider bg-surface px-4 py-3 sm:flex" aria-hidden="true">
              <span className="flex gap-1.5">
                <span className="size-3 rounded-pill bg-window-close" />
                <span className="size-3 rounded-pill bg-window-minimise" />
                <span className="size-3 rounded-pill bg-window-zoom" />
              </span>
              <span className="mx-auto flex min-w-0 max-w-md flex-1 items-center justify-center gap-2 truncate rounded-sm bg-surface-muted px-3 py-1 text-caption text-body">
                <Icon name="lock" size={11} className="shrink-0 text-success" />
                https://{link}
              </span>
              <span className="w-12" />
            </div>
            <GuestPage />
          </div>
        )}
        {!live ? (
          <p className="mt-4 text-center text-caption text-muted">
            This is a preview — guests can see your page once you publish it on the last step.
          </p>
        ) : null}
      </div>
    </div>
  );
}

/** Content of the phone iframe: only the guest page (the site header and footer are hidden). */
export function PreviewFrame() {
  return (
    <>
      <style>{"body > header, body > footer, body > a[href='#main'] { display: none !important; }"}</style>
      <GuestPage />
    </>
  );
}
