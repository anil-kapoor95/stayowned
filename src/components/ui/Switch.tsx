"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** On/off switch (button role="switch"): the track turns primary when on. */
export function Switch({
  checked,
  onChange,
  labelledBy,
  describedBy,
  label,
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** id of the visible label; or pass `label` for an accessible name only. */
  labelledBy?: string;
  describedBy?: string;
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      aria-label={labelledBy ? undefined : label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-[2.625rem] shrink-0 items-center rounded-pill p-0.5",
        "transition-colors duration-(--duration-fast) ease-(--ease-standard)",
        "focus-visible:outline-none focus-visible:focus-ring",
        checked ? "bg-primary" : "bg-border-strong",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-5 rounded-pill bg-white shadow-card transition-transform duration-(--duration-fast) ease-(--ease-standard)",
          checked ? "translate-x-[1.125rem]" : "translate-x-0",
        )}
      />
    </button>
  );
}

/** Bordered row with a title, a short description and a Switch on the right. */
export function SwitchCard({
  title,
  description,
  checked,
  onChange,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}) {
  const id = useId();
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-input border border-border bg-background px-4 py-3.5",
        className,
      )}
    >
      <div className="min-w-0">
        <p id={`${id}-title`} className="text-small font-bold text-heading">
          {title}
        </p>
        {description ? (
          <p id={`${id}-desc`} className="mt-0.5 text-caption text-body">
            {description}
          </p>
        ) : null}
      </div>
      <Switch
        checked={checked}
        onChange={onChange}
        labelledBy={`${id}-title`}
        describedBy={description ? `${id}-desc` : undefined}
      />
    </div>
  );
}
