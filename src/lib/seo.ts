import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

/** Absolute URL for a path — only when a production URL is configured. */
export function absoluteUrl(path: string): string | undefined {
  if (!siteConfig.url) return undefined;
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Page metadata helper. Canonical URLs are emitted only when NEXT_PUBLIC_SITE_URL
 * is set, so development/preview builds never advertise a wrong canonical.
 */
export function pageMetadata({
  title,
  description,
  path,
  noindex = false,
  images,
}: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  images?: { url: string; width: number; height: number; alt: string }[];
}): Metadata {
  return {
    title,
    description,
    alternates: siteConfig.url ? { canonical: path } : undefined,
    openGraph: {
      title,
      description,
      url: path,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: "website",
      ...(images ? { images } : {}),
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title,
      description,
      ...(images ? { images: images.map((image) => image.url) } : {}),
    },
    robots: noindex ? { index: false, follow: true } : undefined,
  };
}

/** Shortens text to a meta-description length on a word boundary. */
export function truncate(text: string, max = 158): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,.;:\s]+$/, "")}…`;
}
