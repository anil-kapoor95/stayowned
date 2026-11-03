import { headers } from "next/headers";
import { SITE_HEADERS } from "./site-headers";

/**
 * Paths of a host's website for the current request.
 *
 * - On the StayOwned website: a property is at "/<slug>" (short link) and the company page at "/stays/<company>".
 * - On a host's own domain (set by src/proxy.ts): with one property, the property is the home page ("");
 *   with several, the home page lists them ("/") and each one is at "/<slug>".
 */
export type SitePaths = {
  /** Path of the property ("" = home page of the host's own domain). */
  property: string;
  /** Company page with all the host's properties, null when there is none to show. */
  company: string | null;
  /** The host's own domain (www.myvilla.com) or null on the StayOwned website. */
  domain: string | null;
  /** Company of the own domain: other companies' properties are not shown there. */
  domainCompany: string | null;
};

export { SITE_HEADERS };

export async function sitePaths(slug: string, companySlug?: string | null): Promise<SitePaths> {
  const h = await headers();
  const domain = h.get(SITE_HEADERS.domain);
  if (domain) {
    const single = h.get(SITE_HEADERS.single) || "";
    return {
      property: single && single === slug ? "" : `/${slug}`,
      company: single ? null : "/",
      domain,
      domainCompany: h.get(SITE_HEADERS.company),
    };
  }
  return { property: `/${slug}`, company: companySlug ? `/stays/${companySlug}` : null, domain: null, domainCompany: null };
}
