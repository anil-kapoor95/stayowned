"use client";

import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Icon, type IconName } from "@/components/ui/Icon";
import { SafeImage } from "@/components/ui/SafeImage";
import { AMENITIES, AMENITY_FEATURE_NAMES, amenityKey } from "@/data/amenities";
import type { PropertyPageData } from "@/lib/api/property-page";
import { formatAdminPrice } from "@/lib/price-format";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ theme */

/** Colours of the theme the host chose (step 6); the Figma colours when there is none. */
const DEFAULT_COLORS = {
  brand: "#1d2250",
  accent: "#ee5a24",
  text: "#1d2250",
  background: "#ffffff",
  price: "#1d2250",
  page_background: "#fdfcf8",
};

function themeStyle(page: PropertyPageData): CSSProperties {
  const c = page.theme?.colors ?? DEFAULT_COLORS;
  return {
    "--p-brand": c.brand,
    "--p-accent": c.accent,
    "--p-text": c.text,
    "--p-card": c.background,
    "--p-price": c.price,
    "--p-page": c.page_background,
    "--p-soft": `color-mix(in srgb, ${c.accent} 9%, ${c.background})`,
    "--p-line": `color-mix(in srgb, ${c.text} 12%, transparent)`,
    "--p-muted": `color-mix(in srgb, ${c.text} 62%, ${c.page_background})`,
    // global heading colour (h1–h3) follows the theme too
    "--color-heading": c.text,
  } as CSSProperties;
}

const card = "rounded-[1rem] border border-(--p-line) bg-(--p-card)";
const accentButton =
  "inline-flex items-center justify-center gap-2 rounded-[0.625rem] bg-(--p-accent) px-5 font-heading font-bold text-white transition-[filter] hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--p-accent) focus-visible:ring-offset-2";

/* ------------------------------------------------------------------ dates */

const DAY = 86_400_000;
const iso = (date: Date) => date.toISOString().slice(0, 10);
const parse = (value: string) => new Date(`${value}T00:00:00Z`);
const addDays = (value: string, days: number) => iso(new Date(parse(value).getTime() + days * DAY));
const daysBetween = (from: string, to: string) => Math.round((parse(to).getTime() - parse(from).getTime()) / DAY);
const fmtDay = (value: string) =>
  parse(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const todayIso = () => {
  const now = new Date();
  return iso(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())));
};

/* --------------------------------------------------------------- amenities */

const AMENITY_ICONS = new Map<string, IconName>();
for (const amenity of AMENITIES) {
  AMENITY_ICONS.set(amenityKey(amenity.label), amenity.icon as IconName);
  AMENITY_ICONS.set(amenityKey(AMENITY_FEATURE_NAMES[amenity.id]), amenity.icon as IconName);
}
const AMENITY_WORDS: [RegExp, IconName][] = [
  [/pool|swim/i, "waves"],
  [/wi-?fi|internet/i, "wifi"],
  [/air|a\/c/i, "snowflake"],
  [/kitchen|cook/i, "utensils"],
  [/work|desk/i, "monitor"],
  [/park|garage/i, "parking"],
  [/power|inverter|generator/i, "zap"],
  [/pet|dog/i, "paw"],
  [/wash|laundry|dryer/i, "washer"],
  [/clean|housekeep/i, "sparkles"],
  [/chef|breakfast|meal/i, "chefHat"],
  [/bbq|barbe|grill|fire/i, "flame"],
];
function amenityIcon(name: string): IconName {
  return AMENITY_ICONS.get(amenityKey(name)) ?? AMENITY_WORDS.find(([re]) => re.test(name))?.[1] ?? "check";
}

/* ------------------------------------------------------------------- page */

export function PropertyWebsite({ page }: { page: PropertyPageData }) {
  const perDay = page.price_based_on === "days";
  const unit = perDay ? "day" : "night";
  const sign = page.currency_sign || page.currency;
  const money = (amount: number) => formatAdminPrice(amount, sign, page.price_format);
  const place = [page.location.city, page.location.state, page.location.country].filter(Boolean).join(", ");
  const typeLabel = page.property_type ? page.property_type.charAt(0).toUpperCase() + page.property_type.slice(1) : null;

  // Dates chosen on the calendar or in the booking card
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [guests, setGuests] = useState(1);
  const today = todayIso();

  /** Is this day taken? Per night: the check-out day of a booking is free again; per day: it is taken. */
  const taken = useMemo(() => {
    const ranges = page.booked.map((b) => [b.from, b.to] as const);
    return (day: string) => ranges.some(([from, to]) => from <= day && (perDay ? day <= to : day < to));
  }, [page.booked, perDay]);

  const units = checkIn && checkOut ? (perDay ? daysBetween(checkIn, checkOut) + 1 : daysBetween(checkIn, checkOut)) : 0;
  const rangeFree = useMemo(() => {
    if (!checkIn || !checkOut) return null;
    const last = perDay ? checkOut : addDays(checkOut, -1);
    for (let day = checkIn; day <= last; day = addDays(day, 1)) if (taken(day)) return false;
    return true;
  }, [checkIn, checkOut, perDay, taken]);

  /** First click: check-in; second click (a later day): check-out. Taken days can only be a check-out (per night). */
  function pickDay(day: string) {
    if (day < today) return;
    const startAgain = !checkIn || Boolean(checkOut) || day < checkIn || (!perDay && day === checkIn);
    if (startAgain) {
      if (taken(day)) return;
      setCheckIn(day);
      setCheckOut(null);
      return;
    }
    setCheckOut(day);
  }

  const whatsapp = page.host.phone.replace(/\D/g, "");
  const whatsappText = encodeURIComponent(
    `Hi, I'm interested in ${page.name}` +
      (checkIn && checkOut ? ` from ${fmtDay(checkIn)} to ${fmtDay(checkOut)}` : "") +
      ` for ${guests} ${guests === 1 ? "guest" : "guests"}.`,
  );

  const photos = page.photos;
  const [photoIndex, setPhotoIndex] = useState<number | null>(null);

  return (
    <div style={themeStyle(page)} className="flex flex-1 flex-col bg-(--p-page) text-(--p-text)">
      <p className="bg-(--p-brand) py-2 text-center text-[0.75rem] font-medium text-white/80">
        <span aria-hidden="true" className="mr-1.5 inline-block size-1.5 rounded-full bg-(--p-accent) align-middle" />
        Designed by <strong className="text-white">PHPJabbers</strong>
      </p>

      <header className="sticky top-0 z-30 border-b border-(--p-line) bg-(--p-card)/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <a href="#overview" className="flex min-w-0 items-center gap-2.5">
            {page.host.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={page.host.logo} alt="" className="size-9 shrink-0 rounded-[0.5rem] object-contain" />
            ) : (
              <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-[0.5rem] bg-(--p-brand) font-heading text-[0.875rem] font-bold text-white">
                {page.name.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="truncate font-heading text-[1.125rem] font-bold">{page.name}</span>
          </a>
          <nav aria-label="Sections" className="hidden items-center gap-7 text-[0.9375rem] font-medium md:flex">
            <a href="#overview" className="hover:text-(--p-accent)">Overview</a>
            {page.amenities.length > 0 ? <a href="#amenities" className="hover:text-(--p-accent)">Amenities</a> : null}
            <a href="#location" className="hover:text-(--p-accent)">Location</a>
            {page.faqs.length > 0 ? <a href="#faq" className="hover:text-(--p-accent)">FAQ</a> : null}
          </nav>
          <a href="#book" className={cn(accentButton, "h-10 shrink-0 text-[0.875rem]")}>Book now</a>
        </div>
      </header>

      <div id="overview" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 pb-16 pt-6 sm:px-6">
        <Gallery photos={photos} name={page.name} label={typeLabel ? `Entire ${typeLabel.toLowerCase()}` : null} onOpen={setPhotoIndex} />

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
          <div className="min-w-0">
            {place ? (
              <p className="inline-flex items-center gap-1.5 rounded-full bg-(--p-soft) px-3 py-1 text-[0.8125rem] font-medium text-(--p-muted)">
                <Icon name="mapPin" size={14} className="text-(--p-accent)" /> {place}
              </p>
            ) : null}
            <h1 className="mt-4 max-w-2xl font-heading text-[2rem] font-extrabold leading-[1.15] tracking-[-0.02em] sm:text-[2.5rem]">
              {page.headline ?? page.name}
            </h1>
            <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.875rem]">
              {page.headline ? <span className="font-semibold">{page.name}</span> : null}
              {page.host.name ? <span className="text-(--p-muted)">Hosted by {page.host.name}</span> : null}
              <span className="font-semibold text-[#15803d]">Book direct with the host</span>
            </p>
            <ul className="mt-5 flex flex-wrap gap-2.5 border-b border-(--p-line) pb-7">
              {page.bedrooms ? <Fact icon="bed">{page.bedrooms} {page.bedrooms === 1 ? "bedroom" : "bedrooms"}</Fact> : null}
              {page.bathrooms ? <Fact icon="bath">{page.bathrooms} {page.bathrooms === 1 ? "bathroom" : "bathrooms"}</Fact> : null}
              {page.max_guests ? <Fact icon="users">Up to {page.max_guests} {page.max_guests === 1 ? "guest" : "guests"}</Fact> : null}
              {typeLabel ? <Fact icon="home">Entire {typeLabel.toLowerCase()}</Fact> : null}
            </ul>

            {page.description ? (
              <Section title="About this stay">
                <div className="grid gap-3 text-[1rem] leading-relaxed text-(--p-muted)">
                  {page.description.split(/\n\s*\n/).map((paragraph, i) => (
                    <p key={i} className="whitespace-pre-line">{paragraph}</p>
                  ))}
                </div>
              </Section>
            ) : null}

            {page.amenities.length > 0 ? (
              <Section id="amenities" title="Amenities">
                <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {page.amenities.map((name) => (
                    <li key={name} className="flex items-center gap-2.5 rounded-[0.75rem] border border-(--p-line) bg-(--p-soft) px-4 py-3 text-[0.9375rem] font-semibold">
                      <Icon name={amenityIcon(name)} size={17} className="shrink-0 text-(--p-accent)" /> {name}
                    </li>
                  ))}
                </ul>
              </Section>
            ) : null}

            <Section title="Availability">
              <AvailabilityCalendar
                today={today}
                taken={taken}
                checkIn={checkIn}
                checkOut={checkOut}
                onPick={pickDay}
                perDay={perDay}
                summary={
                  checkIn && checkOut
                    ? `${units} ${units === 1 ? unit : `${unit}s`} · ${fmtDay(checkIn)} – ${fmtDay(checkOut)}`
                    : checkIn
                      ? `Check-in ${fmtDay(checkIn)} · choose the check-out day`
                      : "Choose your check-in day"
                }
              />
            </Section>

            <Section title="Good to know">
              <ul className="grid gap-3 sm:grid-cols-3">
                {page.max_guests ? <Know icon="users" label="Guests">Up to {page.max_guests}</Know> : null}
                <Know icon="calendar" label="Prices">{page.price_varies ? `Per ${unit}, vary by day` : `Per ${unit}`}</Know>
                {page.host.name ? <Know icon="home" label="Host">{page.host.name}</Know> : null}
              </ul>
            </Section>

            <Section id="location" title="Location">
              <div className={cn(card, "overflow-hidden")}>
                <iframe
                  title={`Map of ${page.name}`}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(
                    page.location.lat !== null && page.location.lng !== null ? `${page.location.lat},${page.location.lng}` : place || page.name,
                  )}&z=13&output=embed`}
                  className="block h-72 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              {place ? (
                <p className="mt-3 flex items-center gap-1.5 text-[0.875rem] text-(--p-muted)">
                  <Icon name="mapPin" size={15} /> {place}
                </p>
              ) : null}
            </Section>

            {page.faqs.length > 0 ? (
              <Section id="faq" title="Questions guests ask">
                <Faqs faqs={page.faqs} />
              </Section>
            ) : null}
          </div>

          <aside id="book" className="scroll-mt-24 lg:row-start-1 lg:col-start-2">
            <div className="rounded-[1.25rem] bg-(--p-brand) p-6 text-white shadow-[0_24px_48px_-24px_rgba(0,0,0,0.45)] lg:sticky lg:top-24">
              <div className="flex items-baseline justify-between gap-3">
                <p>
                  {page.price !== null ? (
                    <>
                      <span className="font-heading text-[1.875rem] font-extrabold">{money(page.price)}</span>
                      <span className="ml-1 text-[0.875rem] text-white/60">/ {unit}</span>
                    </>
                  ) : (
                    <span className="font-heading text-[1.25rem] font-bold">Ask for a price</span>
                  )}
                </p>
              </div>
              {page.price_varies ? <p className="mt-1 text-[0.75rem] text-white/60">From — prices vary by day</p> : null}

              <div className="mt-5 overflow-hidden rounded-[0.875rem] border border-white/20">
                <div className="grid grid-cols-2 divide-x divide-white/20">
                  <DateField label="Check-in" value={checkIn} min={today} onChange={(v) => { setCheckIn(v || null); if (!v || (checkOut && v >= checkOut)) setCheckOut(null); }} />
                  <DateField label="Check-out" value={checkOut} min={checkIn ? addDays(checkIn, perDay ? 0 : 1) : today} onChange={(v) => setCheckOut(v || null)} />
                </div>
                <label className="block border-t border-white/20 px-4 py-3">
                  <span className="block text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-white/60">Guests</span>
                  <select
                    value={guests}
                    onChange={(event) => setGuests(Number(event.target.value))}
                    className="mt-0.5 w-full bg-transparent font-semibold text-white focus:outline-none [&>option]:text-black"
                  >
                    {Array.from({ length: page.max_guests ?? 10 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>
                    ))}
                  </select>
                </label>
              </div>

              {rangeFree !== null ? (
                <p
                  role="status"
                  className={cn(
                    "mt-3 flex items-center gap-2 rounded-[0.625rem] px-3 py-2 text-[0.8125rem] font-semibold",
                    rangeFree ? "bg-white/10 text-[#4ade80]" : "bg-white/10 text-[#fca5a5]",
                  )}
                >
                  <Icon name={rangeFree ? "check" : "alert"} size={15} />
                  {rangeFree ? "Available for your dates" : "Some of these dates are taken"}
                </p>
              ) : null}

              <a href={page.booking_url} target="_blank" rel="noopener noreferrer" className={cn(accentButton, "mt-4 h-12 w-full text-[1rem]")}>
                Book now<span className="sr-only"> (opens the booking calendar in a new tab)</span>
              </a>
              {whatsapp ? (
                <a
                  href={`https://wa.me/${whatsapp}?text=${whatsappText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-[0.625rem] border border-white/25 font-heading text-[0.9375rem] font-semibold text-[#4ade80] hover:bg-white/5"
                >
                  <Icon name="smartphone" size={16} /> Ask on WhatsApp<span className="sr-only"> (opens in a new tab)</span>
                </a>
              ) : null}

              {page.price !== null && units > 0 && rangeFree ? (
                <dl className="mt-5 text-[0.875rem]">
                  <div className="flex justify-between border-b border-white/15 pb-3 text-white/70">
                    <dt>{money(page.price)} × {units} {units === 1 ? unit : `${unit}s`}</dt>
                    <dd>{money(page.price * units)}</dd>
                  </div>
                  <div className="flex justify-between pt-3 font-heading text-[1.0625rem] font-bold">
                    <dt>Total</dt>
                    <dd>{money(page.price * units)}</dd>
                  </div>
                  {page.price_varies ? <p className="mt-1 text-[0.75rem] text-white/60">Estimate: the booking calendar shows the exact price.</p> : null}
                </dl>
              ) : null}
              <p className="mt-5 flex items-center justify-center gap-1.5 text-[0.75rem] text-white/60">
                <Icon name="lock" size={13} /> Book directly with the owner
              </p>
            </div>
          </aside>
        </div>
      </div>

      <footer className="mt-auto border-t border-(--p-line)">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-[0.8125rem] text-(--p-muted) sm:px-6">
          <p>© {page.name}</p>
          <p>© {new Date().getFullYear()} All Rights Reserved | Website by PHPJabbers</p>
        </div>
      </footer>

      <Dialog
        open={photoIndex !== null}
        onClose={() => setPhotoIndex(null)}
        title={`${page.name} — photos`}
        size="xl"
        onKeyDown={(event) => {
          if (photoIndex === null || photos.length < 2) return;
          if (event.key === "ArrowRight") setPhotoIndex((photoIndex + 1) % photos.length);
          if (event.key === "ArrowLeft") setPhotoIndex((photoIndex - 1 + photos.length) % photos.length);
        }}
      >
        {photoIndex !== null && photos[photoIndex] ? (
          <figure>
            <div className="relative aspect-photo overflow-hidden rounded-media bg-surface-muted">
              <SafeImage src={photos[photoIndex].url} alt={`${page.name}, photo ${photoIndex + 1}`} fill sizes="(min-width: 1024px) 960px, 100vw" className="object-contain" />
            </div>
            <figcaption className="mt-3 flex items-center justify-between gap-3 text-small">
              <button type="button" className="font-semibold underline-offset-2 hover:underline disabled:opacity-40" disabled={photos.length < 2} onClick={() => setPhotoIndex((photoIndex - 1 + photos.length) % photos.length)}>
                <Icon name="chevronLeft" size={15} className="inline" /> Previous
              </button>
              <span aria-live="polite" className="tabular-nums">{photoIndex + 1} / {photos.length}</span>
              <button type="button" className="font-semibold underline-offset-2 hover:underline disabled:opacity-40" disabled={photos.length < 2} onClick={() => setPhotoIndex((photoIndex + 1) % photos.length)}>
                Next <Icon name="chevronRight" size={15} className="inline" />
              </button>
            </figcaption>
          </figure>
        ) : null}
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------ small parts */

function Section({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-b border-(--p-line) py-9 last:border-b-0">
      <h2 className="mb-5 font-heading text-[1.5rem] font-extrabold tracking-[-0.01em]">{title}</h2>
      {children}
    </section>
  );
}

function Fact({ icon, children }: { icon: IconName; children: ReactNode }) {
  return (
    <li className="inline-flex items-center gap-2 rounded-full border border-(--p-line) bg-(--p-card) px-4 py-2 text-[0.875rem] font-semibold">
      <Icon name={icon} size={15} className="text-(--p-accent)" /> {children}
    </li>
  );
}

function Know({ icon, label, children }: { icon: IconName; label: string; children: ReactNode }) {
  return (
    <li className={cn(card, "px-4 py-3.5")}>
      <p className="flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-(--p-muted)">
        <Icon name={icon} size={13} className="text-(--p-accent)" /> {label}
      </p>
      <p className="mt-1 font-heading text-[0.9375rem] font-bold">{children}</p>
    </li>
  );
}

function DateField({ label, value, min, onChange }: { label: string; value: string | null; min: string; onChange: (value: string) => void }) {
  return (
    <label className="block px-4 py-3">
      <span className="block text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-white/60">{label}</span>
      <input
        type="date"
        value={value ?? ""}
        min={min}
        onChange={(event) => onChange(event.target.value)}
        className="mt-0.5 w-full bg-transparent font-semibold text-white [color-scheme:dark] focus:outline-none"
      />
    </label>
  );
}

function Gallery({
  photos,
  name,
  label,
  onOpen,
}: {
  photos: PropertyPageData["photos"];
  name: string;
  label: string | null;
  onOpen: (index: number) => void;
}) {
  if (photos.length === 0) {
    return (
      <div className="grid aspect-[21/9] place-items-center rounded-[1.25rem] bg-(--p-soft) text-(--p-muted)">
        <Icon name="image" size={32} />
      </div>
    );
  }
  const [cover, ...rest] = photos;
  const thumbs = rest.slice(0, 4);
  return (
    <div className="relative">
      <div className={cn("grid gap-2.5 overflow-hidden rounded-[1.25rem]", thumbs.length > 0 && "md:grid-cols-4 md:grid-rows-2")}>
        <button
          type="button"
          onClick={() => onOpen(0)}
          aria-label={`Open photo 1 of ${photos.length}`}
          className={cn("relative block aspect-[4/3] overflow-hidden", thumbs.length > 0 ? "md:col-span-2 md:row-span-2 md:aspect-auto md:min-h-[26rem]" : "md:aspect-[21/9]")}
        >
          <SafeImage src={cover.url} alt={name} fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          {label ? (
            <span className="absolute bottom-4 left-4 rounded-full bg-white/95 px-3 py-1.5 text-[0.75rem] font-semibold text-[#1d2250]">{label}</span>
          ) : null}
        </button>
        {thumbs.map((photo, i) => (
          <button
            key={photo.url}
            type="button"
            onClick={() => onOpen(i + 1)}
            aria-label={`Open photo ${i + 2} of ${photos.length}`}
            className={cn(
              "relative hidden overflow-hidden md:block",
              thumbs.length === 1 && "md:col-span-2 md:row-span-2",
              thumbs.length === 2 && "md:col-span-2",
              thumbs.length === 3 && i === 2 && "md:col-span-2",
            )}
          >
            <SafeImage src={photo.thumb_url || photo.url} alt="" fill sizes="25vw" className="object-cover" />
          </button>
        ))}
      </div>
      {photos.length > 1 ? (
        <button
          type="button"
          onClick={() => onOpen(0)}
          className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-[0.625rem] bg-white px-3.5 py-2 text-[0.8125rem] font-semibold text-[#1d2250] shadow-md"
        >
          <Icon name="grip" size={14} /> View all {photos.length} photos
        </button>
      ) : null}
    </div>
  );
}

function AvailabilityCalendar({
  today,
  taken,
  checkIn,
  checkOut,
  onPick,
  perDay,
  summary,
}: {
  today: string;
  taken: (day: string) => boolean;
  checkIn: string | null;
  checkOut: string | null;
  onPick: (day: string) => void;
  perDay: boolean;
  summary: string;
}) {
  const first = parse(today.slice(0, 8) + "01");
  const [offset, setOffset] = useState(0);
  const month = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + offset, 1));
  const days = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0)).getUTCDate();
  const lead = (month.getUTCDay() + 6) % 7; // Monday first
  const title = month.toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
  const cells: (string | null)[] = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => iso(new Date(month.getTime() + i * DAY)))];
  const inRange = (day: string) => Boolean(checkIn && checkOut && day > checkIn && day < checkOut);

  return (
    <div className={cn(card, "p-5 shadow-[0_12px_32px_-24px_rgba(0,0,0,0.35)]")}>
      <div className="flex items-center justify-between">
        <p className="font-heading text-[1.0625rem] font-bold" aria-live="polite">{title}</p>
        <div className="flex gap-2">
          <button type="button" onClick={() => setOffset((n) => n - 1)} disabled={offset === 0} aria-label="Previous month" className="grid size-8 place-items-center rounded-full border border-(--p-line) disabled:opacity-30">
            <Icon name="chevronLeft" size={15} />
          </button>
          <button type="button" onClick={() => setOffset((n) => n + 1)} disabled={offset >= 11} aria-label="Next month" className="grid size-8 place-items-center rounded-full border border-(--p-line) disabled:opacity-30">
            <Icon name="chevronRight" size={15} />
          </button>
        </div>
      </div>
      <div role="grid" aria-label={title} className="mt-4 grid grid-cols-7 gap-1 text-center text-[0.875rem]">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span key={i} role="columnheader" className="pb-2 text-[0.6875rem] font-semibold text-(--p-muted)">{d}</span>
        ))}
        {cells.map((day, i) => {
          if (!day) return <span key={`e${i}`} />;
          const past = day < today;
          const busy = !past && taken(day);
          const edge = day === checkIn || day === checkOut;
          const between = inRange(day);
          return (
            <button
              key={day}
              type="button"
              disabled={past || (busy && !(checkIn && !checkOut && !perDay))}
              onClick={() => onPick(day)}
              aria-pressed={edge || between}
              aria-label={`${fmtDay(day)}${busy ? ", taken" : ""}`}
              className={cn(
                "h-10 rounded-[0.5rem] font-semibold transition-colors",
                past && "text-(--p-muted) opacity-40",
                busy && "bg-[color-mix(in_srgb,var(--p-text)_6%,transparent)] text-(--p-muted) line-through",
                !past && !busy && !edge && !between && "hover:bg-(--p-soft)",
                between && "bg-(--p-soft) text-(--p-accent)",
                edge && "bg-(--p-accent) text-white",
              )}
            >
              {Number(day.slice(8))}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-(--p-line) pt-4 text-[0.75rem] text-(--p-muted)">
        <span className="flex flex-wrap gap-4">
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-(--p-accent)" /> Your dates</span>
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-[color-mix(in_srgb,var(--p-text)_25%,transparent)]" /> Taken</span>
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm border border-(--p-line)" /> Available</span>
        </span>
        <span className="font-semibold text-(--p-text)">{summary}</span>
      </div>
    </div>
  );
}

function Faqs({ faqs }: { faqs: PropertyPageData["faqs"] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <ul className="grid gap-3">
      {faqs.map((faq, i) => {
        const isOpen = open === i;
        return (
          <li key={i} className={cn(card, "transition-colors", isOpen && "border-(--p-accent)")}>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`faq-${i}`}
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-heading text-[0.9375rem] font-bold"
            >
              {faq.question}
              <Icon name={isOpen ? "x" : "plus"} size={16} className="shrink-0 text-(--p-accent)" />
            </button>
            <p id={`faq-${i}`} hidden={!isOpen} className="px-5 pb-4 text-[0.9375rem] leading-relaxed text-(--p-muted)">
              {faq.answer}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
