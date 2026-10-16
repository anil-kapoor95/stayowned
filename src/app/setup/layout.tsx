import type { Metadata } from "next";
import type { ReactNode } from "react";

/** Setup steps hold per-host draft data: keep them out of search results. */
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function SetupLayout({ children }: { children: ReactNode }) {
  return children;
}
