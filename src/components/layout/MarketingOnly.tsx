"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** StayOwned header, banner and footer: not on a host's own website (/property/<slug>). */
export function MarketingOnly({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return pathname.startsWith("/property/") ? null : <>{children}</>;
}
