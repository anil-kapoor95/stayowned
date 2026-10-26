import Link from "next/link";
import { THEMES, type ThemeOption } from "@/data/themes";
import type { ThemeId } from "@/types/property";
import { cn } from "@/lib/utils";
import { DisplaySectionHeader, FaqSection, LaunchCta } from "./display";
import { THEMES_FAQS } from "./faq-data";
import { ArrowIcon, PadlockIcon, SmallTickIcon } from "./figma-icons";
import { HeroAccent, PageHero } from "./PageHero";

/** "Themes" page from the Figma "Themes page" frame (131:2). */
export function ThemesPage() {
  return (
    <div className="bg-surface">
      <PageHero
        id="themes-title"
        eyebrow="Themes Built to book"
        title={
          <>
            Beautiful Themes, <HeroAccent>built for stays</HeroAccent>
          </>
        }
        intro="Five sleek designs built to showcase your property and drive direct bookings."
        introClassName="font-medium text-body"
      />
      <ThemeGallery />
      <ProBanner />
      <EveryThemeIncludes />
      <FaqSection id="themes-faq-title" items={THEMES_FAQS} />
      <LaunchCta />
    </div>
  );
}

/* ------------------------------------------------------------ Theme gallery */

/** A live example property for each theme, used by the "Preview" buttons. */
const PREVIEW_PAGES: Record<ThemeId, string> = {
  casa: "/properties/green-casa",
  luxe: "/properties/casa-palmeira",
  homestay: "/properties/tamarind-homestay",
  urban: "/properties/bandra-skyline-loft",
  coastal: "/properties/driftwood-cottage",
};

/**
 * Fonts of the small mock windows, exactly as drawn in Figma (131:197). Their colours
 * come from the --color-mock-* tokens, switched per theme with [data-mock] in tokens.css.
 */
const MOCK_TYPE: Record<ThemeId, { brand: string; pill: string; title: string }> = {
  casa: {
    brand: "font-mock-sans font-bold",
    pill: "rounded-pill font-bold",
    title: "font-mock-sans text-[0.875rem] font-bold leading-[19.25px] tracking-[-0.025em]",
  },
  luxe: {
    brand: "font-mock-serif font-bold italic",
    pill: "rounded-pill",
    title: "font-mock-serif text-[0.875rem] leading-[19.25px] tracking-[0.025em]",
  },
  homestay: {
    brand: "font-mock-serif font-bold",
    pill: "rounded-pill",
    title: "font-mock-sans text-[0.875rem] font-bold leading-[19.25px]",
  },
  urban: {
    brand: "font-mock-sans",
    pill: "rounded-[4px]",
    title: "font-mock-sans text-[0.875rem] font-bold leading-[19.25px] tracking-[-0.025em]",
  },
  coastal: {
    brand: "font-mock-serif font-bold italic",
    pill: "rounded-pill",
    title: "font-mock-serif text-[1rem] italic leading-[22px] tracking-[-0.025em]",
  },
};

function ThemeGallery() {
  return (
    <section aria-labelledby="gallery-title" className="pb-6 pt-section sm:pt-[104px]">
      <div className="container-page">
        <div className="flex flex-col gap-4 lg:min-h-[229px] lg:flex-row lg:items-start lg:justify-between">
          <DisplaySectionHeader
            id="gallery-title"
            align="left"
            eyebrow="Look like you"
            title={<span className="block max-w-[440px]">Beautiful themes, built for stays</span>}
          />
          <p className="font-body text-[1.125rem] leading-[26.4px] text-gallery-intro lg:pt-[124px]">
            Start with a free theme. Switch any time.
          </p>
        </div>
        <ul className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {THEMES.map((theme) => (
            <ThemeGalleryCard key={theme.id} theme={theme} selected={theme.id === "casa"} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function ThemeGalleryCard({ theme, selected }: { theme: ThemeOption; selected: boolean }) {
  const type = MOCK_TYPE[theme.id];
  const pro = theme.plan === "pro";
  return (
    <li
      className={cn(
        "relative flex flex-col rounded-theme-card border-2 bg-surface p-4 pb-5",
        selected ? "border-brand shadow-theme-card-active" : "border-theme-card-border shadow-theme-card",
      )}
    >
      {/* Mock preview window */}
      <div
        aria-hidden="true"
        data-mock={theme.id}
        className="relative h-[231px] overflow-hidden rounded-[12px] border border-mock-window-border bg-mock-window p-3"
      >
        <div className="flex items-start justify-between pb-3">
          <span className={cn("pt-[1.5px] text-[0.75rem] leading-4 text-mock-brand", type.brand)}>Green Casa</span>
          <span className={cn("bg-mock-pill px-2.5 py-0.5 font-mock-sans text-[0.625rem] leading-[15px] text-mock-pill-text", type.pill)}>Book now</span>
        </div>
        <div className="relative flex h-[128px] flex-col justify-end overflow-hidden rounded-[8px] bg-mock-hero p-3.5 shadow-mock-hero">
          {pro ? (
            <span className="absolute right-2 top-2 inline-flex h-[17.5px] items-center gap-1 rounded-[4px] bg-pro-overlay px-2 font-mock-sans text-[0.5625rem] font-bold leading-[13.5px] text-white">
              <PadlockIcon size={10} /> PRO
            </span>
          ) : null}
          <span className={cn("text-mock-title", type.title)}>{theme.previewHeadline}</span>
          <span className={"font-mock-sans text-[0.625rem] leading-[15px] text-mock-sub"}>Assagao, North Goa</span>
        </div>
        <div className="mt-2.5 grid grid-cols-3 gap-2">
          {[0, 1, 2].map((index) => (
            <span key={index} className={"h-9 rounded-[4px] bg-mock-thumb"} />
          ))}
        </div>
      </div>

      {/* Footer meta */}
      <div className="flex items-center justify-between gap-2 pt-5">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 className="flex items-center gap-1.5 font-mock-sans text-[0.875rem] font-bold leading-5 text-gallery-ink">
            {theme.name}
            {pro ? (
              <span className="inline-flex h-[17.5px] items-center gap-0.5 rounded-[4px] bg-pro-ink px-1.5 text-[0.5625rem] leading-[13.5px] text-white">
                <PadlockIcon size={10} /> PRO
              </span>
            ) : (
              <span className="rounded-[4px] bg-free-badge-bg px-1.5 py-0.5 text-[0.625rem] leading-[15px] text-free-badge-text">FREE</span>
            )}
          </h3>
          <p className="truncate font-mock-sans text-[0.75rem] leading-4 text-gallery-muted">{theme.description}</p>
        </div>
        {selected ? (
          <span className="inline-flex h-8 shrink-0 items-center rounded-[8px] bg-primary px-3.5 font-mock-sans text-[0.75rem] font-bold leading-4 text-on-primary">
            Selected
          </span>
        ) : (
          <div className="flex shrink-0 items-center gap-1.5">
            <Link
              href={PREVIEW_PAGES[theme.id]}
              className="inline-flex h-8 items-center rounded-[8px] bg-preview-button px-3 font-mock-sans text-[0.75rem] font-bold leading-4 text-preview-button-text hover:bg-surface-muted focus-visible:outline-none focus-visible:focus-ring"
              aria-label={`Preview the ${theme.name} theme`}
            >
              Preview
            </Link>
            {pro ? (
              <Link
                href="/pricing"
                className="inline-flex h-8 items-center gap-1 rounded-[8px] bg-pro-ink px-3 font-mock-sans text-[0.75rem] font-bold leading-4 text-white drop-shadow-hairline hover:bg-secondary-hover focus-visible:outline-none focus-visible:focus-ring"
                aria-label={`Upgrade to use the ${theme.name} theme`}
              >
                <PadlockIcon size={12} /> Upgrade
              </Link>
            ) : null}
          </div>
        )}
      </div>

      {selected ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-[3px] -top-[3px] size-11 rounded-tr-[20px] border-r-3 border-t-3 border-brand"
        />
      ) : null}
    </li>
  );
}

/* ------------------------------------------------------------ Pro banner */

function ProBanner() {
  return (
    <section aria-labelledby="pro-banner-title" className="container-page pb-section pt-6 sm:pb-[104px]">
      <div className="mx-auto flex max-w-[1184px] flex-col gap-4 rounded-theme-card border border-banner-border bg-linear-to-r from-banner-from to-banner-to p-[21px] shadow-pro-banner md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4 md:items-center">
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-[12px] border border-banner-icon-border bg-banner-icon-bg"
          >
            <PadlockIcon size={20} />
          </span>
          <div className="flex flex-col gap-0.5">
            <h2
              id="pro-banner-title"
              className="flex flex-wrap items-center gap-2 font-mock-sans text-base font-bold leading-6 tracking-[-0.025em] text-white"
            >
              Unlock all 4 Pro themes with StayOwned Pro
              <span className="rounded-pill bg-primary px-2 py-0.5 text-[0.625rem] leading-[15px] tracking-normal text-on-primary">
                Save 25%
              </span>
            </h2>
            <p className="font-mock-sans text-[0.875rem] leading-5 text-banner-text">
              Access Luxe, Homestay, Urban &amp; Coastal themes, connect custom domains, and get 0% commission bookings.
            </p>
          </div>
        </div>
        <Link
          href="/pricing"
          className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-[12px] bg-primary px-4 py-2.5 font-mock-sans text-[0.875rem] font-bold leading-5 text-on-primary hover:bg-primary-hover focus-visible:outline-none focus-visible:focus-ring md:self-auto"
        >
          Upgrade to Pro <ArrowIcon size={16} />
        </Link>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ Every theme includes */

const INCLUDES = [
  "Booking search with live availability",
  "Photo gallery and amenities",
  "Your description, highlights and FAQs",
  "Location and map",
  "WhatsApp button and contact details",
  "Works on phones, tablets and desktops",
];

function EveryThemeIncludes() {
  return (
    <section aria-labelledby="includes-title" className="px-4 sm:px-6 lg:px-0">
      {/* Edge to edge on desktop, as in Figma (131:399). */}
      <div className="rounded-feature-band border border-border bg-includes-bg px-6 py-10 sm:px-10 lg:pb-[41px] lg:pl-[121px] lg:pr-[41px] lg:pt-[70px]">
        <h2
          id="includes-title"
          className="font-display text-section-xl font-extrabold tracking-[-0.0224em] text-pro-ink opsz-14"
        >
          Every theme includes
        </h2>
        <p className="pt-2 font-body text-base leading-6 text-body">
          Whichever look you pick, your page has everything guests need to book.
        </p>
        <ul className="grid grid-cols-1 gap-x-8 gap-y-3.5 pt-[18px] sm:grid-cols-2 lg:grid-cols-3">
          {INCLUDES.map((item) => (
            <li key={item} className="flex items-center gap-3 font-body text-base font-medium leading-6 text-pro-ink">
              <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center rounded-pill bg-brand">
                <SmallTickIcon />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
