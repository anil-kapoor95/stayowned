"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** StayOwned header, banner and footer: not on a host's own website (/property/<slug>, /stays/<company>). */
export function MarketingOnly({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return pathname.startsWith("/property/") || pathname.startsWith("/stays/") ? null : <>{children}</>;
}
