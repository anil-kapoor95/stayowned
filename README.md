# StayOwned — property rental frontend (static phase)

Next.js frontend built from the Figma file **"Property REntal PHP Jabber"**. The Figma file contains six
desktop frames (1440 px) for a host onboarding flow; this project implements them and adds guest-facing
pages derived from the "live preview" card and theme designs shown in those frames.

Everything runs on **local, typed mock data**. There is no backend, API, auth or payment integration yet.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script              | What it does                                         |
| ------------------- | ---------------------------------------------------- |
| `npm run dev`       | Development server                                   |
| `npm run build`     | Production build                                     |
| `npm start`         | Serve the production build                           |
| `npm run lint`      | ESLint (Next.js core-web-vitals + TypeScript rules)  |
| `npm run typecheck` | Generates route types, then `tsc --noEmit` (strict)  |
| `npm run check`     | lint + typecheck + build                             |
| `npm run images`    | Regenerates the placeholder property illustrations   |

Requires Node.js 20.9 or newer. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL` once the
production domain is known — canonical URLs and absolute Open Graph URLs are only emitted when it is set.

## Stack

Next.js 16.4 (App Router, Cache Components / Partial Prerendering, Turbopack) · React 19.3 · TypeScript
(strict) · Tailwind CSS 4 (CSS-first `@theme`) · `next/font/local` · `next/image` · ESLint 9. No other
runtime dependencies.

## Pages

| Route | Source | Notes |
| --- | --- | --- |
| `/` | Figma "Account Info" | Sign-up form with validation, strength meter, live preview panel |
| `/setup/property` | Figma "About PRoperty" | Airbnb import (demo), type, location, counters, amenities, price, page link |
| `/setup/photos` | Figma "UploadPhotos" | Drag-and-drop/browse (local only), reorder, remove, cover photo |
| `/setup/description` | Figma "Ai Description" | Tone, rewrite, inline edit, FAQ editor (template-generated copy) |
| `/setup/theme` | Figma "Theme" | Casa (free) + 4 Pro themes, preview dialog, publish |
| `/setup/live` | Figma "Payment" | "Page is live" hero, copy link, WhatsApp share, launch checklist |
| `/setup/preview` | Derived | Draft rendered with the guest-page component |
| `/properties` | Derived | Search, type/guest filters, sort, pagination via URL params |
| `/properties/[slug]` | Derived | Gallery + lightbox, amenities, FAQ, booking inquiry; themed per property |
| `/themes`, `/contact` | Derived | Theme gallery; contact form |
| `/how-it-works`, `/pricing`, `/faq`, `/login`, `/about`, `/blog`, `/help`, `/terms`, `/privacy` | Placeholder | Linked from the Figma header/footer but not designed: consistent "coming soon" page, `noindex` |

Setup steps are `noindex` and disallowed in `robots.txt`.

## Design tokens — change the look in one place

**`src/styles/tokens.css`** is the single source of truth. Each token in `@theme` is both a CSS variable
on `:root` and a Tailwind utility (`--color-primary` → `bg-primary`, `--radius-card` → `rounded-card`,
`--text-display` → `text-display`, `--spacing-section` → `py-section`, `--container-page` → `max-w-page`).
Tailwind's default palette is removed, so components can only use the semantic tokens.

- Colours: brand, backgrounds, text, borders/focus, inputs, chips, states, header/footer
- Typography: heading/body families, a responsive type scale with line-heights, tracking and weights
- Layout: spacing (section, card, header height, control height), container widths, radii, shadows, motion
- Theme presets: `[data-theme="luxe|homestay|urban|coastal"]` remap the same tokens; guest pages apply
  the property's theme

Fonts (Plus Jakarta Sans for headings, DM Sans for body, identified in Figma) are self-hosted variable
WOFF2 files in `src/fonts/` (SIL OFL) loaded via `src/lib/fonts.ts`.

**Accessibility adjustments to Figma colours** (documented inline in `tokens.css`): the Figma orange
`#EE4D1B` with white button text is 3.67:1, below WCAG AA, so filled controls use `--color-primary: #CC3C0F`
while the logo and large display text keep `--color-brand: #EE4D1B`. The muted grey, success green and
WhatsApp green were darkened for the same reason. Set `--color-primary: var(--color-brand)` to match Figma
exactly.

## Data and future API

- Types: `src/types/property.ts`
- Mock data: `src/data/` (properties, amenities, themes, countries)
- Data access: `src/lib/properties/repository.ts` defines a vendor-neutral async `PropertyRepository`
  (`list`, `getBySlug`, `listSlugs`, `listFeatured`). Pages only use this interface.
  `mock-repository.ts` implements it in memory; filtering/sorting/pagination live in `query.ts`.
  To integrate an API, write another implementation and export it from `repository.ts`.
- Wizard state: `src/features/onboarding/draft-store.ts` (client store via `useSyncExternalStore`,
  persisted to `sessionStorage`; passwords and local photo blobs are never stored). Replace its
  `persist/load` with API calls later.
- `src/proxy.ts` returns a real 404 for unknown property slugs; swap its slug set for a fast lookup
  when data comes from an API.

## Demo behaviour (no backend)

Google sign-in, Airbnb import, Razorpay connect, calendar sync, inquiry and contact submissions all show
an explicit "demo mode — nothing was sent/connected" message. The "AI" copy is generated in the browser
from templates. Ratings, bookings and the non-Green-Casa listings are fictional sample data and are not
exposed as structured data.

## Images

The photos in the Figma file could not be exported (view-only access), so `public/images/properties/`
contains generated flat illustrations (`scripts/generate-placeholder-images.mjs`). Replace any file with a
real photo of the same name (3:2 recommended) — no code changes needed. Alt texts live in
`src/data/properties.ts`.

## Project structure

```
src/
  app/                    routes, metadata, sitemap.ts, robots.ts, not-found.tsx
  components/
    layout/ ui/ property/ search/ info/ theme/ seo/
  features/onboarding/    wizard steps, preview components, store, copy templates
  config/site.ts          brand, navigation, placeholder pages
  data/                   typed mock data
  lib/                    repository, query helpers, SEO helpers, validation, utils, fonts
  styles/tokens.css       design tokens
  types/property.ts       domain types
  proxy.ts                404 for unknown property slugs
```
