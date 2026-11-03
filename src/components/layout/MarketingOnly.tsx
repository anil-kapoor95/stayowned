"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * StayOwned header, banner and footer: not on a host's own website. Host pages (/<property>, /stays/<company>,
 * and every page of a host's own domain) render <HostSite />, whose style hides this wrapper (no flash).
 */
export function MarketingOnly({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/property/") || pathname.startsWith("/stays/")) return null;
  return (
    <div data-marketing="" className="contents">
      {children}
    </div>
  );
}
