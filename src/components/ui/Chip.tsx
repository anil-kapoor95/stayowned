"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon, type IconName } from "./Icon";

const chipBase =
  "inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-chip border px-3.5 py-2 text-small font-medium " +
  "transition-[background-color,border-color,color] duration-(--duration-fast)";
const chipIdle = "border-chip-border bg-chip-bg text-chip-text hover:border-border-strong";
const chipOn = "border-chip-selected-border bg-chip-selected-bg text-chip-selected-text";

/**
 * Multi-select chip (amenities). Uses aria-pressed and shows a check mark when
 * selected, so state is not conveyed by colour alone.
 */
export function ToggleChip({
  selected,
  onToggle,
  icon,
  children,
}: {
  selected: boolean;
  onToggle: () => void;
  icon?: IconName;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={cn(chipBase, "focus-visible:outline-none focus-visible:focus-ring", selected ? chipOn : chipIdle)}
    >
      {icon ? <Icon name={icon} size={16} /> : null}
      {children}
      {selected ? <Icon name="check" size={14} strokeWidth={2.75} className="-mr-0.5" /> : null}
    </button>
  );
}

/**
 * Single-select chips backed by native radio inputs (arrow-key navigation for free).
 */
export function RadioChips<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
  disabled,
}: {
  name: string;
  legend: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
}) {
  return (
    <fieldset disabled={disabled} className="disabled:opacity-60">
      <legend className="mb-2 text-small font-semibold text-heading">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const checked = option.value === value;
          return (
            <label key={option.value} className="relative">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="peer sr-only"
              />
              <span
                className={cn(
                  chipBase,
                  "peer-focus-visible:focus-ring",
                  checked ? cn(chipOn, "font-semibold") : chipIdle,
                )}
              >
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
