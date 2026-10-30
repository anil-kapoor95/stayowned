"use client";

import { useState, type CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Icon } from "@/components/ui/Icon";
import { SafeImage } from "@/components/ui/SafeImage";
import type { ApiTheme } from "@/lib/api/signup";
import { cn } from "@/lib/utils";

/** What the theme previews show: the host's own property (sample values where it has none yet). */
export interface ThemePreviewData {
  name: string;
  place: string;
  /** "₹8,500" or null when no price is set. */
  price: string | null;
  facts: string[];
  amenities: string[];
  headline: string | null;
  description: string | null;
  photo: string | null;
  /** More photos for the gallery (after the first). */
  morePhotos: string[];
  /** "stayowned.com/green-casa" */
  link: string;
}

/** Palette colours from the back office as CSS variables (they are data, so inline). */
export function themeVars(theme: ApiTheme): CSSProperties {
  return {
    "--t-brand": theme.colors.brand,
    "--t-accent": theme.colors.accent,
    "--t-text": theme.colors.text,
    "--t-bg": theme.colors.background,
    "--t-price": theme.colors.price,
    "--t-page": theme.colors.page_background,
  } as CSSProperties;
}

const SWATCHES: { key: keyof ApiTheme["colors"]; label: string; use: string }[] = [
  { key: "brand", label: "Brand", use: "Header, hero and footer" },
  { key: "accent", label: "Button", use: "Buttons" },
  { key: "text", label: "Text", use: "Text" },
  { key: "price", label: "Price", use: "Price" },
  { key: "background", label: "Cards", use: "Cards and bars" },
  { key: "page_background", label: "Page", use: "Page background" },
];

const hero = "bg-linear-135 from-(--t-brand) to-[color-mix(in_srgb,var(--t-brand)_55%,#000)]";
const faint = "border-[color-mix(in_srgb,var(--t-text)_14%,transparent)]";

/* ------------------------------------------------------------ Card mini page */

/** Small version of the guest page in a theme, for the theme cards. */
export function ThemeMiniPage({ theme, data }: { theme: ApiTheme; data: ThemePreviewData }) {
  return (
    <div
      style={themeVars(theme)}
      className="overflow-hidden rounded-input border border-black/5 bg-(--t-page) text-[0.6875rem] text-(--t-text)"
      aria-hidden="true"
    >
      <div className="flex items-center justify-between border-b border-black/5 bg-(--t-bg) px-2.5 py-2">
        <span className="truncate font-heading text-[0.75rem] font-extrabold text-(--t-brand)">{data.name}</span>
        <span className="flex shrink-0 gap-2 opacity-75">
          <span>Rooms</span>
          <span>FAQ</span>
        </span>
      </div>
      <div className={cn("relative m-2 flex h-24 flex-col justify-end overflow-hidden rounded-sm p-2.5 text-white", hero)}>
        {data.photo ? (
          <>
            <SafeImage src={data.photo} alt="" fill sizes="20rem" className="object-cover" />
            <span className="absolute inset-0 bg-linear-to-t from-(--t-brand) via-[color-mix(in_srgb,var(--t-brand)_45%,transparent)] to-transparent" />
          </>
        ) : (
          <span className="absolute -right-5 -top-5 size-24 rounded-pill bg-white/12" />
        )}
        <b className="relative truncate font-heading text-[0.8125rem]">{data.name}</b>
        {data.place ? <span className="relative truncate">{data.place}</span> : null}
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_5.75rem] gap-2 px-2 pb-2">
        <div className="min-w-0">
          <p className="font-bold">About this place</p>
          <span className="mt-1 block h-1.5 rounded-pill bg-[color-mix(in_srgb,var(--t-text)_16%,transparent)]" />
          <span className="mt-1 block h-1.5 w-[85%] rounded-pill bg-[color-mix(in_srgb,var(--t-text)_16%,transparent)]" />
          <span className="mt-1 block h-1.5 w-3/5 rounded-pill bg-[color-mix(in_srgb,var(--t-text)_16%,transparent)]" />
          <p className="mt-1.5 flex gap-1 overflow-hidden">
            {data.facts.slice(0, 3).map((fact) => (
              <span key={fact} className={cn("shrink-0 rounded-pill border bg-(--t-bg) px-1.5 text-[0.59375rem]", faint)}>
                {fact}
              </span>
            ))}
          </p>
        </div>
        <div className="rounded-sm bg-(--t-bg) p-1.5 shadow-[0_1px_0_rgb(0_0_0/0.05)]">
          <p className="break-words font-heading text-[0.75rem] font-extrabold leading-tight text-(--t-price)">
            {data.price ?? "Your price"}
          </p>
          <p className="text-[0.59375rem] opacity-70">per night</p>
          <p className="mt-1.5 rounded-pill bg-(--t-accent) py-1 text-center text-[0.625rem] font-bold text-white">Book now</p>
        </div>
      </div>
    </div>
  );
}

/** Colour strip under a theme card. */
export function ThemeSwatches({ theme }: { theme: ApiTheme }) {
  return (
    <ul className="grid grid-cols-5 gap-1.5" aria-label={`${theme.name} colours`}>
      {SWATCHES.filter((s) => s.key !== "background").map((swatch) => (
        <li key={swatch.key} className="text-center text-[0.65625rem] text-muted">
          <span
            className="mb-0.5 block h-[18px] rounded-[6px] border border-black/10"
            style={{ background: theme.colors[swatch.key] }}
          />
          {swatch.label}
          <span className="sr-only">: {theme.colors[swatch.key]}</span>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------ Full guest page */

function GuestPage({ theme, data, mobile }: { theme: ApiTheme; data: ThemePreviewData; mobile: boolean }) {
  const title = data.headline || data.name;
  return (
    <div style={themeVars(theme)} className="bg-(--t-page) text-small text-(--t-text)">
      <div className="flex items-center justify-between gap-3 border-b border-black/5 bg-(--t-bg) px-4 py-3 sm:px-5">
        <span className="truncate font-heading text-lg font-extrabold text-(--t-brand)">{data.name}</span>
        <span className={cn("gap-4 text-caption opacity-80", mobile ? "hidden" : "hidden md:flex")}>
          <span>Rooms</span>
          <span>Amenities</span>
          <span>Location</span>
          <span>FAQ</span>
        </span>
        <span className="shrink-0 rounded-pill bg-(--t-accent) px-4 py-2 text-caption font-bold text-white">Book now</span>
      </div>
      <div className="px-4 py-5 sm:px-5">
        <p className={cn("font-heading font-extrabold leading-tight tracking-[-0.02em]", mobile ? "text-2xl" : "text-[1.75rem]")}>
          {title}
        </p>
        {data.place ? <p className="mt-1 opacity-75">{data.place}</p> : null}

        <div className={cn("my-4 grid gap-2", mobile ? "grid-cols-1" : "grid-cols-[2fr_1fr_1fr] grid-rows-[7rem_7rem]")}>
          <div className={cn("relative overflow-hidden rounded-input", hero, mobile ? "h-44" : "row-span-2")}>
            {data.photo ? (
              <SafeImage src={data.photo} alt="" fill sizes="40rem" className="object-cover" />
            ) : (
              <span className="absolute bottom-3 left-3.5 text-caption font-bold text-white/90">Your photos</span>
            )}
          </div>
          {mobile
            ? null
            : [0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="relative overflow-hidden rounded-input bg-[color-mix(in_srgb,var(--t-brand)_18%,var(--t-bg))]"
                >
                  {data.morePhotos[i] ? (
                    <SafeImage src={data.morePhotos[i]} alt="" fill sizes="12rem" className="object-cover" />
                  ) : null}
                </div>
              ))}
        </div>

        <div className={cn("grid items-start gap-5", mobile ? "grid-cols-1" : "grid-cols-[minmax(0,1fr)_16rem]")}>
          <div className="min-w-0">
            <p className="flex flex-wrap gap-2">
              {data.facts.map((fact) => (
                <span key={fact} className={cn("rounded-pill border bg-(--t-bg) px-3 py-1", faint)}>
                  {fact}
                </span>
              ))}
            </p>
            <p className="mt-5 font-heading text-base font-bold">About this place</p>
            <p className="mt-2 line-clamp-4 leading-relaxed opacity-85">
              {data.description ||
                "Your description goes here: what makes your place special, the rooms, the view and what's nearby."}
            </p>
            {data.amenities.length ? (
              <>
                <p className="mt-5 font-heading text-base font-bold">Amenities</p>
                <ul className={cn("mt-2 grid gap-1.5", mobile ? "grid-cols-1" : "grid-cols-2")}>
                  {data.amenities.slice(0, 8).map((amenity) => (
                    <li key={amenity} className="flex items-center gap-2">
                      <Icon name="check" size={14} strokeWidth={3} className="text-(--t-accent)" />
                      {amenity}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
          <div className="rounded-card bg-(--t-bg) p-4 shadow-[0_10px_26px_-14px_rgb(0_0_0/0.3)]">
            <p className="font-heading text-2xl font-extrabold text-(--t-price)">
              {data.price ?? "Your price"} <span className="font-body text-caption font-medium text-(--t-text) opacity-70">/ night</span>
            </p>
            <div className={cn("my-3 grid grid-cols-2 rounded-sm border text-caption", faint)}>
              <span className="px-2.5 py-2">
                <b className="block text-[0.625rem] tracking-wider opacity-60">CHECK-IN</b>Add date
              </span>
              <span className={cn("border-l px-2.5 py-2", faint)}>
                <b className="block text-[0.625rem] tracking-wider opacity-60">CHECK-OUT</b>Add date
              </span>
            </div>
            <span className="block rounded-pill bg-(--t-accent) py-3 text-center font-bold text-white">Book now</span>
            <p className="mt-2 text-center text-caption opacity-70">Direct booking · 0% commission</p>
          </div>
        </div>
      </div>
      <div className="mt-2 flex justify-between gap-3 bg-(--t-brand) px-4 py-4 text-caption text-white sm:px-5">
        <span className="truncate">© {data.name}</span>
        <span className="shrink-0">Powered by StayOwned</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ Preview window */

/**
 * Full preview of the host's page in each theme (desktop / mobile), with the theme's colours.
 * The free theme can be used straight away; a paid one leads to the plans (onUnlock).
 */
export function ThemePreviewDialog({
  themes,
  index,
  data,
  onIndexChange,
  onClose,
  onUse,
  onUnlock,
}: {
  themes: ApiTheme[];
  /** Theme shown, or null when closed. */
  index: number | null;
  data: ThemePreviewData;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  /** Use this (unlocked) theme. */
  onUse: (theme: ApiTheme) => void;
  /** Show the plans for this locked theme. */
  onUnlock: (theme: ApiTheme) => void;
}) {
  const [mobile, setMobile] = useState(false);
  const open = index !== null;
  const theme = open ? themes[index] : null;
  const freeIndex = Math.max(0, themes.findIndex((item) => item.free));

  // The <dialog> stays mounted (opening a freshly mounted one is undone by React's double effects in dev).
  if (!theme || index === null) {
    return (
      <Dialog open={false} onClose={onClose} title="Theme preview">
        {null}
      </Dialog>
    );
  }

  const go = (step: number) => onIndexChange((index + step + themes.length) % themes.length);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="xl"
      title={`Preview: ${theme.name}`}
      description={theme.locked ? "Premium theme — see how your page looks before you upgrade." : "See how your page looks."}
      onKeyDown={(event) => {
        if (event.target instanceof HTMLInputElement) return;
        if (event.key === "ArrowRight") go(1);
        if (event.key === "ArrowLeft") go(-1);
      }}
    >
      <div className="-mx-5 -my-5 grid sm:-mx-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="min-w-0 bg-surface-muted p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex rounded-pill border border-border bg-surface p-0.5" role="group" aria-label="Device">
              {[
                { label: "Desktop", value: false },
                { label: "Mobile", value: true },
              ].map((option) => (
                <button
                  key={option.label}
                  type="button"
                  aria-pressed={mobile === option.value}
                  onClick={() => setMobile(option.value)}
                  className={cn(
                    "rounded-pill px-3.5 py-1.5 text-caption font-semibold focus-visible:outline-none focus-visible:focus-ring",
                    mobile === option.value ? "bg-secondary text-on-dark" : "text-body",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Themes">
              {themes.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onIndexChange(i)}
                  aria-label={`${item.name}${item.locked ? " (premium)" : ""}`}
                  aria-current={i === index ? "true" : undefined}
                  title={item.name}
                  className={cn(
                    "relative size-7 rounded-pill border-2 border-surface focus-visible:outline-none focus-visible:focus-ring",
                    i === index ? "ring-2 ring-primary" : "ring-1 ring-border",
                  )}
                  style={{ background: item.colors.brand }}
                >
                  {item.locked ? (
                    <span className="absolute -bottom-1 -right-1 grid size-3.5 place-items-center rounded-pill bg-secondary text-on-dark">
                      <Icon name="lock" size={8} strokeWidth={3} />
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          <div
            className={cn(
              "mx-auto overflow-hidden rounded-card bg-surface shadow-card transition-[max-width] duration-300",
              mobile ? "max-w-[24rem]" : "max-w-full",
            )}
          >
            <div className="flex items-center gap-2 border-b border-border px-3 py-2 text-caption" aria-hidden="true">
              <span className="flex gap-1.5">
                <span className="size-2.5 rounded-pill bg-window-close" />
                <span className="size-2.5 rounded-pill bg-window-minimise" />
                <span className="size-2.5 rounded-pill bg-window-zoom" />
              </span>
              <span className="flex-1 truncate rounded-sm bg-surface-muted px-3 py-1 text-center font-semibold text-heading">
                {data.link}
              </span>
            </div>
            <GuestPage theme={theme} data={data} mobile={mobile} />
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-border p-5 lg:border-l lg:border-t-0">
          <div>
            {theme.free ? (
              <span className="inline-flex rounded-sm bg-success-soft px-2 py-0.5 text-caption font-bold text-success-strong">
                Free theme
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-sm bg-secondary px-2 py-0.5 text-caption font-bold text-on-dark">
                <Icon name="lock" size={11} strokeWidth={2.5} /> Pro theme
              </span>
            )}
            <p className="mt-1.5 font-heading text-2xl font-extrabold text-heading">{theme.name}</p>
          </div>
          <div className="flex items-center justify-between text-caption text-body">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous theme"
              className="grid size-9 place-items-center rounded-pill border border-border bg-surface text-heading hover:border-border-strong focus-visible:outline-none focus-visible:focus-ring"
            >
              <Icon name="arrowLeft" size={16} />
            </button>
            <span aria-live="polite">
              {index + 1} of {themes.length}
            </span>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next theme"
              className="grid size-9 place-items-center rounded-pill border border-border bg-surface text-heading hover:border-border-strong focus-visible:outline-none focus-visible:focus-ring"
            >
              <Icon name="arrowRight" size={16} />
            </button>
          </div>

          <div>
            <p className="mb-2 text-caption font-bold uppercase tracking-wider text-muted">Theme colours</p>
            <ul className="grid gap-2">
              {SWATCHES.map((swatch) => (
                <li key={swatch.key} className="flex items-center gap-2.5 text-caption">
                  <span
                    className="size-7 shrink-0 rounded-sm border border-black/10"
                    style={{ background: theme.colors[swatch.key] }}
                  />
                  <span className="flex-1 font-semibold text-heading">{swatch.use}</span>
                  <code className="text-muted">{theme.colors[swatch.key]}</code>
                </li>
              ))}
            </ul>
          </div>

          {theme.locked ? (
            <div className="grid gap-2">
              <div className="rounded-input bg-surface-muted p-3.5 text-small text-body">
                <p className="font-semibold text-heading">Unlock {theme.name} with Pro</p>
                <p className="mt-1">All themes, your own domain, more payment gateways and more.</p>
              </div>
              <Button fullWidth onClick={() => onUnlock(theme)}>
                See plans &amp; unlock
              </Button>
              <Button fullWidth variant="outline" onClick={() => onIndexChange(freeIndex)}>
                Try the free theme
              </Button>
              <p className="text-center text-caption text-muted">
                You can publish now with the free theme and switch later.
              </p>
            </div>
          ) : (
            <Button fullWidth onClick={() => onUse(theme)}>
              Use {theme.name}
              {theme.free ? " — free" : ""}
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  );
}
