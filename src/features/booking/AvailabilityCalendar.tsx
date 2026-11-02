"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

export type TakenRange = { from: string; to: string; status?: "pending" | "booked" };
type Status = "pending" | "booked";

const DAY = 86_400_000;
const addDays = (value: string, days: number) => new Date(Date.parse(`${value}T00:00:00Z`) + days * DAY).toISOString().slice(0, 10);
const iso = (y: number, m: number, d: number) => new Date(Date.UTC(y, m, d)).toISOString().slice(0, 10);
const longDay = (value: string) =>
  new Date(`${value}T00:00:00Z`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

// Colours of the day states (the selected stay uses the website's accent colour)
const TONE: Record<"free" | Status, string> = { free: "#e7f4ea", pending: "#fbe3a6", booked: "#f5c2c0" };
const INK: Record<"free" | Status, string> = { free: "#14532d", pending: "#854d0e", booked: "#991b1b" };

/**
 * Availability calendar of the booking page: two months (one on phones), days coloured by the back office's
 * bookings (available / pending / booked / past). Per night, the check-in and check-out days of a booking are drawn
 * half and half, so a check-out day can still be a check-in day. First click: check-in, second: check-out.
 */
export function AvailabilityCalendar({
  taken,
  perDay,
  weekStart,
  today,
  from,
  to,
  invalid,
  t,
  onChange,
}: {
  taken: TakenRange[];
  perDay: boolean;
  /** 0 = Sunday, 1 = Monday ... */
  weekStart: number;
  today: string;
  from: string;
  to: string;
  invalid?: boolean;
  t: (key: string) => string;
  onChange: (from: string, to: string) => void;
}) {
  const [offset, setOffset] = useState(0);
  const [hover, setHover] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  /** Status of a night (per night: the night after the day) or of a day (per day). Booked wins over pending. */
  const statusOf = useMemo(() => {
    const ranges = taken.map((r) => ({ ...r, status: (r.status ?? "booked") as Status }));
    return (day: string): Status | null => {
      let found: Status | null = null;
      for (const r of ranges) {
        const inside = perDay ? r.from <= day && day <= r.to : r.from <= day && day < r.to;
        if (inside) {
          if (r.status === "booked") return "booked";
          found = "pending";
        }
      }
      return found;
    };
  }, [taken, perDay]);

  /** Can the stay from..end be booked (no taken night / day in between)? */
  const rangeFree = (start: string, end: string) => {
    const last = perDay ? end : addDays(end, -1);
    for (let d = start; d <= last; d = addDays(d, 1)) if (statusOf(d)) return false;
    return true;
  };

  const pickingOut = Boolean(from) && !to;
  const canCheckIn = (day: string) => day >= today && !statusOf(day);
  const canCheckOut = (day: string) => pickingOut && (perDay ? day >= from : day > from) && rangeFree(from, day);

  function pick(day: string) {
    if (day < today) return;
    if (canCheckOut(day)) {
      setNotice("");
      onChange(from, day);
      return;
    }
    if (pickingOut && day > from && !rangeFree(from, day) && !canCheckIn(day)) {
      setNotice(t("book_cal_taken"));
      return;
    }
    if (canCheckIn(day)) {
      setNotice("");
      onChange(day, "");
    }
  }

  // Months shown: the month of the check-in (or today) + offset
  const start = from || today;
  const base = new Date(`${start}T00:00:00Z`);
  const months = [0, 1].map((i) => {
    const d = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + offset + i, 1));
    return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
  });
  const firstMonth = months[0];
  const atStart = firstMonth.year * 12 + firstMonth.month <= Number(today.slice(0, 4)) * 12 + Number(today.slice(5, 7)) - 1;

  const weekdays = Array.from({ length: 7 }, (_, i) =>
    new Date(Date.UTC(2024, 0, 7 + ((weekStart + i) % 7))).toLocaleDateString("en-GB", { weekday: "short", timeZone: "UTC" }),
  );

  const end = to || (pickingOut && hover && canCheckOut(hover) ? hover : "");
  const legend: { key: string; color: string }[] = [
    { key: "book_cal_available", color: TONE.free },
    { key: "book_cal_pending", color: TONE.pending },
    { key: "book_cal_booked", color: TONE.booked },
    { key: "book_cal_past", color: "#f1f1ef" },
  ];

  return (
    <div className={cn("rounded-[1rem] border bg-white p-3 sm:p-4", invalid ? "border-[#c2410c] ring-2 ring-[#c2410c]/15" : "border-(--p-line)")}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setOffset((o) => o - 1)}
          disabled={atStart}
          aria-label={t("book_cal_prev")}
          className="grid size-9 place-items-center rounded-full border border-(--p-line) text-(--p-text) hover:border-(--p-accent) disabled:opacity-30"
        >
          <Icon name="chevronLeft" size={16} />
        </button>
        <p role="status" className="text-center text-[0.8125rem] font-semibold text-(--p-muted)">
          {notice || (pickingOut ? t("book_cal_pick_out") : t("book_cal_pick_in"))}
        </p>
        <button
          type="button"
          onClick={() => setOffset((o) => o + 1)}
          aria-label={t("book_cal_next")}
          className="grid size-9 place-items-center rounded-full border border-(--p-line) text-(--p-text) hover:border-(--p-accent)"
        >
          <Icon name="chevronLeft" size={16} className="rotate-180" />
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2" onMouseLeave={() => setHover(null)}>
        {months.map(({ year, month }, mi) => {
          const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
          const lead = (new Date(Date.UTC(year, month, 1)).getUTCDay() - weekStart + 7) % 7;
          const title = new Date(Date.UTC(year, month, 1)).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
          return (
            <div key={`${year}-${month}`} className={cn(mi === 1 && "hidden md:block")}>
              <p className="mb-2 text-center font-heading text-[0.9375rem] font-bold">{title}</p>
              <div className="grid grid-cols-7 gap-1 text-center" role="grid" aria-label={title}>
                {weekdays.map((w) => (
                  <span key={w} className="pb-1 text-[0.6875rem] font-semibold uppercase tracking-[0.04em] text-(--p-muted)">
                    {w}
                  </span>
                ))}
                {Array.from({ length: lead }, (_, i) => (
                  <span key={`e${i}`} />
                ))}
                {Array.from({ length: days }, (_, i) => {
                  const day = iso(year, month, i + 1);
                  const past = day < today;
                  const night = statusOf(day);
                  const before = perDay ? night : statusOf(addDays(day, -1));
                  const isFrom = day === from;
                  const isTo = day === end && Boolean(end);
                  const inRange = Boolean(from && end && day > from && day < end);
                  const clickable = !past && (canCheckOut(day) || canCheckIn(day));

                  // Background: full colour, or half / half on a booking's check-in or check-out day (per night)
                  let background = TONE.free;
                  let color = INK.free;
                  if (past) {
                    background = "#f1f1ef";
                    color = "#a8a29e";
                  } else if (night && before) {
                    background = night === before ? TONE[night] : `linear-gradient(135deg, ${TONE[before]} 50%, ${TONE[night]} 50%)`;
                    color = INK[night];
                  } else if (night) {
                    background = `linear-gradient(135deg, ${TONE.free} 50%, ${TONE[night]} 50%)`;
                    color = INK[night];
                  } else if (before) {
                    background = `linear-gradient(135deg, ${TONE[before]} 50%, ${TONE.free} 50%)`;
                    color = INK.free;
                  }
                  const state = past ? t("book_cal_past") : night ? t(night === "booked" ? "book_cal_booked" : "book_cal_pending") : t("book_cal_available");

                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={!clickable}
                      onClick={() => pick(day)}
                      onMouseEnter={() => setHover(day)}
                      onFocus={() => setHover(day)}
                      aria-pressed={isFrom || isTo}
                      aria-label={`${longDay(day)}, ${state}`}
                      style={isFrom || isTo ? undefined : { background, color }}
                      className={cn(
                        "relative grid aspect-square min-h-9 place-items-center rounded-[0.5rem] text-[0.875rem] font-semibold tabular-nums transition-[box-shadow,transform]",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--p-accent) focus-visible:ring-offset-1",
                        clickable ? "cursor-pointer hover:ring-2 hover:ring-(--p-accent)/60" : "cursor-not-allowed",
                        night === "booked" && !past && !isFrom && !isTo && before === "booked" && "line-through decoration-1",
                        (isFrom || isTo) && "bg-(--p-accent) text-white shadow-sm",
                        inRange && "ring-2 ring-inset ring-(--p-accent)",
                      )}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-(--p-line) pt-3">
        <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-[0.75rem] text-(--p-muted)">
          {legend.map((l) => (
            <li key={l.key} className="flex items-center gap-1.5">
              <span aria-hidden="true" className="size-3.5 rounded-[0.25rem]" style={{ background: l.color }} />
              {t(l.key)}
            </li>
          ))}
          <li className="flex items-center gap-1.5">
            <span aria-hidden="true" className="size-3.5 rounded-[0.25rem] bg-(--p-accent)" />
            {t("book_cal_selected")}
          </li>
        </ul>
        {from ? (
          <button
            type="button"
            onClick={() => {
              setNotice("");
              onChange("", "");
            }}
            className="text-[0.8125rem] font-semibold text-(--p-accent) hover:underline"
          >
            {t("book_cal_clear")}
          </button>
        ) : null}
      </div>
    </div>
  );
}
