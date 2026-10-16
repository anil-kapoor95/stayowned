import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { propertyRepository } from "@/lib/properties/repository";

/**
 * Indexable routes only: home, the listing index, property pages and themes.
 * Setup steps and "coming soon" placeholders are noindex and left out.
 * Absolute URLs use NEXT_PUBLIC_SITE_URL (falls back to localhost in development).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url ?? siteConfig.fallbackUrl;
  const slugs = await propertyRepository.listSlugs();
  return [
    { url: `${base}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/properties`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/themes`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.3 },
    ...slugs.map((slug) => ({
      url: `${base}/properties/${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
