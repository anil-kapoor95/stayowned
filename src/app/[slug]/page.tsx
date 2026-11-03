import type { Metadata } from "next";
import { HostSite } from "@/components/layout/HostSite";
import { notFound, permanentRedirect } from "next/navigation";
import { PropertyWebsite } from "@/features/property-page/PropertyWebsite";
import { getPropertyPage } from "@/lib/api/property-page";
import { truncate } from "@/lib/seo";
import { sitePaths } from "@/lib/site-paths";

type Props = { params: Promise<{ slug: string }> };

// The host's own website is rendered on each request (prices, photos and bookings change in the back office).
export const instant = false;

/**
 * A host's property website: stayowned.com/<slug> (short link, unique per property: "casanova", "casanova-2"),
 * or the host's own domain (www.myvilla.com, see src/proxy.ts).
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPropertyPage(slug);
  if (!page) return { title: "Page not found", robots: { index: false } };
  const paths = await sitePaths(page.slug, page.host.slug);
  const place = [page.location.city, page.location.country].filter(Boolean).join(", ");
  const cover = page.photos[0];
  return {
    // the host's site: no " · StayOwned" suffix
    title: { absolute: page.headline ? `${page.name} — ${page.headline}` : page.name },
    description: truncate(page.description ?? `${page.name}${place ? ` in ${place}` : ""}`),
    alternates: { canonical: paths.domain ? `https://${paths.domain}${paths.property || "/"}` : paths.property },
    openGraph: { title: page.name, images: cover ? [{ url: cover.url }] : undefined },
  };
}

export default async function PropertyWebsitePage({ params }: Props) {
  const { slug } = await params;
  const page = await getPropertyPage(slug);
  if (!page) notFound();
  const paths = await sitePaths(page.slug, page.host.slug);
  // on a host's own domain only that host's properties
  if (paths.domainCompany && page.host.slug !== paths.domainCompany) notFound();
  // an old link (made from the name before a rename): go to the property's own link
  if (page.slug !== slug && !(paths.domain && paths.property === "")) permanentRedirect(paths.property || "/");
  return (
    <>
      <HostSite />
      <PropertyWebsite page={page} basePath={paths.property} companyHref={paths.company} />
    </>
  );
}
