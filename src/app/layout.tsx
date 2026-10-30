import type { Metadata, Viewport } from "next";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { fontBody, fontDisplay, fontHeading } from "@/lib/fonts";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ResumeBanner } from "@/components/layout/ResumeBanner";
import { MarketingOnly } from "@/components/layout/MarketingOnly";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url ?? siteConfig.fallbackUrl),
  title: {
    default: `${siteConfig.name} — your own direct booking website`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: "website",
  },
  twitter: { card: "summary" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fontHeading.variable} ${fontBody.variable} ${fontDisplay.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only-focusable left-4 top-3 z-50 rounded-button bg-secondary px-4 py-2 font-semibold text-on-secondary"
        >
          Skip to main content
        </a>
        <MarketingOnly>
          <Header />
          <ResumeBanner />
        </MarketingOnly>
        <main id="main" className="flex flex-1 flex-col">
          {children}
        </main>
        <MarketingOnly>
          <Footer />
        </MarketingOnly>
      </body>
    </html>
  );
}
