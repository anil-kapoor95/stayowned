"use client";

import { BrandingBar, BrandingFooter } from "@/features/property-page/Branding";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Icon, type IconName } from "@/components/ui/Icon";
import { SafeImage } from "@/components/ui/SafeImage";
import { AMENITIES, AMENITY_FEATURE_NAMES, amenityKey } from "@/data/amenities";
import type { PropertyPageData } from "@/lib/api/property-page";
import { formatAdminPrice } from "@/lib/price-format";
import { cn } from "@/lib/utils";
import { themeStyle } from "./theme";

/* ------------------------------------------------------------------ theme */

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

/* ------------------------------------------------------------------ texts */

type Tokens = Record<string, string | number>;
export type Translate = (key: string, tokens?: Tokens) => string;

/** Text of a label (System Options > Languages) with its {TOKENS} filled in; the key itself when it is missing. */
function translator(labels: Record<string, string>): Translate {
  return (key, tokens) => {
    let text = labels[key] ?? key;
    for (const [name, value] of Object.entries(tokens ?? {})) text = text.split(`{${name}}`).join(String(value));
    return text;
  };
}

/** Amenities shown before "Show all" (the rest folds away on phones and tablets too). */
const AMENITIES_SHOWN = 12;

/* ------------------------------------------------------------------- page */

export function PropertyWebsite({
  page,
  basePath,
  companyHref,
}: {
  page: PropertyPageData;
  /** Path of this property on the website: "/casanova", or "" when it is the home page of the host's own domain. */
  basePath: string;
  /** Page with all the host's properties ("/stays/<company>", "/" on the host's own domain), null: none. */
  companyHref: string | null;
}) {
  const t = translator(page.labels);
  const perDay = page.price_based_on === "days";
  const unitWord = (n: number) => t(perDay ? (n === 1 ? "site_day" : "site_days") : n === 1 ? "site_night" : "site_nights");
  const sign = page.currency_sign || page.currency;
  const money = (amount: number) => formatAdminPrice(amount, sign, page.price_format);
  const place = [page.location.city, page.location.state, page.location.country].filter(Boolean).join(", ");
  const typeLabel = page.property_type ? t("site_entire", { TYPE: t(`site_type_${page.property_type}`) }) : null;
  const [allAmenities, setAllAmenities] = useState(false);

  // Dates chosen on the calendar or in the booking card
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  // Adults / children as the property's booking form has them (Booking options > Booking form)
  const [adults, setAdults] = useState(page.guests.adults.show ? 1 : 0);
  const [children, setChildren] = useState(0);
  const guests = adults + children;
  const router = useRouter();
  const today = todayIso();

  /** Book now: the booking page of this website; its first step asks for the dates (required there). */
  const bookHref = () => {
    const query = new URLSearchParams();
    if (checkIn && checkOut) {
      query.set("from", checkIn);
      query.set("to", checkOut);
    }
    if (page.guests.adults.show) query.set("adults", String(adults));
    if (page.guests.children.show && children > 0) query.set("children", String(children));
    const qs = query.toString();
    return `${basePath}/book${qs ? `?${qs}` : ""}`;
  };

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
    t("site_whatsapp_text", {
      NAME: page.name,
      DATES: checkIn && checkOut ? t("site_whatsapp_dates", { FROM: fmtDay(checkIn), TO: fmtDay(checkOut) }) : "",
      N: guests,
      GUESTS: t(guests === 1 ? "site_guest_word" : "site_guests_word"),
    }),
  );

  const photos = page.photos;
  const [photoIndex, setPhotoIndex] = useState<number | null>(null);

  return (
    <div style={themeStyle(page.theme)} className="flex flex-1 flex-col bg-(--p-page) text-(--p-text)">
      <BrandingBar show={page.branding} line={page.branding_line} />

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
          <nav aria-label={t("site_nav_sections")} className="hidden items-center gap-7 text-[0.9375rem] font-medium md:flex">
            <a href="#overview" className="hover:text-(--p-accent)">{t("site_nav_overview")}</a>
            {page.amenities.length > 0 ? <a href="#amenities" className="hover:text-(--p-accent)">{t("site_nav_amenities")}</a> : null}
            <a href="#location" className="hover:text-(--p-accent)">{t("site_nav_location")}</a>
            {page.faqs.length > 0 ? <a href="#faq" className="hover:text-(--p-accent)">{t("site_nav_faq")}</a> : null}
          </nav>
          <button type="button" onClick={() => router.push(bookHref())} className={cn(accentButton, "h-10 shrink-0 text-[0.875rem]")}>{page.labels.book_now}</button>
        </div>
      </header>

      <div id="overview" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 pb-16 pt-6 sm:px-6">
        <Gallery photos={photos} name={page.name} label={typeLabel} onOpen={setPhotoIndex} t={t} />

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
              {page.host.name ? (
                <span className="text-(--p-muted)">
                  {t("site_hosted_by")}{" "}
                  {companyHref ? (
                    <Link href={companyHref} className="font-semibold text-(--p-text) underline-offset-2 hover:text-(--p-accent) hover:underline">
                      {page.host.name}
                    </Link>
                  ) : (
                    page.host.name
                  )}
                </span>
              ) : null}
              {companyHref && (page.host.stays ?? 0) > 1 ? (
                <Link href={companyHref} className="inline-flex items-center gap-1 font-semibold text-(--p-accent) hover:underline">
                  {t("site_see_all_stays", { N: page.host.stays ?? 0 })} <Icon name="arrowRight" size={14} />
                </Link>
              ) : null}
              <span className="font-semibold text-[#15803d]">{t("site_book_direct")}</span>
            </p>
            <ul className="mt-5 flex flex-wrap gap-2.5 border-b border-(--p-line) pb-7">
              {page.bedrooms ? <Fact icon="bed">{t(page.bedrooms === 1 ? "site_bedroom" : "site_bedrooms", { N: page.bedrooms })}</Fact> : null}
              {page.bathrooms ? <Fact icon="bath">{t(page.bathrooms === 1 ? "site_bathroom" : "site_bathrooms", { N: page.bathrooms })}</Fact> : null}
              {page.max_guests ? <Fact icon="users">{t(page.max_guests === 1 ? "site_up_to_guest" : "site_up_to_guests", { N: page.max_guests })}</Fact> : null}
              {typeLabel ? <Fact icon="home">{typeLabel}</Fact> : null}
            </ul>

            {page.description ? (
              <Section title={t("site_about")}>
                <div className="grid gap-3 text-[1rem] leading-relaxed text-(--p-muted)">
                  {page.description.split(/\n\s*\n/).map((paragraph, i) => (
                    <p key={i} className="whitespace-pre-line">{paragraph}</p>
                  ))}
                </div>
              </Section>
            ) : null}

            {page.amenities.length > 0 ? (
              <Section id="amenities" title={t("site_amenities")}>
                {/* two columns on phones, three from tablets; long lists fold after the first ones */}
                <ul className="grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-3">
                  {(allAmenities ? page.amenities : page.amenities.slice(0, AMENITIES_SHOWN)).map((name) => (
                    <li key={name} className="flex min-w-0 items-center gap-2 rounded-[0.75rem] border border-(--p-line) bg-(--p-soft) px-3 py-2.5 text-[0.875rem] font-semibold sm:gap-2.5 sm:px-4 sm:py-3 sm:text-[0.9375rem]">
                      <Icon name={amenityIcon(name)} size={17} className="shrink-0 text-(--p-accent)" /> <span className="min-w-0 break-words">{name}</span>
                    </li>
                  ))}
                </ul>
                {page.amenities.length > AMENITIES_SHOWN ? (
                  <button
                    type="button"
                    aria-expanded={allAmenities}
                    onClick={() => setAllAmenities((v) => !v)}
                    className="mt-4 inline-flex h-11 items-center gap-1.5 rounded-[0.625rem] border border-(--p-line) bg-(--p-card) px-4 font-heading text-[0.9375rem] font-semibold hover:border-(--p-accent)"
                  >
                    {allAmenities ? t("site_show_less") : t("site_show_all_amenities", { N: page.amenities.length })}
                    <Icon name="chevronDown" size={15} className={cn("transition-transform", allAmenities && "rotate-180")} />
                  </button>
                ) : null}
              </Section>
            ) : null}

            <Section title={t("site_availability")}>
              <AvailabilityCalendar
                today={today}
                taken={taken}
                checkIn={checkIn}
                checkOut={checkOut}
                onPick={pickDay}
                perDay={perDay}
                t={t}
                summary={
                  checkIn && checkOut
                    ? t("site_cal_summary", { N: units, UNIT: unitWord(units), FROM: fmtDay(checkIn), TO: fmtDay(checkOut) })
                    : checkIn
                      ? t("site_cal_pick_out", { DATE: fmtDay(checkIn) })
                      : t("site_cal_pick_in")
                }
              />
            </Section>

            <Section title={t("site_good_to_know")}>
              <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
                {page.max_guests ? <Know icon="users" label={t("site_guests")}>{t("site_up_to", { N: page.max_guests })}</Know> : null}
                <Know icon="calendar" label={t("site_prices")}>
                  {t(perDay ? (page.price_varies ? "site_per_day_varies" : "site_per_day") : page.price_varies ? "site_per_night_varies" : "site_per_night")}
                </Know>
                {page.host.name ? <Know icon="home" label={t("site_host")}>{page.host.name}</Know> : null}
              </ul>
            </Section>

            <Section id="location" title={t("site_location")}>
              <div className={cn(card, "overflow-hidden")}>
                <iframe
                  title={t("site_map_of", { NAME: page.name })}
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
              <Section id="faq" title={t("site_faq")}>
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
                      <span className="ml-1 text-[0.875rem] text-white/60">/ {unitWord(1)}</span>
                    </>
                  ) : (
                    <span className="font-heading text-[1.25rem] font-bold">{t("site_price_on_request")}</span>
                  )}
                </p>
              </div>
              {page.price_varies ? <p className="mt-1 text-[0.75rem] text-white/60">{t("site_price_from")}</p> : null}

              <div className="mt-5 overflow-hidden rounded-[0.875rem] border border-white/20">
                <div className="grid grid-cols-2 divide-x divide-white/20">
                  <DateField label={page.labels.check_in} value={checkIn} min={today} onChange={(v) => { setCheckIn(v || null); if (!v || (checkOut && v >= checkOut)) setCheckOut(null); }} />
                  <DateField label={page.labels.check_out} value={checkOut} min={checkIn ? addDays(checkIn, perDay ? 0 : 1) : today} onChange={(v) => setCheckOut(v || null)} />
                </div>
                {page.guests.adults.show || page.guests.children.show ? (
                  <div className="grid grid-cols-2 divide-x divide-white/20 border-t border-white/20">
                    {page.guests.adults.show ? (
                      <GuestSelect label={page.labels.adults} value={adults} min={1} max={page.guests.adults.max} onChange={setAdults} />
                    ) : null}
                    {page.guests.children.show && page.guests.children.max > 0 ? (
                      <GuestSelect label={page.labels.children} value={children} min={0} max={page.guests.children.max} onChange={setChildren} />
                    ) : null}
                  </div>
                ) : null}
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
                  {rangeFree ? t("site_dates_free") : t("site_dates_taken")}
                </p>
              ) : null}

              <button type="button" onClick={() => router.push(bookHref())} disabled={rangeFree === false} className={cn(accentButton, "mt-4 h-12 w-full text-[1rem] disabled:cursor-not-allowed disabled:opacity-50")}>
                {page.labels.book_now}
              </button>
              {whatsapp ? (
                <a
                  href={`https://wa.me/${whatsapp}?text=${whatsappText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-[0.625rem] border border-white/25 font-heading text-[0.9375rem] font-semibold text-[#4ade80] hover:bg-white/5"
                >
                  <Icon name="smartphone" size={16} /> {t("site_whatsapp")}<span className="sr-only"> {t("site_new_tab")}</span>
                </a>
              ) : null}

              {page.price !== null && units > 0 && rangeFree ? (
                <dl className="mt-5 text-[0.875rem]">
                  <div className="flex justify-between border-b border-white/15 pb-3 text-white/70">
                    <dt>{money(page.price)} × {units} {unitWord(units)}</dt>
                    <dd>{money(page.price * units)}</dd>
                  </div>
                  <div className="flex justify-between pt-3 font-heading text-[1.0625rem] font-bold">
                    <dt>{t("site_total")}</dt>
                    <dd>{money(page.price * units)}</dd>
                  </div>
                  {page.price_varies ? <p className="mt-1 text-[0.75rem] text-white/60">{t("site_estimate")}</p> : null}
                </dl>
              ) : null}
              <p className="mt-5 flex items-center justify-center gap-1.5 text-[0.75rem] text-white/60">
                <Icon name="lock" size={13} /> {t("site_book_direct_owner")}
              </p>
            </div>
          </aside>
        </div>
      </div>

      <footer className="mt-auto border-t border-(--p-line)">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-[0.8125rem] text-(--p-muted) sm:px-6">
          <p>© {page.name}</p>
          <p>
            © {new Date().getFullYear()} {t("site_rights")}
            <BrandingFooter show={page.branding} line={page.branding_line} />
          </p>
        </div>
      </footer>

      <Dialog
        open={photoIndex !== null}
        onClose={() => setPhotoIndex(null)}
        title={t("site_photos_title", { NAME: page.name })}
        size="xl"
        onKeyDown={(event) => {
          if (photoIndex === null || photos.length < 2) return;
          if (event.key === "ArrowRight") setPhotoIndex((photoIndex + 1) % photos.length);
          if (event.key === "ArrowLeft") setPhotoIndex((photoIndex - 1 + photos.length) % photos.length);
        }}
      >
        {photoIndex !== null && photos[photoIndex] ? (
          <figure>
            {/* The whole photo fits the screen (no scrolling); arrows sit on its left and right middle */}
            <div className="relative h-[calc(100dvh-13rem)] max-h-[44rem] min-h-[14rem] overflow-hidden rounded-media bg-[#111827]">
              <SafeImage src={photos[photoIndex].url} alt={t("site_photo_alt", { NAME: page.name, N: photoIndex + 1 })} fill sizes="(min-width: 1024px) 960px, 100vw" className="object-contain" />
              {photos.length > 1 ? (
                <>
                  <button
                    type="button"
                    aria-label={t("site_photo_prev")}
                    onClick={() => setPhotoIndex((photoIndex - 1 + photos.length) % photos.length)}
                    className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#111827] shadow-lg transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <Icon name="chevronLeft" size={22} />
                  </button>
                  <button
                    type="button"
                    aria-label={t("site_photo_next")}
                    onClick={() => setPhotoIndex((photoIndex + 1) % photos.length)}
                    className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#111827] shadow-lg transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <Icon name="chevronRight" size={22} />
                  </button>
                </>
              ) : null}
              <span aria-live="polite" className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-[0.8125rem] font-semibold tabular-nums text-white">
                {photoIndex + 1} / {photos.length}
              </span>
            </div>
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

function GuestSelect({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
  return (
    <label className="block min-w-0 px-3 py-3 sm:px-4">
      <span className="block truncate text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-white/60">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-0.5 w-full bg-transparent font-semibold text-white focus:outline-none [&>option]:text-black"
      >
        {Array.from({ length: Math.max(0, max - min + 1) }, (_, i) => min + i).map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
    </label>
  );
}

function DateField({ label, value, min, onChange }: { label: string; value: string | null; min: string; onChange: (value: string) => void }) {
  return (
    <label className="block min-w-0 px-3 py-3 sm:px-4 lg:px-3">
      <span className="block truncate text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-white/60">{label}</span>
      <input
        type="date"
        value={value ?? ""}
        min={min}
        onChange={(event) => onChange(event.target.value)}
        className="mt-0.5 w-full min-w-0 bg-transparent text-[0.875rem] font-semibold text-white [color-scheme:dark] focus:outline-none sm:text-[0.9375rem] lg:text-[0.875rem]"
      />
    </label>
  );
}

function Gallery({
  photos,
  name,
  label,
  onOpen,
  t,
}: {
  photos: PropertyPageData["photos"];
  name: string;
  label: string | null;
  onOpen: (index: number) => void;
  t: Translate;
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
          aria-label={t("site_open_photo", { N: 1, T: photos.length })}
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
            aria-label={t("site_open_photo", { N: i + 2, T: photos.length })}
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
          <Icon name="grip" size={14} /> {t("site_view_all_photos", { N: photos.length })}
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
  t,
}: {
  today: string;
  taken: (day: string) => boolean;
  checkIn: string | null;
  checkOut: string | null;
  onPick: (day: string) => void;
  perDay: boolean;
  summary: string;
  t: Translate;
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
          <button type="button" onClick={() => setOffset((n) => n - 1)} disabled={offset === 0} aria-label={t("site_cal_prev")} className="grid size-8 place-items-center rounded-full border border-(--p-line) disabled:opacity-30">
            <Icon name="chevronLeft" size={15} />
          </button>
          <button type="button" onClick={() => setOffset((n) => n + 1)} disabled={offset >= 11} aria-label={t("site_cal_next")} className="grid size-8 place-items-center rounded-full border border-(--p-line) disabled:opacity-30">
            <Icon name="chevronRight" size={15} />
          </button>
        </div>
      </div>
      <div role="grid" aria-label={title} className="mt-4 grid grid-cols-7 gap-1 text-center text-[0.875rem]">
        {t("site_cal_weekdays").split(/\s+/).slice(0, 7).map((d, i) => (
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
              aria-label={`${fmtDay(day)}${busy ? `, ${t("site_cal_taken")}` : ""}`}
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
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-(--p-accent)" /> {t("site_cal_your_dates")}</span>
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-[color-mix(in_srgb,var(--p-text)_25%,transparent)]" /> {t("site_cal_taken")}</span>
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm border border-(--p-line)" /> {t("site_cal_available")}</span>
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
