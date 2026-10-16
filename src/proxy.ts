import { NextResponse, type NextRequest } from "next/server";
import { properties } from "@/data/properties";

/**
 * Returns a real 404 status for unknown property slugs. Without this, the page
 * would start streaming before notFound() runs (Partial Prerendering) and answer
 * 200 + noindex. Keep this check cheap: with an API backend, replace the set with
 * a lightweight slug lookup or cache.
 */
const knownSlugs = new Set(properties.map((property) => property.slug));

export function proxy(request: NextRequest) {
  const slug = request.nextUrl.pathname.split("/")[2];
  if (slug && !knownSlugs.has(decodeURIComponent(slug))) {
    return NextResponse.rewrite(new URL("/__not-found/property", request.url), { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/properties/:slug",
};
