"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { bookingLinkHost } from "@/config/site";
import { AMENITIES } from "@/data/amenities";
import { signupApi, type ApiTheme } from "@/lib/api/signup";
import { cn, formatPrice, pluralize } from "@/lib/utils";
import { useDraft } from "../draft-store";
import { setSignupFlash, updateSignupState, useSignupSession } from "../signup-session";
import { ThemeMiniPage, ThemePreviewDialog, ThemeSwatches, type ThemePreviewData } from "../components/ThemePreview";
import { UpgradePlansDialog } from "../components/UpgradePlansDialog";
import { hrefForNextStep, LIVE_HREF } from "../steps";

/**
 * Step 6 (last) — theme (pjActionGetThemes + pjActionSignupTheme). The colour
 * palettes come from the back office (Options > Theme colours); choosing one and
 * publishing completes the registration. The first theme is free; the others need a
 * plan with themes. Every theme can be previewed on the host's own page (ThemePreviewDialog);
 * a paid one leads to the plans (UpgradePlansDialog).
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
  const [freeId, setFreeId] = useState<string | null>(null);
  // Paid theme the host tried to choose (opens the plans).
  const [upgrade, setUpgrade] = useState<{ theme: ApiTheme | null } | null>(null);

  const name = state?.property?.name || "your property";
  const draft = useDraft();
  // Theme shown in the preview window (index in `themes`), or null.
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  // The host's own page for the previews.
  const previewData = useMemo<ThemePreviewData>(() => {
    const p = state?.property;
    const currency = p?.currency || state?.currency || draft.property.currency;
    const bedrooms = p?.bedrooms ? Number(p.bedrooms) : draft.property.bedrooms;
    const bathrooms = p?.bathrooms ? Number(p.bathrooms) : draft.property.bathrooms;
    const guests = p?.max_guests ?? draft.property.maxGuests;
    const amenities = p?.amenities?.length
      ? p.amenities
      : [
          ...AMENITIES.filter((amenity) => draft.property.amenities.includes(amenity.id)).map((amenity) => amenity.label),
          ...draft.property.extraAmenities,
        ];
    const price = p?.price ?? draft.property.price;
    return {
      name: p?.name || draft.property.name || "Your property",
      place: [p?.city, p?.state].filter(Boolean).join(", "),
      price: price ? formatPrice(price, currency) : null,
      facts: [
        bedrooms ? pluralize(bedrooms, "bedroom") : "",
        bathrooms ? pluralize(bathrooms, "bath") : "",
        guests ? pluralize(guests, "guest") : "",
      ].filter(Boolean),
      amenities,
      headline: state?.headline ?? null,
      description: state?.description ?? null,
      photo: state?.photos?.[0]?.url ?? null,
      morePhotos: (state?.photos ?? []).slice(1, 5).map((photo) => photo.thumb_url || photo.url),
      link: `${bookingLinkHost}/${draft.property.slug || "your-page"}`,
    };
  }, [state, draft]);

  useEffect(() => {
    let active = true;
    void signupApi.themes(token).then((result) => {
      if (!active) return;
      if (result.ok) {
        const list = result.data.themes;
        const free = result.data.free_id ?? result.data.default_id;
        setThemes(list);
        setAllowed(result.data.allowed);
        setFreeId(free);
        // Keep the choice only while it is still available (e.g. after an upgrade or a downgrade).
        setSelected((current) => {
          const chosen = list.find((theme) => theme.id === current);
          return chosen && !chosen.locked ? chosen.id : free;
        });
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
    if (result.code === 402) {
      // The plan changed since the themes were loaded: show the plans again.
      setUpgrade({ theme: themes?.find((theme) => theme.id === selected) ?? null });
      setReload((n) => n + 1);
      return;
    }
    setError(result.errors.palette_id ?? result.message);
  }

  function choose(theme: ApiTheme) {
    if (theme.locked) {
      // Show the paid theme on the host's page first; the plans are one click away there.
      setPreviewIndex(themes?.indexOf(theme) ?? null);
      return;
    }
    setSelected(theme.id);
    setError(undefined);
  }

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-display">Pick a look for {name}</h1>
          <p className="mt-2 text-lead text-body">
            See how your page looks in each theme. You can change the theme any time.
          </p>
        </div>
        <Button size="lg" onClick={publish} disabled={publishing || !themes} aria-busy={publishing}>
          {publishing ? "Publishing…" : "Publish my page"} <Icon name="arrowRight" size={18} />
        </Button>
      </div>

      {themes && !allowed ? (
        <Notice tone="info" className="mt-6" title="The first theme is free">
          The other themes come with the Pro and Business plans. Preview any of them before you decide.{" "}
          <button
            type="button"
            onClick={() => setUpgrade({ theme: null })}
            className="font-semibold text-heading underline underline-offset-2 hover:text-link-hover focus-visible:outline-none focus-visible:focus-ring"
          >
            See plans
          </button>
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
            <li key={i} className="h-80 animate-pulse rounded-card bg-surface-muted" />
          ))}
        </ul>
      ) : (
        <div role="group" aria-label="Themes" className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {themes.map((theme, index) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              data={previewData}
              selected={selected === theme.id}
              onSelect={() => choose(theme)}
              onPreview={() => setPreviewIndex(index)}
            />
          ))}
        </div>
      )}

      {themes ? (
        <ThemePreviewDialog
          themes={themes}
          index={previewIndex}
          data={previewData}
          onIndexChange={setPreviewIndex}
          onClose={() => setPreviewIndex(null)}
          onUse={(theme) => {
            setPreviewIndex(null);
            setSelected(theme.id);
            setError(undefined);
          }}
          onUnlock={(theme) => {
            setPreviewIndex(null);
            setUpgrade({ theme });
          }}
        />
      ) : null}

      <UpgradePlansDialog
        open={upgrade !== null}
        token={token}
        themeName={upgrade?.theme?.name ?? null}
        onClose={() => setUpgrade(null)}
        onKeepFree={() => {
          setUpgrade(null);
          if (freeId) setSelected(freeId);
        }}
        onRefresh={() => {
          setUpgrade(null);
          setReload((n) => n + 1);
        }}
      />
    </section>
  );
}

/** A theme: the host's page in its colours, the colour strip, Free / Pro, Preview and Select (or Unlock). */
function ThemeCard({
  theme,
  data,
  selected,
  onSelect,
  onPreview,
}: {
  theme: ApiTheme;
  data: ThemePreviewData;
  selected: boolean;
  onSelect: () => void;
  onPreview: () => void;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-card border-2 bg-card p-3.5 shadow-card transition-colors",
        selected ? "border-primary" : "border-transparent hover:border-border",
      )}
    >
      <button
        type="button"
        onClick={onPreview}
        className="block rounded-input text-left focus-visible:outline-none focus-visible:focus-ring"
        aria-label={`Preview ${theme.name}`}
      >
        <ThemeMiniPage theme={theme} data={data} />
      </button>
      <ThemeSwatches theme={theme} />
      <div className="flex items-center justify-between gap-2">
        <p className="flex min-w-0 items-center gap-1.5 font-heading text-base font-extrabold text-heading">
          <span className="truncate">{theme.name}</span>
          {theme.free ? (
            <span className="shrink-0 rounded-sm bg-success-soft px-2 py-0.5 text-caption font-bold text-success-strong">Free</span>
          ) : theme.locked ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-sm bg-secondary px-2 py-0.5 text-caption font-bold text-on-dark">
              <Icon name="lock" size={11} strokeWidth={2.5} /> Pro
            </span>
          ) : null}
        </p>
        <div className="flex shrink-0 gap-1.5">
          <Button size="sm" variant="outline" onClick={onPreview}>
            Preview
          </Button>
          <Button
            size="sm"
            variant={selected ? "primary" : "outline"}
            onClick={onSelect}
            aria-pressed={theme.locked ? undefined : selected}
          >
            {selected ? (
              <>
                <Icon name="check" size={14} /> Selected
              </>
            ) : theme.locked ? (
              "Unlock"
            ) : (
              "Select"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
