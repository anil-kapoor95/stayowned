"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import { SafeImage } from "@/components/ui/SafeImage";
import { themeStyle } from "@/features/property-page/theme";
import {
  bookingApi,
  label,
  type BookingQuote,
  type BookingRequest,
  type BookingSetup,
} from "@/lib/api/booking";
import { formatAdminPrice } from "@/lib/price-format";
import { cn } from "@/lib/utils";

type Step = "stay" | "extras" | "details" | "payment";

const card = "rounded-[1rem] border border-(--p-line) bg-(--p-card)";
const accentButton =
  "inline-flex items-center justify-center gap-2 rounded-[0.75rem] bg-(--p-accent) px-6 font-heading font-bold text-white transition-[filter] hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--p-accent) focus-visible:ring-offset-2";
const ghostButton =
  "inline-flex items-center justify-center gap-2 rounded-[0.75rem] border border-(--p-line) bg-(--p-card) px-5 font-heading font-semibold hover:border-(--p-accent) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--p-accent)";
const inputClass =
  "h-12 w-full rounded-[0.75rem] border border-(--p-line) bg-white px-3.5 text-[0.9375rem] text-[#1f2937] focus:border-(--p-accent) focus:outline-none focus:ring-2 focus:ring-(--p-accent)/25";
const fieldLabel = "mb-1.5 block text-[0.75rem] font-bold uppercase tracking-[0.06em] text-(--p-muted)";

const todayIso = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())).toISOString().slice(0, 10);
};
const fmtDay = (value: string) =>
  new Date(`${value}T00:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const isDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

type FlowProps = {
  setup: BookingSetup;
  initial: Partial<BookingRequest>;
  /** Path of the property on this website: "/casanova", or "" when it is the home page of the host's own domain. */
  basePath: string;
};

/**
 * Booking on the host's website: 4 steps, everything from the property's settings in the back office.
 *
 * Next.js keeps visited pages alive (hidden) and shows them again on "Back" / "Book now". So a finished booking
 * would come back on its last step ("Payment", button still busy). A new booking starts fresh:
 *  - after a booking was sent, the flow is reset as soon as the page is left;
 *  - other dates or guests from the property page (?from=&to=&adults=&children=) also start a new booking.
 */
export function BookingFlow(props: FlowProps) {
  const [session, setSession] = useState(0);
  const finished = useRef(false);
  useEffect(
    () => () => {
      // the page is left (hidden): a finished booking is not shown again
      if (finished.current) {
        finished.current = false;
        setSession((n) => n + 1);
      }
    },
    [],
  );
  const initialKey = JSON.stringify(props.initial);
  return (
    <BookingSession
      key={`${session}|${initialKey}`}
      {...props}
      onFinished={() => {
        finished.current = true;
      }}
    />
  );
}

function BookingSession({ setup, initial, basePath, onFinished }: FlowProps & { onFinished: () => void }) {
  const router = useRouter();
  const t = (key: string, tokens?: Record<string, string | number>) => label(setup.labels, key, tokens);
  const p = setup.property;
  const money = (amount: number) => formatAdminPrice(amount, p.currency_sign || p.currency, p.price_format);
  const perDay = p.price_based_on === "days";
  const unitLabel = (n: number) => t(perDay ? (n === 1 ? "bf_day" : "bf_days") : n === 1 ? "bf_night" : "bf_nights");

  // Steps: extras only when the property has extras or coupons
  const steps = useMemo<Step[]>(
    () => (setup.extras.length > 0 || setup.coupons ? ["stay", "extras", "details", "payment"] : ["stay", "details", "payment"]),
    [setup.extras.length, setup.coupons],
  );
  const stepLabel: Record<Step, string> = {
    stay: t("book_step_stay"),
    extras: t("book_step_extras"),
    details: t("book_step_details"),
    payment: t("book_step_payment"),
  };
  const [step, setStep] = useState<Step>("stay");
  const stepIndex = steps.indexOf(step);

  // The request (dates, guests, extras, coupon) and its price from the back office
  const [request, setRequest] = useState<BookingRequest>(() => ({
    date_from: initial.date_from && isDate(initial.date_from) ? initial.date_from : "",
    date_to: initial.date_to && isDate(initial.date_to) ? initial.date_to : "",
    adults: Math.min(setup.guests.adults.max, Math.max(setup.guests.adults.show ? 1 : 0, initial.adults ?? 1)),
    children: Math.min(setup.guests.children.max, Math.max(0, initial.children ?? 0)),
    extras: Object.fromEntries(setup.extras.filter((e) => e.required).map((e) => [e.id, 1])),
    promo_code: "",
  }));
  const requestKey = JSON.stringify(request);
  const [quote, setQuote] = useState<{ key: string; data: BookingQuote | null; error: string } | null>(null);
  const datesChosen = isDate(request.date_from) && isDate(request.date_to);
  useEffect(() => {
    if (!datesChosen) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void bookingApi
        .quote(setup.slug, request, controller.signal)
        .then((result) => {
          setQuote(result.ok ? { key: requestKey, data: result.data, error: "" } : { key: requestKey, data: null, error: result.message });
        })
        .catch(() => undefined);
    }, 250);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [datesChosen, request, requestKey, setup.slug]);
  const current = quote && quote.key === requestKey ? quote : null;
  const checking = datesChosen && !current;
  const priced = current?.data ?? null;
  const update = (patch: Partial<BookingRequest>) => setRequest((r) => ({ ...r, ...patch }));

  // Guest details and payment
  const [details, setDetails] = useState<Record<string, string>>({});
  const [method, setMethod] = useState(setup.payment_methods[0]?.id ?? "");
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [coupon, setCoupon] = useState("");

  function go(next: Step) {
    setStep(next);
    setFormError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  const next = () => go(steps[Math.min(steps.length - 1, stepIndex + 1)]);
  const back = () => go(steps[Math.max(0, stepIndex - 1)]);

  function continueStay() {
    if (!datesChosen) {
      setErrors({ dates: t("book_choose_dates") });
      document.getElementById("book-date_from")?.focus();
      return;
    }
    if (priced) next();
  }

  function validateDetails() {
    const found: Record<string, string> = {};
    for (const field of setup.fields) {
      const value = (details[field.name] ?? "").trim();
      if (field.required && !value) found[field.name] = t("book_err_required");
      else if (value && field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) found[field.name] = t("book_err_email");
    }
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) document.getElementById(`book-${first}`)?.focus();
    return !first;
  }

  const payNow = priced?.deposit ?? 0;
  const needsPayment = payNow > 0;

  async function confirm() {
    const found: Record<string, string> = {};
    if (needsPayment && !method) found.payment_method = t("book_err_payment");
    if (setup.terms?.required && !terms) found.terms = t("book_err_terms");
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setSubmitting(true);
    setFormError("");
    const result = await bookingApi.create(setup.slug, request, details, needsPayment ? method : "", terms);
    if (!result.ok) {
      setSubmitting(false);
      setErrors(result.errors);
      if (result.errors.dates) {
        go("stay");
        return;
      }
      if (setup.fields.some((f) => result.errors[f.name])) {
        go("details");
        return;
      }
      setFormError(result.message);
      return;
    }
    const { payment, reference, key } = result.data;
    onFinished();
    if (payment.online && payment.pay_url) {
      window.location.assign(payment.pay_url);
      return;
    }
    router.push(`${basePath}/book/confirmed?ref=${encodeURIComponent(reference)}&key=${encodeURIComponent(key)}`);
  }

  const termsText = setup.terms
    ? setup.terms.label.split("%s").map((part, i) =>
        i === 1 ? (
          setup.terms?.url ? (
            <a key={i} href={setup.terms.url} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
              {part}
            </a>
          ) : (
            <span key={i} className="font-semibold">{part}</span>
          )
        ) : (
          <span key={i}>{part}</span>
        ),
      )
    : null;

  const nights = priced?.nights ?? 0;
  const primary = (() => {
    switch (step) {
      case "stay":
        return { text: t("book_continue"), action: continueStay, disabled: datesChosen && !priced };
      case "extras":
        return { text: t("book_continue"), action: next, disabled: !priced };
      case "details":
        return { text: t("book_continue_payment"), action: () => validateDetails() && next(), disabled: false };
      default:
        return {
          text: submitting ? "…" : needsPayment ? t("book_confirm_pay", { AMOUNT: money(payNow) }) : t("book_confirm"),
          action: () => void confirm(),
          disabled: submitting || !priced,
        };
    }
  })();

  return (
    <div style={themeStyle(p.theme)} className="flex flex-1 flex-col bg-(--p-page) pb-28 text-(--p-text) lg:pb-0">
      <header className="sticky top-0 z-30 border-b border-(--p-line) bg-(--p-card)/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <span className="flex min-w-0 items-center gap-2.5">
            {p.host.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.host.logo} alt="" className="size-9 shrink-0 rounded-[0.5rem] object-contain" />
            ) : (
              <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-[0.5rem] bg-(--p-brand) font-heading text-[0.875rem] font-bold text-white">
                {p.name.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="truncate font-heading text-[1.0625rem] font-bold">{p.name}</span>
          </span>
          <Link href={basePath || "/"} className="inline-flex shrink-0 items-center gap-1 text-[0.875rem] font-semibold text-(--p-accent) hover:underline">
            <Icon name="chevronLeft" size={15} /> {t("book_back_to_property")}
          </Link>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-6xl gap-7 px-4 py-7 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0">
          {/* phones: one row, only the current step shows its name */}
          <ol className="mb-5 flex gap-2 sm:flex-wrap">
            {steps.map((s, i) => {
              const done = i < stepIndex;
              const now = s === step;
              return (
                <li key={s}>
                  <button
                    type="button"
                    disabled={!done}
                    onClick={() => done && go(s)}
                    aria-current={now ? "step" : undefined}
                    className={cn(
                      "flex items-center gap-2 rounded-full border p-1.5 text-[0.8125rem] font-semibold sm:px-2 sm:pr-3.5",
                      now && "pr-3.5",
                      now && "border-(--p-accent) bg-(--p-accent) text-white",
                      done && "border-(--p-line) bg-(--p-card) text-[#15803d] hover:border-[#15803d]",
                      !now && !done && "border-(--p-line) bg-(--p-card) text-(--p-muted)",
                    )}
                  >
                    <span className={cn("grid size-6 place-items-center rounded-full text-[0.75rem]", now ? "bg-white/25" : done ? "bg-[#dcfce7]" : "bg-(--p-soft)")}>
                      {done ? <Icon name="check" size={13} /> : i + 1}
                    </span>
                    <span className={cn(!now && "sr-only sm:not-sr-only")}>{stepLabel[s]}</span>
                  </button>
                </li>
              );
            })}
          </ol>

          <section className={cn(card, "p-5 sm:p-7")}>
            {step === "stay" ? (
              <>
                <StepTitle title={t("book_title_stay")} desc={t("book_desc_stay")} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <DateField
                    id="book-date_from"
                    label={t("book_check_in")}
                    value={request.date_from ? fmtDay(request.date_from) : ""}
                    placeholder={t("book_cal_pick_in")}
                    error={Boolean(errors.dates) && !isDate(request.date_from)}
                  />
                  <DateField
                    id="book-date_to"
                    label={t("book_check_out")}
                    value={request.date_to ? fmtDay(request.date_to) : ""}
                    placeholder={request.date_from ? t("book_cal_pick_out") : t("book_check_out")}
                    error={Boolean(errors.dates) && !isDate(request.date_to)}
                  />
                </div>
                {errors.dates ? <FieldError>{errors.dates}</FieldError> : null}
                <div className="mt-4" id="book-calendar">
                  <AvailabilityCalendar
                    taken={setup.booked}
                    perDay={perDay}
                    weekStart={setup.week_start ?? 1}
                    today={todayIso()}
                    from={request.date_from}
                    to={request.date_to}
                    invalid={Boolean(errors.dates) && !datesChosen}
                    t={(key) => t(key)}
                    onChange={(from, to) => {
                      setErrors({});
                      update({ date_from: from, date_to: to });
                    }}
                  />
                </div>

                <div className="mt-6 divide-y divide-(--p-line)">
                  {setup.guests.adults.show ? (
                    <CounterRow
                      title={t("bf_adults")}
                      hint={t("book_adults_hint")}
                      value={request.adults}
                      min={setup.guests.adults.required ? 1 : 0}
                      max={setup.guests.adults.max}
                      onChange={(v) => update({ adults: v })}
                    />
                  ) : null}
                  {setup.guests.children.show && setup.guests.children.max > 0 ? (
                    <CounterRow
                      title={t("bf_children")}
                      hint={t("book_children_hint")}
                      value={request.children}
                      min={0}
                      max={setup.guests.children.max}
                      onChange={(v) => update({ children: v })}
                    />
                  ) : null}
                </div>

                {datesChosen ? (
                  <p
                    role="status"
                    className={cn(
                      "mt-5 flex items-center gap-2 rounded-[0.75rem] px-4 py-3 text-[0.875rem] font-semibold",
                      checking ? "bg-(--p-soft) text-(--p-muted)" : priced ? "bg-[#ecfdf3] text-[#166534]" : "bg-[#fff7ed] text-[#9a3412]",
                    )}
                  >
                    <Icon name={checking ? "refresh" : priced ? "check" : "alert"} size={16} />
                    {checking ? t("book_checking") : priced ? t("book_available", { N: nights, UNIT: unitLabel(nights) }) : current?.error}
                  </p>
                ) : null}
              </>
            ) : null}

            {step === "extras" ? (
              <>
                <StepTitle title={t("book_title_extras")} desc={t("book_desc_extras")} />
                {setup.extras.length === 0 ? <p className="text-(--p-muted)">{t("book_extras_none")}</p> : null}
                <ul className="grid gap-3">
                  {setup.extras.map((extra) => {
                    const qty = request.extras[extra.id] ?? 0;
                    const on = qty > 0;
                    const setQty = (n: number) => {
                      const extras = { ...request.extras };
                      if (n > 0) extras[extra.id] = n;
                      else delete extras[extra.id];
                      update({ extras });
                    };
                    return (
                      <li key={extra.id} className={cn("flex flex-wrap items-center gap-3 rounded-[0.875rem] border bg-white p-4", on ? "border-(--p-accent) ring-2 ring-(--p-accent)/15" : "border-(--p-line)")}>
                        <div className="min-w-0 flex-1">
                          <p className="font-heading font-bold text-[#1f2937]">{extra.name}</p>
                          <p className="text-[0.8125rem] text-(--p-muted)">
                            {money(extra.price)} · {setup.extra_price_types[extra.price_type] ?? extra.price_type}
                          </p>
                        </div>
                        {extra.required ? (
                          <span className="rounded-full bg-(--p-soft) px-3 py-1 text-[0.8125rem] font-semibold">{t("book_included")}</span>
                        ) : extra.max > 1 ? (
                          <Counter value={qty} min={0} max={extra.max} onChange={setQty} />
                        ) : (
                          <button type="button" onClick={() => setQty(on ? 0 : 1)} className={cn(on ? accentButton : ghostButton, "h-10 text-[0.875rem]")}>
                            {on ? <><Icon name="check" size={15} /> {t("book_remove")}</> : t("book_add")}
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
                {setup.coupons ? (
                  <div className="mt-6">
                    <label htmlFor="book-coupon" className={fieldLabel}>{t("book_coupon")}</label>
                    <div className="flex gap-2">
                      <input
                        id="book-coupon"
                        className={inputClass}
                        value={coupon}
                        onChange={(event) => setCoupon(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            update({ promo_code: coupon.trim() });
                          }
                        }}
                        placeholder={t("front_enter_promo_code")}
                      />
                      <button type="button" className={cn(ghostButton, "h-12 shrink-0")} onClick={() => update({ promo_code: coupon.trim() })}>
                        {t("front_apply_promo_code")}
                      </button>
                    </div>
                    {request.promo_code && priced ? (
                      priced.promo_valid ? (
                        <p className="mt-2 flex items-center gap-1.5 text-[0.8125rem] font-semibold text-[#15803d]"><Icon name="check" size={14} /> {t("book_coupon_applied")}</p>
                      ) : (
                        <FieldError>{priced.promo_error || t("front_invalid_promo_code")}</FieldError>
                      )
                    ) : null}
                  </div>
                ) : null}
              </>
            ) : null}

            {step === "details" ? (
              <>
                <StepTitle title={t("book_title_details")} desc={t("book_desc_details")} />
                <div className="grid gap-4 sm:grid-cols-2">
                  {setup.fields.map((field) => {
                    const id = `book-${field.name}`;
                    const value = details[field.name] ?? "";
                    const set = (v: string) => {
                      setDetails((d) => ({ ...d, [field.name]: v }));
                      if (errors[field.name]) setErrors((e) => ({ ...e, [field.name]: "" }));
                    };
                    const wide = field.type === "textarea" || field.name === "c_address";
                    return (
                      <div key={field.name} className={wide ? "sm:col-span-2" : undefined}>
                        <label htmlFor={id} className={fieldLabel}>
                          {field.label}
                          {field.required ? <span className="text-[#c2410c]"> *</span> : null}
                        </label>
                        {field.type === "textarea" ? (
                          <textarea id={id} rows={4} className={cn(inputClass, "h-auto py-3")} value={value} onChange={(e) => set(e.target.value)} aria-invalid={errors[field.name] ? true : undefined} />
                        ) : field.type === "country" ? (
                          <select id={id} className={inputClass} value={value} onChange={(e) => set(e.target.value)} aria-invalid={errors[field.name] ? true : undefined}>
                            <option value="">—</option>
                            {setup.countries.map((c) => (
                              <option key={c.id} value={c.id}>{c.name ?? c.id}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            id={id}
                            type={field.type}
                            className={inputClass}
                            value={value}
                            onChange={(e) => set(e.target.value)}
                            autoComplete={{ c_name: "name", c_email: "email", c_phone: "tel", c_address: "street-address", c_city: "address-level2", c_state: "address-level1", c_zip: "postal-code" }[field.name]}
                            aria-invalid={errors[field.name] ? true : undefined}
                          />
                        )}
                        {errors[field.name] ? <FieldError>{errors[field.name]}</FieldError> : null}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : null}

            {step === "payment" ? (
              <>
                <StepTitle title={t("book_title_payment")} desc={t("book_desc_payment")} />
                {needsPayment ? (
                  <div role="radiogroup" aria-label={t("book_payment_method")} className="grid gap-3">
                    {setup.payment_methods.map((m) => (
                      <label key={m.id} className={cn("flex cursor-pointer items-center gap-3 rounded-[0.875rem] border bg-white p-4", method === m.id ? "border-(--p-accent) ring-2 ring-(--p-accent)/15" : "border-(--p-line)")}>
                        <input type="radio" name="payment_method" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} className="size-4 accent-(--p-accent)" />
                        <span className="flex-1 font-heading font-bold text-[#1f2937]">{m.title}</span>
                        {m.online ? <span className="flex items-center gap-1 text-[0.75rem] font-semibold text-(--p-muted)"><Icon name="lock" size={13} /> {t("book_secure")}</span> : null}
                      </label>
                    ))}
                    {errors.payment_method ? <FieldError>{errors.payment_method}</FieldError> : null}
                  </div>
                ) : (
                  <p className="rounded-[0.75rem] bg-(--p-soft) px-4 py-3 text-[0.9375rem]">{t("book_no_payment_needed")}</p>
                )}
                {setup.terms ? (
                  <div className="mt-5">
                    <label className="flex items-start gap-3 text-[0.9375rem]">
                      <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-1 size-4 accent-(--p-accent)" />
                      <span>
                        {termsText}
                        {setup.terms.required ? <span className="text-[#c2410c]"> *</span> : null}
                      </span>
                    </label>
                    {setup.terms.body ? (
                      <details className="mt-2 text-[0.8125rem] text-(--p-muted)">
                        <summary className="cursor-pointer font-semibold">{setup.terms.label.replace(/%s/g, "")}</summary>
                        <p className="mt-2 whitespace-pre-line">{setup.terms.body}</p>
                      </details>
                    ) : null}
                    {errors.terms ? <FieldError>{errors.terms}</FieldError> : null}
                  </div>
                ) : null}
              </>
            ) : null}

            {formError ? (
              <p role="alert" className="mt-5 flex items-center gap-2 rounded-[0.75rem] bg-[#fff7ed] px-4 py-3 text-[0.875rem] font-semibold text-[#9a3412]">
                <Icon name="alert" size={16} /> {formError}
              </p>
            ) : null}

            <div className="mt-7 hidden items-center justify-between gap-3 lg:flex">
              {stepIndex > 0 ? (
                <button type="button" onClick={back} className={cn(ghostButton, "h-12")}>{t("book_back")}</button>
              ) : <span />}
              <button type="button" onClick={primary.action} disabled={primary.disabled} className={cn(accentButton, "h-12")}>
                {primary.text}
              </button>
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Summary setup={setup} request={request} quote={priced} money={money} t={t} unitLabel={unitLabel} />
        </aside>
      </div>

      {/* phones: total and the next step at the bottom */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-(--p-line) bg-(--p-card) px-4 py-3 lg:hidden">
        <div className="min-w-0 flex-1">
          {priced ? (
            <>
              <p className="font-heading text-[1.0625rem] font-extrabold">{money(priced.total)}</p>
              <p className="text-[0.75rem] text-(--p-muted)">{`${nights} ${unitLabel(nights)}`}</p>
            </>
          ) : (
            <p className="line-clamp-2 text-[0.8125rem] leading-snug text-(--p-muted)">{t("book_choose_dates")}</p>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          {stepIndex > 0 ? <button type="button" onClick={back} className={cn(ghostButton, "h-11 px-3")} aria-label={t("book_back")}><Icon name="chevronLeft" size={18} /></button> : null}
          <button type="button" onClick={primary.action} disabled={primary.disabled} className={cn(accentButton, "h-11 px-4 text-[0.875rem]")}>
            {primary.text}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ parts */

function StepTitle({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mb-5">
      <h1 className="font-heading text-[1.5rem] font-extrabold tracking-[-0.01em]">{title}</h1>
      <p className="mt-1 text-[0.9375rem] text-(--p-muted)">{desc}</p>
    </div>
  );
}

function FieldError({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-[0.8125rem] font-semibold text-[#c2410c]">
      <Icon name="alert" size={14} /> {children}
    </p>
  );
}

/**
 * Check-in / check-out shown above the availability calendar. The dates are chosen on the calendar only
 * (no browser date picker on top of it): a click takes the guest to the calendar.
 */
function DateField({ id, label, value, placeholder, error }: { id: string; label: string; value: string; placeholder: string; error: boolean }) {
  return (
    <div>
      <span id={`${id}-label`} className={fieldLabel}>
        {label} <span className="text-[#c2410c]">*</span>
      </span>
      <button
        id={id}
        type="button"
        aria-labelledby={`${id}-label ${id}`}
        onClick={() => {
          const calendar = document.getElementById("book-calendar");
          calendar?.scrollIntoView({ behavior: "smooth", block: "center" });
          calendar?.querySelector<HTMLButtonElement>("button[aria-label]:not(:disabled)")?.focus({ preventScroll: true });
        }}
        className={cn(inputClass, "flex items-center justify-between gap-2 text-left", !value && "text-[#9ca3af]", error && "border-[#c2410c] ring-2 ring-[#c2410c]/20")}
      >
        <span className="truncate">{value || placeholder}</span>
        <Icon name="calendar" size={18} className="shrink-0 text-(--p-muted)" />
      </button>
    </div>
  );
}

function Counter({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (v: number) => void }) {
  const btn = "grid size-9 place-items-center rounded-full border border-(--p-line) bg-white text-[1.125rem] font-semibold disabled:opacity-40";
  return (
    <div className="flex items-center gap-3">
      <button type="button" className={btn} disabled={value <= min} onClick={() => onChange(value - 1)} aria-label="−">−</button>
      <span className="w-6 text-center font-semibold tabular-nums">{value}</span>
      <button type="button" className={btn} disabled={value >= max} onClick={() => onChange(value + 1)} aria-label="+">+</button>
    </div>
  );
}

function CounterRow({ title, hint, value, min, max, onChange }: { title: string; hint: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div>
        <p className="font-heading font-bold">{title}</p>
        <p className="text-[0.8125rem] text-(--p-muted)">{hint}</p>
      </div>
      <Counter value={value} min={min} max={max} onChange={onChange} />
    </div>
  );
}

function Summary({
  setup,
  request,
  quote,
  money,
  t,
  unitLabel,
}: {
  setup: BookingSetup;
  request: BookingRequest;
  quote: BookingQuote | null;
  money: (n: number) => string;
  t: (key: string, tokens?: Record<string, string | number>) => string;
  unitLabel: (n: number) => string;
}) {
  const p = setup.property;
  const place = [p.city, p.state].filter(Boolean).join(", ");
  const guests = request.adults + request.children;
  const row = (labelText: string, amount: number, tone?: "minus" | "muted") => (
    <div className={cn("flex justify-between gap-3 py-1.5 text-[0.875rem]", tone === "muted" && "text-(--p-muted)", tone === "minus" && "text-[#15803d]")}>
      <dt>{labelText}</dt>
      <dd className="tabular-nums">{tone === "minus" ? `− ${money(amount)}` : money(amount)}</dd>
    </div>
  );
  return (
    <div className={cn(card, "p-5")}>
      <div className="relative mb-4 aspect-[16/9] overflow-hidden rounded-[0.75rem] bg-(--p-soft)">
        {p.photo ? <SafeImage src={p.photo} alt={p.name} fill sizes="352px" className="object-cover" /> : null}
      </div>
      <h2 className="font-heading text-[1.0625rem] font-bold">{p.name}</h2>
      <p className="mt-0.5 text-[0.8125rem] text-(--p-muted)">
        {[place, request.date_from && request.date_to ? `${fmtDay(request.date_from)} → ${fmtDay(request.date_to)}` : null, guests > 0 ? `${t("book_guests")}: ${guests}` : null]
          .filter(Boolean)
          .join(" · ")}
      </p>
      {quote ? (
        <dl className="mt-4 border-t border-(--p-line) pt-3">
          {row(`${t("bf_price")} · ${quote.nights} ${unitLabel(quote.nights)}`, quote.amount)}
          {quote.extra_price > 0 ? row(t("bf_extra_price"), quote.extra_price) : null}
          {quote.discount_valid && quote.discount_amount > 0 ? row(quote.discount_name || t("front_discount"), quote.discount_amount, "minus") : null}
          {quote.promo_valid && quote.promo_amount > 0 ? row(`${t("book_coupon")} ${quote.promo_code}`, quote.promo_amount, "minus") : null}
          {quote.tax > 0 ? row(t("bf_tax"), quote.tax, "muted") : null}
          {quote.tourist_tax > 0 ? row(t("bf_tourist_tax"), quote.tourist_tax, "muted") : null}
          <div className="mt-2 flex items-baseline justify-between border-t border-(--p-line) pt-3 font-heading">
            <dt className="text-[1rem] font-bold">{t("bf_total")}</dt>
            <dd className="text-[1.25rem] font-extrabold tabular-nums">{money(quote.total)}</dd>
          </div>
          {quote.deposit > 0 || quote.security > 0 ? (
            <div className="mt-3 rounded-[0.75rem] bg-(--p-soft) px-3.5 py-2.5">
              {quote.deposit > 0 ? (
                <div className="flex justify-between py-1 text-[0.875rem] font-bold"><dt>{t("book_pay_now")}</dt><dd className="tabular-nums">{money(quote.deposit)}</dd></div>
              ) : null}
              {quote.on_arrival > 0 ? (
                <div className="flex justify-between py-1 text-[0.8125rem] text-(--p-muted)"><dt>{t("book_pay_on_arrival")}</dt><dd className="tabular-nums">{money(quote.on_arrival)}</dd></div>
              ) : null}
              {quote.security > 0 ? (
                <div className="flex justify-between py-1 text-[0.8125rem] text-(--p-muted)"><dt>{t("book_security_refundable")}</dt><dd className="tabular-nums">{money(quote.security)}</dd></div>
              ) : null}
            </div>
          ) : null}
        </dl>
      ) : (
        <p className="mt-4 border-t border-(--p-line) pt-3 text-[0.875rem] text-(--p-muted)">{t("book_choose_dates")}</p>
      )}
    </div>
  );
}
