"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { signupApi, type ApiTheme } from "@/lib/api/signup";

let themesRequest: Promise<ApiTheme[]> | null = null;

function loadThemes(token: string | null) {
  themesRequest ??= signupApi.themes(token).then((result) => (result.ok ? result.data.themes : []));
  return themesRequest;
}

/**
 * Colours of the palette the host chose on step 6 (from the back office), as token
 * overrides for the guest page. Null until a palette is chosen or while loading.
 */
export function usePaletteStyle(paletteId: string | null | undefined, token: string | null): CSSProperties | null {
  const [theme, setTheme] = useState<ApiTheme | null>(null);

  useEffect(() => {
    if (!paletteId) return;
    let active = true;
    void loadThemes(token).then((themes) => {
      if (active) setTheme(themes.find((item) => item.id === paletteId) ?? null);
    });
    return () => {
      active = false;
    };
  }, [paletteId, token]);

  if (!paletteId || !theme || theme.id !== paletteId) return null;
  const c = theme.colors;
  return {
    "--color-primary": c.brand,
    "--color-primary-hover": `color-mix(in srgb, ${c.brand} 88%, black)`,
    "--color-primary-active": `color-mix(in srgb, ${c.brand} 78%, black)`,
    "--color-primary-strong": c.brand,
    "--color-primary-soft": `color-mix(in srgb, ${c.brand} 12%, white)`,
    "--color-primary-tint": `color-mix(in srgb, ${c.brand} 6%, white)`,
    "--color-accent": c.accent,
    "--color-heading": c.text,
    "--color-background": c.page_background,
    "--color-card": c.background,
    "--color-surface": c.background,
  } as CSSProperties;
}
