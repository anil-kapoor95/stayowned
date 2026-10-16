import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { JsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl } from "@/lib/seo";

export type Crumb = { label: string; href?: string };

/** Visible breadcrumb trail plus matching BreadcrumbList structured data. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const ld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href && absoluteUrl(item.href) ? { item: absoluteUrl(item.href) } : {}),
    })),
  };

  return (
    <>
      <nav aria-label="Breadcrumb" className="text-small">
        <ol className="flex flex-wrap items-center gap-1.5 text-muted">
          {items.map((item, index) => {
            const last = index === items.length - 1;
            return (
              <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
                {item.href && !last ? (
                  <Link
                    href={item.href}
                    className="rounded-sm text-body hover:text-link-hover hover:underline underline-offset-4 focus-visible:outline-none focus-visible:focus-ring"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span aria-current={last ? "page" : undefined} className="font-medium text-heading">
                    {item.label}
                  </span>
                )}
                {!last ? <Icon name="chevronRight" size={14} /> : null}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={ld} />
    </>
  );
}
