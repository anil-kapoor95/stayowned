import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  const base = siteConfig.url ?? siteConfig.fallbackUrl;
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/setup/"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
