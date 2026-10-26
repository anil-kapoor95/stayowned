"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import type { FaqItem } from "./faq-data";

/**
 * Questions as separate cards (home, how it works, contact). One answer is open at a time;
 * the first one starts open, as in the Figma frames.
 */
export function FaqAccordion({
  items,
  showSupport = true,
  className = "max-w-3xl",
}: {
  items: FaqItem[];
  showSupport?: boolean;
  /** Width of the list; the Pricing and Themes frames use 900px. */
  className?: string;
}) {
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null);
  const baseId = useId();

  return (
    <div className={cn("mx-auto grid gap-2.5", className)}>
      {items.map((item) => {
        const isOpen = open === item.id;
        const panelId = `${baseId}-${item.id}`;
        return (
          <div
            key={item.id}
            className={cn(
              "rounded-input border transition-colors",
              isOpen ? "border-primary-subtle bg-primary-tint" : "border-border bg-surface",
            )}
          >
            <h3 className="font-body text-base">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : item.id)}
                className="flex w-full items-center justify-between gap-4 rounded-input px-5 py-4 text-left font-semibold text-heading focus-visible:outline-none focus-visible:focus-ring"
              >
                {item.question}
                <span
                  aria-hidden="true"
                  className="grid size-6 shrink-0 place-items-center rounded-pill bg-primary-soft text-primary-strong"
                >
                  <Icon name={isOpen ? "minus" : "plus"} size={13} strokeWidth={2.5} />
                </span>
              </button>
            </h3>
            <div id={panelId} hidden={!isOpen} className="px-5 pb-5 text-small text-body">
              {item.answer}
            </div>
          </div>
        );
      })}

      {showSupport ? (
        <div className="mt-1 flex flex-col items-start justify-between gap-3 rounded-input bg-primary-soft px-5 py-4 sm:flex-row sm:items-center">
          <div>
            <p className="font-semibold text-heading">Still have questions?</p>
            <p className="text-caption text-body">Our team is on WhatsApp and phone.</p>
          </div>
          <Button href="/contact" size="sm">
            Contact support <Icon name="arrowRight" size={14} />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
