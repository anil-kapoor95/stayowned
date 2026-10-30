import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PropertyWebsite } from "@/features/property-page/PropertyWebsite";
import { getPropertyPage } from "@/lib/api/property-page";
import { truncate } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

// The host's own website is rendered on each request (prices, photos and bookings change in the back office).
export const instant = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPropertyPage(slug);
  if (!page) return { title: "Page not found", robots: { index: false } };
  const place = [page.location.city, page.location.country].filter(Boolean).join(", ");
  const cover = page.photos[0];
  return {
    // the host's site: no " · StayOwned" suffix
    title: { absolute: page.headline ? `${page.name} — ${page.headline}` : page.name },
    description: truncate(page.description ?? `${page.name}${place ? ` in ${place}` : ""}`),
    alternates: { canonical: `/property/${page.slug}` },
    openGraph: { title: page.name, images: cover ? [{ url: cover.url }] : undefined },
  };
}

export default async function PropertyWebsitePage({ params }: Props) {
  const { slug } = await params;
  const page = await getPropertyPage(slug);
  if (!page) notFound();
  return <PropertyWebsite page={page} />;
}
