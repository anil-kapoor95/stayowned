import localFont from "next/font/local";

/**
 * Fonts identified in Figma: Plus Jakarta Sans (headings) and DM Sans (body/UI).
 * Bricolage Grotesque is the display face of the Pricing and Themes frames.
 * Self-hosted variable WOFF2 files (SIL OFL 1.1, see src/fonts/) loaded with
 * next/font/local, exposed as CSS variables consumed by tokens.css.
 */
export const fontHeading = localFont({
  src: "../fonts/PlusJakartaSans-Variable-latin.woff2",
  variable: "--font-jakarta",
  weight: "200 800",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

export const fontBody = localFont({
  src: "../fonts/DMSans-Variable-latin.woff2",
  variable: "--font-dm-sans",
  weight: "100 1000",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

/** Display headings on the Pricing and Themes pages (Figma: Bricolage Grotesque, optical size axis). */
export const fontDisplay = localFont({
  src: "../fonts/BricolageGrotesque-Variable-latin.woff2",
  variable: "--font-bricolage",
  weight: "200 800",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});
