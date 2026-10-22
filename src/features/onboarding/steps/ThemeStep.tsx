"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { signupApi, type ApiTheme } from "@/lib/api/signup";
import { cn } from "@/lib/utils";
import { setSignupFlash, updateSignupState, useSignupSession } from "../signup-session";
import { hrefForNextStep, LIVE_HREF } from "../steps";

/**
 * Step 6 (last) — theme (pjActionGetThemes + pjActionSignupTheme). The colour
 * palettes come from the back office (Options > Theme colours); choosing one and
 * publishing completes the registration.
 */
export function ThemeStep() {
  const router = useRouter();
  const { token, state } = useSignupSession();
  const [themes, setThemes] = useState<ApiTheme[] | null>(null);
  const [allowed, setAllowed] = useState(true);
  const [selected, setSelected] = useState<string | null>(state?.theme?.palette_id ?? null);
  const [loadError, setLoadError] = useState<string>();
  const [error, setError] = useState<string>();
  const [publishing, setPublishing] = useState(false);
  const [reload, setReload] = useState(0);

  const name = state?.property?.name || "your property";
  const place = [state?.property?.city, state?.property?.state].filter(Boolean).join(", ");

  useEffect(() => {
    let active = true;
    void signupApi.themes(token).then((result) => {
      if (!active) return;
      if (result.ok) {
        setThemes(result.data.themes);
        setAllowed(result.data.allowed);
        setSelected((current) => current ?? result.data.default_id);
        setLoadError(undefined);
      } else {
        setLoadError(result.message);
      }
    });
    return () => {
      active = false;
    };
  }, [token, reload]);

  async function publish() {
    if (!token) return;
    if (!selected) {
      setError("Please choose a theme.");
      return;
    }
    setError(undefined);
    setPublishing(true);
    const result = await signupApi.theme(selected, token);
    setPublishing(false);
    if (result.ok) {
      updateSignupState(result.data);
      // The host stays logged in on this browser (Log out in the header).
      setSignupFlash({ tone: "success", text: "Registration complete — you're logged in to your StayOwned account." });
      router.push(LIVE_HREF);
      return;
    }
    if (result.code === 409 && result.data) {
      router.push(hrefForNextStep((result.data as { next_step: number | "done" }).next_step));
      return;
    }
    setError(result.errors.palette_id ?? result.message);
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
        <Button size="lg" onClick={publish} disabled={publishing || !themes} aria-busy={publishing}>
          {publishing ? "Publishing…" : "Publish my page"} <Icon name="arrowRight" size={18} />
        </Button>
      </div>

      {!allowed ? (
        <Notice tone="info" className="mt-6" title="Your plan uses the default theme">
          You can still pick one now — it will be applied when you upgrade your plan.
        </Notice>
      ) : null}
      {error ? (
        <Notice tone="error" role="alert" className="mt-6">
          {error}
        </Notice>
      ) : null}

      {loadError ? (
        <Notice tone="error" role="alert" className="mt-8" title="Themes could not be loaded">
          <p>{loadError}</p>
          <Button size="sm" variant="outline" className="mt-3" onClick={() => setReload((n) => n + 1)}>
            <Icon name="refresh" size={14} /> Try again
          </Button>
        </Notice>
      ) : !themes ? (
        <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-72 animate-pulse rounded-card bg-surface-muted" />
          ))}
        </ul>
      ) : (
        <div role="group" aria-label="Themes" className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {themes.map((theme) => (
            <PaletteCard
              key={theme.id}
              theme={theme}
              name={name}
              place={place}
              selected={selected === theme.id}
              onSelect={() => setSelected(theme.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/** Mini guest page painted with a palette from the API (colours are data, so inline variables). */
function PaletteCard({
  theme,
  name,
  place,
  selected,
  onSelect,
}: {
  theme: ApiTheme;
  name: string;
  place: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const vars = {
    "--palette-brand": theme.colors.brand,
    "--palette-accent": theme.colors.accent,
    "--palette-text": theme.colors.text,
    "--palette-bg": theme.colors.background,
    "--palette-page": theme.colors.page_background,
  } as CSSProperties;

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "rounded-card border-2 bg-card p-4 text-left shadow-card transition-colors focus-visible:outline-none focus-visible:focus-ring",
        selected ? "border-primary" : "border-transparent hover:border-border-strong",
      )}
    >
      <div style={vars} className="rounded-input border border-black/5 bg-(--palette-page) p-3" aria-hidden="true">
        <div className="flex items-center justify-between">
          <span className="truncate text-small font-bold text-(--palette-text)">{name}</span>
          <span className="rounded-pill bg-(--palette-accent) px-2.5 py-0.5 text-caption font-semibold text-white">
            Book now
          </span>
        </div>
        <div className="mt-3 flex h-32 flex-col justify-end rounded-sm bg-(--palette-brand) p-3.5">
          <p className="text-base font-bold text-white">Your stay at {name}</p>
          {place ? <p className="text-caption text-white">{place}</p> : null}
        </div>
        <div className="mt-2.5 grid grid-cols-3 gap-2">
          {[0, 1, 2].map((item) => (
            <span key={item} className="h-9 rounded-sm bg-(--palette-bg) ring-1 ring-black/5" />
          ))}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="font-heading text-base font-bold text-heading">{theme.name}</span>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-small font-semibold",
            selected ? "bg-primary text-on-primary" : "bg-surface-sunken text-heading",
          )}
        >
          {selected ? (
            <>
              <Icon name="check" size={14} /> Selected
            </>
          ) : (
            "Select"
          )}
        </span>
      </div>
    </button>
  );
}
