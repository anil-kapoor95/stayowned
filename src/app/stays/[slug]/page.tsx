import type { Metadata } from "next";
import { HostSite } from "@/components/layout/HostSite";
import { notFound } from "next/navigation";
import { CompanyWebsite } from "@/features/company-page/CompanyWebsite";
import { getCompanyPage } from "@/lib/api/company-page";
import { truncate } from "@/lib/seo";
import { SITE_HEADERS } from "@/lib/site-headers";
import { headers } from "next/headers";

type Props = { params: Promise<{ slug: string }> };

// The host's own website is rendered on each request (properties, prices and photos change in the back office).
export const instant = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getCompanyPage(slug);
  if (!page) return { title: "Page not found", robots: { index: false } };
  const count = page.properties.length;
  const cover = page.properties.find((p) => p.photo)?.photo;
  return {
    // the host's site: no " · StayOwned" suffix
    title: { absolute: `${page.name} — ${count} ${count === 1 ? "stay" : "stays"}` },
    description: truncate(page.description ?? `Book direct with ${page.name}: ${page.properties.map((p) => p.name).join(", ")}.`),
    alternates: { canonical: await canonical(page.slug) },
    openGraph: { title: page.name, images: cover ? [{ url: cover }] : undefined },
  };
}

/** "/stays/<company>", or the home page of the company's own domain. */
async function canonical(slug: string) {
  const domain = (await headers()).get(SITE_HEADERS.domain);
  return domain ? `https://${domain}/` : `/stays/${slug}`;
}

export default async function CompanyWebsitePage({ params }: Props) {
  const { slug } = await params;
  const page = await getCompanyPage(slug);
  if (!page) notFound();
  // on a host's own domain only that host's page
  const company = (await headers()).get(SITE_HEADERS.company);
  if (company && company !== page.slug) notFound();
  return (
    <>
      <HostSite />
      <CompanyWebsite page={page} />
    </>
  );
}
