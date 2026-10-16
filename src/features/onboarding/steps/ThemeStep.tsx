"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Icon } from "@/components/ui/Icon";
import { ThemePreview } from "@/components/theme/ThemePreview";
import { THEMES, type ThemeOption } from "@/data/themes";
import { cn } from "@/lib/utils";
import { updateDraft, useDraft } from "../draft-store";
import { LIVE_HREF } from "../steps";

export function ThemeStep() {
  const router = useRouter();
  const draft = useDraft();
  const [previewing, setPreviewing] = useState<ThemeOption | null>(null);
  const name = draft.property.name || "Your property";
  const place = draft.property.location.split(",").slice(0, 2).join(",").trim() || "Your location";

  function publish() {
    updateDraft((current) => ({ ...current, published: true }));
    router.push(LIVE_HREF);
  }

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-display">Pick a look for {name}</h1>
          <p className="mt-2 text-lead text-body">
            Your details and photos are already filled in. You can change the theme any time.
          </p>
        </div>
        <Button size="lg" onClick={publish}>
          Publish my page <Icon name="arrowRight" size={18} />
        </Button>
      </div>

      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Themes">
        {THEMES.map((theme) => {
          const selected = draft.theme === theme.id;
          return (
            <li
              key={theme.id}
              className={cn(
                "rounded-card border-2 bg-card p-4 shadow-card transition-colors",
                selected ? "border-primary" : "border-transparent",
              )}
            >
              <ThemePreview theme={theme} propertyName={name} place={place} />
              <div className="mt-4 flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="flex items-center gap-2 font-heading text-base font-bold text-heading">
                    {theme.name}
                    <Badge variant={theme.plan === "free" ? "free" : "pro"}>{theme.plan === "free" ? "Free" : "Pro"}</Badge>
                  </h2>
                  <p className="mt-0.5 text-small text-body">{theme.description}</p>
                </div>
                {theme.plan === "free" ? (
                  <Button
                    size="sm"
                    variant={selected ? "primary" : "outline"}
                    aria-pressed={selected}
                    onClick={() => updateDraft((current) => ({ ...current, theme: theme.id }))}
                  >
                    {selected ? (
                      <>
                        <Icon name="check" size={14} /> Selected
                      </>
                    ) : (
                      "Select"
                    )}
                  </Button>
                ) : (
                  <div className="flex shrink-0 gap-2">
                    <Button size="sm" variant="soft" onClick={() => setPreviewing(theme)}>
                      Preview<span className="sr-only"> {theme.name} theme</span>
                    </Button>
                    <Button size="sm" variant="secondary" href="/pricing">
                      <Icon name="lock" size={13} /> Upgrade
                    </Button>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 flex flex-col gap-4 rounded-card bg-secondary p-5 text-on-dark sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-input bg-white/10 text-rating">
            <Icon name="lock" size={18} />
          </span>
          <div>
            <p className="flex flex-wrap items-center gap-2 font-semibold">
              Unlock all 4 Pro themes with StayOwned Pro
              <span className="rounded-sm bg-primary px-1.5 py-0.5 text-caption font-bold">Save 25%</span>
            </p>
            <p className="mt-0.5 text-small text-on-dark-muted">
              Access Luxe, Homestay, Urban &amp; Coastal themes, connect custom domains, and get 0% commission bookings.
            </p>
          </div>
        </div>
        <Button href="/pricing" className="self-start sm:self-center">
          Upgrade to Pro <Icon name="arrowRight" size={16} />
        </Button>
      </div>

      <Dialog
        open={previewing !== null}
        onClose={() => setPreviewing(null)}
        title={previewing ? `${previewing.name} theme preview` : "Theme preview"}
        description={previewing?.description}
        size="lg"
      >
        {previewing ? (
          <>
            <ThemePreview theme={previewing} propertyName={name} place={place} large />
            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => setPreviewing(null)}>
                Keep {THEMES[0].name}
              </Button>
              <Button variant="secondary" href="/pricing">
                <Icon name="lock" size={14} /> Upgrade to use {previewing.name}
              </Button>
            </div>
          </>
        ) : null}
      </Dialog>
    </section>
  );
}
