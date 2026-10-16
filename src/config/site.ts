/**
 * Site-wide configuration. Brand copy comes from the Figma header/footer.
 * The production URL is NOT hard-coded: set NEXT_PUBLIC_SITE_URL (see .env.example).
 */

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const siteConfig = {
  name: "StayOwned",
  tagline: "Your own booking website for villas, homestays and holiday homes.",
  description:
    "Create a direct booking website for your villa, homestay or holiday home in about 5 minutes. Share one link on WhatsApp and Instagram and take bookings with 0% commission.",
  /** Absolute production origin, e.g. https://www.example.com — undefined when not configured. */
  url: rawSiteUrl ? rawSiteUrl.replace(/\/+$/, "") : undefined,
  /** Used for metadataBase in development when no production URL is configured. */
  fallbackUrl: "http://localhost:3000",
  locale: "en_IN",
} as const;

/**
 * Host shown in booking-page links ("stayowned.com/green-casa"), as in the Figma.
 * Display text only — change it when the production domain is decided.
 */
export const bookingLinkHost = "stayowned.com";

export type NavItem = { label: string; href: string };

export const mainNav: NavItem[] = [
  { label: "How it works", href: "/how-it-works" },
  { label: "Themes", href: "/themes" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact us", href: "/contact" },
];

export const authNav = {
  login: { label: "Log in", href: "/login" },
  cta: { label: "Create free page", href: "/setup/account" },
} as const;

export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: "Product",
    items: [
      { label: "How it works", href: "/how-it-works" },
      { label: "Themes", href: "/themes" },
      { label: "Pricing", href: "/pricing" },
      { label: "Example pages", href: "/properties" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About us", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Support",
    items: [
      { label: "Help centre", href: "/help" },
      { label: "Terms of use", href: "/terms" },
      { label: "Privacy policy", href: "/privacy" },
    ],
  },
];

/** Routes for undesigned pages rendered with the shared "coming soon" layout. */
export const placeholderPages = {
  "how-it-works": {
    title: "How it works",
    description: "A step-by-step look at creating and sharing your StayOwned booking page.",
  },
  pricing: {
    title: "Pricing",
    description: "Free and Pro plans for direct booking websites.",
  },
  faq: { title: "FAQ", description: "Answers to common questions from hosts." },
  login: { title: "Log in", description: "Sign in to manage your booking page." },
  about: { title: "About us", description: "The team behind StayOwned." },
  blog: { title: "Blog", description: "Guides for independent hosts." },
  help: { title: "Help centre", description: "Setup guides and support articles." },
  terms: { title: "Terms of use", description: "The terms that apply to StayOwned." },
  privacy: { title: "Privacy policy", description: "How StayOwned handles your data." },
} as const;

export type PlaceholderSlug = keyof typeof placeholderPages;
