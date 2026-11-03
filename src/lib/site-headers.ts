/** Request headers set by src/proxy.ts on a host's own domain (read by src/lib/site-paths.ts). */
export const SITE_HEADERS = {
  domain: "x-site-domain",
  company: "x-site-company",
  single: "x-site-single",
} as const;
