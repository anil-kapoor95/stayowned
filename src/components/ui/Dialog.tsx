"use client";

import { useEffect, useId, useRef, type KeyboardEventHandler, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

/**
 * Accessible modal built on the native <dialog> element (focus trapping,
 * Escape to close and inert background come from the platform).
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  className,
  size = "md",
  onKeyDown,
}: {
  onKeyDown?: KeyboardEventHandler<HTMLDialogElement>;
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
  size?: "md" | "lg" | "xl";
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    // When the route is hidden by <Activity>, effects are cleaned up: close the modal.
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [open]);

  const widths = { md: "max-w-lg", lg: "max-w-3xl", xl: "max-w-5xl" } as const;

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onKeyDown={onKeyDown}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={cn(
        "m-auto w-[calc(100%-2rem)] rounded-card bg-surface p-0 text-body shadow-popover backdrop:bg-overlay",
        widths[size],
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4 border-b border-divider px-5 py-4 sm:px-6">
        <div>
          <h2 id={titleId} className="text-title font-heading">
            {title}
          </h2>
          {description ? <div className="mt-1 text-small text-body">{description}</div> : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid size-9 shrink-0 place-items-center rounded-pill text-heading hover:bg-surface-muted focus-visible:outline-none focus-visible:focus-ring"
          aria-label="Close dialog"
        >
          <Icon name="x" size={18} />
        </button>
      </div>
      <div className="px-5 py-5 sm:px-6">{children}</div>
    </dialog>
  );
}
