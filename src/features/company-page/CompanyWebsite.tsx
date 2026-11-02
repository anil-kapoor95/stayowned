"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { SafeImage } from "@/components/ui/SafeImage";
import type { CompanyPageData, CompanyPageProperty } from "@/lib/api/company-page";
import { formatAdminPrice, type PriceFormat } from "@/lib/price-format";
import { cn } from "@/lib/utils";
import { themeStyle } from "@/features/property-page/theme";

const card = "rounded-[1rem] border border-(--p-line) bg-(--p-card)";
const accentButton =
  "inline-flex items-center justify-center gap-2 rounded-[0.625rem] bg-(--p-accent) px-5 font-heading font-bold text-white transition-[filter] hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--p-accent) focus-visible:ring-offset-2";

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;
const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

/** Company page (/stays/<company>): every property of the host, each card opens its own page (/property/<slug>). */
export function CompanyWebsite({ page }: { page: CompanyPageData }) {
  const [place, setPlace] = useState<string | null>(null);
  const shown = place ? page.properties.filter((p) => p.location.city === place) : page.properties;
  const count = page.properties.length;
  const contact = page.email ? `mailto:${page.email}` : page.phone ? `tel:${page.phone.replace(/[^\d+]/g, "")}` : null;

  return (
    <div style={themeStyle(page.theme)} className="flex flex-1 flex-col bg-(--p-page) text-(--p-text)">
      <p className="bg-(--p-brand) py-2 text-center text-[0.75rem] font-medium text-white/80">
        <span aria-hidden="true" className="mr-1.5 inline-block size-1.5 rounded-full bg-(--p-accent) align-middle" />
        Designed by <strong className="text-white">PHPJabbers</strong>
      </p>

      <header className="sticky top-0 z-30 border-b border-(--p-line) bg-(--p-card)/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <a href="#stays" className="flex min-w-0 items-center gap-2.5">
            <Mark name={page.name} logo={page.logo} className="size-9 text-[0.875rem]" />
            <span className="truncate font-heading text-[1.125rem] font-bold">{page.name}</span>
          </a>
          {contact ? (
            <a href={contact} className={cn(accentButton, "h-10 shrink-0 text-[0.875rem]")}>Contact host</a>
          ) : null}
        </div>
      </header>

      <section className="border-b border-(--p-line) bg-(--p-card)">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-9 sm:flex-row sm:items-center sm:px-6">
          <Mark name={page.name} logo={page.logo} className="size-16 shrink-0 rounded-[0.875rem] text-[1.5rem]" />
          <div className="min-w-0">
            <h1 className="font-heading text-[1.875rem] font-extrabold leading-tight tracking-[-0.02em] sm:text-[2.25rem]">{page.name}</h1>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.9375rem] text-(--p-muted)">
              <span>{plural(count, "stay", "stays")}</span>
              {page.places.length > 0 ? (
                <span className="inline-flex items-center gap-1">
                  <Icon name="mapPin" size={14} className="text-(--p-accent)" /> {page.places.join(", ")}
                </span>
              ) : null}
              <span className="font-semibold text-[#15803d]">Book direct with the host</span>
            </p>
            {page.description ? <p className="mt-3 max-w-3xl whitespace-pre-line leading-relaxed text-(--p-muted)">{page.description}</p> : null}
          </div>
        </div>
      </section>

      <main id="stays" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 pb-16 pt-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-[1.375rem] font-extrabold tracking-[-0.01em]">Choose a stay</h2>
          {page.places.length > 1 ? (
            <div role="group" aria-label="Filter by place" className="flex flex-wrap gap-2">
              <Chip active={place === null} onClick={() => setPlace(null)}>All</Chip>
              {page.places.map((city) => (
                <Chip key={city} active={place === city} onClick={() => setPlace(city)}>{city}</Chip>
              ))}
            </div>
          ) : null}
        </div>

        <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((property) => (
            <li key={property.slug}>
              <StayCard property={property} priceFormat={page.price_format} />
            </li>
          ))}
        </ul>
      </main>

      <footer className="mt-auto border-t border-(--p-line)">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-[0.8125rem] text-(--p-muted) sm:px-6">
          <p>© {page.name}</p>
          <p>© {new Date().getFullYear()} All Rights Reserved | Website by PHPJabbers</p>
        </div>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------ small parts */

function Mark({ name, logo, className }: { name: string; logo: string | null; className?: string }) {
  if (logo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logo} alt="" className={cn("rounded-[0.5rem] object-contain", className)} />;
  }
  return (
    <span aria-hidden="true" className={cn("grid place-items-center rounded-[0.5rem] bg-(--p-brand) font-heading font-bold text-white", className)}>
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-[0.8125rem] font-semibold transition-colors",
        active ? "border-(--p-accent) bg-(--p-soft) text-(--p-accent)" : "border-(--p-line) bg-(--p-card) hover:border-(--p-accent)",
      )}
    >
      {children}
    </button>
  );
}

function StayCard({ property, priceFormat }: { property: CompanyPageProperty; priceFormat: PriceFormat }) {
  const where = [property.location.city, property.location.state].filter(Boolean).join(", ") || property.location.country;
  const unit = property.price_based_on === "days" ? "day" : "night";
  const facts: [IconName, string][] = [];
  if (property.bedrooms) facts.push(["bed", plural(property.bedrooms, "bedroom", "bedrooms")]);
  if (property.bathrooms) facts.push(["bath", plural(property.bathrooms, "bath", "baths")]);
  if (property.max_guests) facts.push(["users", plural(property.max_guests, "guest", "guests")]);

  return (
    <Link
      href={`/property/${property.slug}`}
      className={cn(card, "group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-[0_12px_30px_rgba(17,24,39,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--p-accent)")}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-(--p-soft)">
        {property.photo ? (
          <SafeImage src={property.photo} alt={property.name} fill sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-(--p-accent)">
            <Icon name="home" size={34} />
          </span>
        )}
        {property.property_type ? (
          <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-0.5 text-[0.75rem] font-bold text-[#1d2250] shadow-sm">
            {capitalize(property.property_type)}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-heading text-[1.0625rem] font-bold leading-snug">{property.name}</h3>
        {where ? (
          <p className="mt-0.5 flex items-center gap-1 text-[0.8125rem] text-(--p-muted)">
            <Icon name="mapPin" size={13} className="shrink-0 text-(--p-accent)" /> <span className="truncate">{where}</span>
          </p>
        ) : null}
        {property.headline ? <p className="mt-2 line-clamp-2 text-[0.875rem] text-(--p-muted)">{property.headline}</p> : null}
        {facts.length > 0 ? (
          <ul className="mb-4 mt-3 flex flex-wrap gap-x-3.5 gap-y-1 text-[0.8125rem]">
            {facts.map(([icon, label]) => (
              <li key={label} className="inline-flex items-center gap-1.5">
                <Icon name={icon} size={14} className="text-(--p-muted)" /> {label}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-(--p-line) pt-3">
          {property.price !== null ? (
            <p className="text-[0.8125rem] text-(--p-muted)">
              {property.price_varies ? "From " : ""}
              <strong className="font-heading text-[1.125rem] text-(--p-price)">
                {formatAdminPrice(property.price, property.currency_sign || property.currency, priceFormat)}
              </strong>{" "}
              / {unit}
            </p>
          ) : (
            <p className="text-[0.8125rem] text-(--p-muted)">Ask the host for prices</p>
          )}
          <span className="inline-flex shrink-0 items-center gap-1 text-[0.875rem] font-bold text-(--p-accent)">
            View stay <Icon name="arrowRight" size={15} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
