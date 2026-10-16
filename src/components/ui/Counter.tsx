"use client";

import { Icon } from "./Icon";

/** "Bedrooms − 3 +" counter card from the About Property frame. */
export function Counter({
  id,
  label,
  value,
  min = 0,
  max = 50,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}) {
  const btn =
    "grid size-8 place-items-center rounded-pill border border-border bg-surface text-heading transition-colors " +
    "hover:border-border-strong focus-visible:outline-none focus-visible:focus-ring disabled:opacity-40 disabled:cursor-not-allowed";
  return (
    <div className="rounded-input border border-border bg-surface px-4 py-3">
      <span id={`${id}-label`} className="text-small font-semibold text-heading">
        {label}
      </span>
      <div className="mt-2 flex items-center justify-between" role="group" aria-labelledby={`${id}-label`}>
        <button
          type="button"
          className={btn}
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`Decrease ${label.toLowerCase()}`}
        >
          <Icon name="minus" size={14} />
        </button>
        <output
          id={id}
          aria-live="polite"
          className="font-heading text-stat text-heading tabular-nums"
        >
          {value}
        </output>
        <button
          type="button"
          className={btn}
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={`Increase ${label.toLowerCase()}`}
        >
          <Icon name="plus" size={14} />
        </button>
      </div>
    </div>
  );
}
