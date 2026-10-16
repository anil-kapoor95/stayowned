import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { propertyQueryToSearch } from "@/lib/properties/query";
import { cn } from "@/lib/utils";
import type { PropertyQuery } from "@/types/property";

export function Pagination({ query, page, totalPages }: { query: PropertyQuery; page: number; totalPages: number }) {
  if (totalPages <= 1) return null;
  const href = (target: number) => `/properties${propertyQueryToSearch({ ...query, page: target })}`;
  const base =
    "grid h-11 min-w-11 place-items-center rounded-button border px-3 text-small font-semibold transition-colors focus-visible:outline-none focus-visible:focus-ring";
  return (
    <nav aria-label="Pagination" className="mt-10 flex justify-center">
      <ul className="flex flex-wrap items-center gap-2">
        <li>
          {page > 1 ? (
            <Link href={href(page - 1)} rel="prev" className={cn(base, "border-border bg-surface text-heading hover:border-border-strong")}>
              <span className="flex items-center gap-1">
                <Icon name="chevronLeft" size={16} /> Previous
              </span>
            </Link>
          ) : (
            <span aria-disabled="true" className={cn(base, "border-border bg-surface text-muted opacity-60")}>
              <span className="flex items-center gap-1">
                <Icon name="chevronLeft" size={16} /> Previous
              </span>
            </span>
          )}
        </li>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((target) => (
          <li key={target}>
            <Link
              href={href(target)}
              aria-current={target === page ? "page" : undefined}
              aria-label={`Page ${target}`}
              className={cn(
                base,
                target === page
                  ? "border-primary bg-primary text-on-primary"
                  : "border-border bg-surface text-heading hover:border-border-strong",
              )}
            >
              {target}
            </Link>
          </li>
        ))}
        <li>
          {page < totalPages ? (
            <Link href={href(page + 1)} rel="next" className={cn(base, "border-border bg-surface text-heading hover:border-border-strong")}>
              <span className="flex items-center gap-1">
                Next <Icon name="chevronRight" size={16} />
              </span>
            </Link>
          ) : (
            <span aria-disabled="true" className={cn(base, "border-border bg-surface text-muted opacity-60")}>
              <span className="flex items-center gap-1">
                Next <Icon name="chevronRight" size={16} />
              </span>
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
