"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { getTheme } from "@/data/themes";
import { draftToProperty } from "../draft-to-property";
import { useDraft } from "../draft-store";
import { LivePreviewCard } from "./LivePreviewCard";

type Variant = "details" | "photos" | "content";

/** Dark gradient panel holding the live preview that updates as the host types. */
export function PreviewPanel({ variant, intro, footer }: { variant: Variant; intro?: ReactNode; footer?: ReactNode }) {
  const draft = useDraft();
  const property = draftToProperty(draft);
  return (
    <div className="panel-gradient rounded-panel p-5 text-on-dark shadow-panel sm:p-8">
      {intro}
      <p className="mb-3 flex items-center gap-2 text-caption font-bold uppercase tracking-wider text-on-dark-muted">
        <span className="size-2 rounded-pill bg-accent" aria-hidden="true" />
        Live preview (what guests see)
      </p>
      <LivePreviewCard property={property} variant={variant} />
      {footer}
    </div>
  );
}

export function AccountPanelIntro() {
  return (
    <h2 className="mb-6 font-heading text-section text-on-dark">
      In 5 minutes you&apos;ll have <span className="text-primary-on-dark">your own booking page.</span>
    </h2>
  );
}

export function AccountPanelBenefits() {
  const benefits = [
    "A custom link ready to share directly on WhatsApp & Instagram",
    "High-converting property description written for you by AI",
    "Guests can check available dates and book directly with UPI",
  ];
  return (
    <ul className="mt-6 space-y-3 border-t border-white/10 pt-6">
      {benefits.map((benefit) => (
        <li key={benefit} className="flex items-start gap-3 text-small text-on-dark">
          <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-pill bg-primary text-on-primary">
            <Icon name="check" size={12} strokeWidth={3} />
          </span>
          {benefit}
        </li>
      ))}
    </ul>
  );
}

/** "ACTIVE THEME · Free Plan · Casa / Want other themes? Upgrade to Pro" card. */
export function ActiveThemeCard() {
  const draft = useDraft();
  const theme = getTheme(draft.theme);
  return (
    <div className="rounded-card border border-border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-caption font-bold uppercase tracking-wide text-muted">
          Active theme <Badge variant="neutral" className="normal-case">{theme.plan === "free" ? "Free Plan" : "Pro"}</Badge>
        </p>
        <p className="font-heading text-small font-bold text-heading">{theme.name}</p>
      </div>
      <div className="mt-4 rounded-input border border-primary-subtle bg-primary-tint p-4">
        <p className="flex items-center gap-2 text-small font-semibold text-heading">
          <Icon name="lock" size={15} className="text-primary" /> Want other themes? Upgrade to Pro
        </p>
        <p className="mt-1 text-caption text-body">
          Unlock 4 designer looks (Luxe, Homestay, Urban, Coastal) with custom palettes, fonts, and booking styling.
        </p>
        <Link
          href="/themes"
          className="mt-3 inline-flex items-center gap-2 rounded-sm text-small font-semibold text-primary-strong hover:underline focus-visible:outline-none focus-visible:focus-ring"
        >
          <Badge variant="solid">Pro</Badge> Explore Pro themes <Icon name="arrowRight" size={14} />
        </Link>
      </div>
    </div>
  );
}
