"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { themeStyle } from "@/features/property-page/theme";
import { bookingApi, label, type BookingSetup, type BookingStatus } from "@/lib/api/booking";
import { formatAdminPrice } from "@/lib/price-format";
import { cn } from "@/lib/utils";

const fmtDay = (value: string) =>
  new Date(`${value}T00:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

type Loaded = { ref: string; status: BookingStatus | null; error: string };

/** After booking (and after the payment page): the booking as the back office has it now. */
export function BookingConfirmed({
  setup,
  reference,
  bookingKey,
  basePath,
}: {
  setup: BookingSetup;
  reference: string;
  bookingKey: string;
  /** Path of the property on this website: "/casanova", or "" when it is the home page of the host's own domain. */
  basePath: string;
}) {
  const t = (key: string, tokens?: Record<string, string | number>) => label(setup.labels, key, tokens);
  const p = setup.property;
  const money = (amount: number) => formatAdminPrice(amount, p.currency_sign || p.currency, p.price_format);
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    let live = true;
    bookingApi.status(setup.slug, reference, bookingKey).then((result) => {
      if (!live) return;
      setLoaded(result.ok ? { ref: reference, status: result.data, error: "" } : { ref: reference, status: null, error: result.message });
    });
    return () => {
      live = false;
    };
  }, [setup.slug, reference, bookingKey]);

  const current = loaded && loaded.ref === reference ? loaded : null;
  const b = current?.status ?? null;
  const confirmed = b?.status === "Confirmed";
  const whatsapp = p.host.phone.replace(/\D/g, "");

  return (
    <div style={themeStyle(p.theme)} className="flex flex-1 flex-col bg-(--p-page) text-(--p-text)">
      <div className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6">
        <section className="rounded-[1rem] border border-(--p-line) bg-(--p-card) p-6 sm:p-8">
          {!current ? (
            <p role="status" className="flex items-center gap-2 text-(--p-muted)">
              <Icon name="refresh" size={16} className="animate-spin" /> {t("book_checking")}
            </p>
          ) : !b ? (
            <p role="alert" className="flex items-center gap-2 font-semibold text-[#b91c1c]">
              <Icon name="alert" size={16} /> {current.error || t("book_not_found")}
            </p>
          ) : (
            <>
              <span
                aria-hidden="true"
                className={cn("grid size-14 place-items-center rounded-full", confirmed ? "bg-[#dcfce7] text-[#15803d]" : "bg-(--p-soft) text-(--p-accent)")}
              >
                <Icon name="check" size={28} />
              </span>
              <h1 className="mt-4 font-heading text-[1.625rem] font-extrabold leading-tight">
                {t(confirmed ? "book_confirmed_title" : "book_pending_title")}
              </h1>
              <p className="mt-2 text-(--p-muted)">{t(confirmed ? "book_confirmed_desc" : "book_pending_desc", { EMAIL: b.email })}</p>

              <dl className="mt-6 divide-y divide-(--p-line) rounded-[0.75rem] border border-(--p-line) text-[0.9375rem]">
                <Row term={t("book_reference")}>
                  <span className="font-mono text-[0.8125rem]">{b.reference}</span>
                </Row>
                <Row term={t("book_dates")}>
                  {fmtDay(b.date_from)} – {fmtDay(b.date_to)}
                </Row>
                <Row term={t("book_guests")}>
                  {[
                    setup.guests.adults.show ? `${b.adults} ${t("bf_adults")}` : null,
                    setup.guests.children.show && b.children > 0 ? `${b.children} ${t("bf_children")}` : null,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </Row>
                {b.extras.length > 0 ? (
                  <Row term={t("book_extras_summary")}>{b.extras.map((e) => (e.qty > 1 ? `${e.name} × ${e.qty}` : e.name)).join(", ")}</Row>
                ) : null}
                {b.payment_title ? <Row term={t("bf_payment")}>{b.payment_title}</Row> : null}
                <Row term={t("bf_total")}>
                  <span className="font-bold">{money(b.total)}</span>
                </Row>
                {b.deposit > 0 ? (
                  <Row term={b.paid ? t("book_paid_now") : t("bf_deposit")}>{money(b.deposit)}</Row>
                ) : null}
                {b.security > 0 ? <Row term={t("bf_security")}>{money(b.security)}</Row> : null}
              </dl>

              {b.bank_account ? (
                <div className="mt-5 rounded-[0.75rem] bg-(--p-soft) p-4 text-[0.875rem]">
                  <p className="font-semibold">{t("book_bank_transfer_info")}</p>
                  <p className="mt-1 whitespace-pre-line">{b.bank_account}</p>
                </div>
              ) : null}
            </>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {whatsapp && b ? (
              <a
                href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`${p.name} · ${t("book_reference")}: ${b.reference}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-[0.75rem] bg-(--p-accent) px-5 font-heading font-bold text-white hover:brightness-95"
              >
                <Icon name="smartphone" size={16} /> {t("book_message_host")}
              </a>
            ) : null}
            <Link
              href={basePath || "/"}
              className="inline-flex h-11 flex-1 items-center justify-center gap-1 rounded-[0.75rem] border border-(--p-line) px-5 font-heading font-semibold hover:border-(--p-accent)"
            >
              <Icon name="chevronLeft" size={15} /> {t("book_back_to_property")}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function Row({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3">
      <dt className="text-(--p-muted)">{term}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}
