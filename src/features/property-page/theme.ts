import type { CSSProperties } from "react";
import type { PropertyPageData } from "@/lib/api/property-page";

/** Colours of the theme the host chose (step 6); the Figma colours when there is none. */
const DEFAULT_COLORS = {
  brand: "#1d2250",
  accent: "#ee5a24",
  text: "#1d2250",
  background: "#ffffff",
  price: "#1d2250",
  page_background: "#fdfcf8",
};

/** CSS variables (--p-*) of the host's website (property page and company page). */
export function themeStyle(theme: PropertyPageData["theme"]): CSSProperties {
  const c = theme?.colors ?? DEFAULT_COLORS;
  return {
    "--p-brand": c.brand,
    "--p-accent": c.accent,
    "--p-text": c.text,
    "--p-card": c.background,
    "--p-price": c.price,
    "--p-page": c.page_background,
    "--p-soft": `color-mix(in srgb, ${c.accent} 9%, ${c.background})`,
    "--p-line": `color-mix(in srgb, ${c.text} 12%, transparent)`,
    "--p-muted": `color-mix(in srgb, ${c.text} 62%, ${c.page_background})`,
    // global heading colour (h1–h3) follows the theme too
    "--color-heading": c.text,
  } as CSSProperties;
}
