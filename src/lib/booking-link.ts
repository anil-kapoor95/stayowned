"use client";

import { useSyncExternalStore } from "react";
import { siteConfig } from "@/config/site";

/**
 * Address of a host's booking page, from the domain the site runs on (localhost:3000 locally, the real
 * domain in production): "<host>/<slug>" (short link). On the server (first render) NEXT_PUBLIC_SITE_URL is
 * used, or http://localhost:3000; the browser then shows its own address.
 */
const noSubscribe = () => () => {};
const serverOrigin = () => siteConfig.url ?? siteConfig.fallbackUrl;
const browserOrigin = () => window.location.origin;

export function useBookingLink(): { base: string; scheme: string; origin: string } {
  const origin = useSyncExternalStore(noSubscribe, browserOrigin, serverOrigin);
  const match = /^(https?:\/\/)(.*)$/.exec(origin);
  const scheme = match ? match[1] : "https://";
  const host = match ? match[2] : origin;
  return { base: host, scheme, origin };
}
