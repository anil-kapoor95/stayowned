import Link from "next/link";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PropertyCard } from "@/components/property/PropertyCard";
import { Pagination } from "@/components/search/Pagination";
import { PropertyFilters } from "@/components/search/PropertyFilters";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { PROPERTY_TYPE_LABELS } from "@/data/amenities";
import { parsePropertyQuery } from "@/lib/properties/query";
import { propertyRepository } from "@/lib/properties/repository";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Stays booked directly with hosts",
  description:
    "Browse villas, homestays, apartments and cottages that take direct bookings on StayOwned — no OTA commission.",
  path: "/properties",
});

export default function PropertiesPage({ searchParams }: PageProps<"/properties">) {
  return (
    <div className="container-page py-8 sm:py-10">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Properties", href: "/properties" },
        ]}
      />
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-display">Stays you can book directly</h1>
          <p className="mt-2 max-w-2xl text-lead text-body">
            Every listing here is a host&apos;s own StayOwned page — book with them directly, with 0% commission.
          </p>
        </div>
        <Button href="/" variant="outline" className="self-start sm:self-auto">
          List your property <Icon name="arrowRight" size={16} />
        </Button>
      </div>
      <Suspense fallback={<ResultsSkeleton />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Results({ searchParams }: { searchParams: PageProps<"/properties">["searchParams"] }) {
  const query = parsePropertyQuery(await searchParams);
  const result = await propertyRepository.list(query);
  const from = (result.page - 1) * result.pageSize + 1;
  const to = from + result.items.length - 1;

  return (
    <>
      <div className="mt-8">
        <PropertyFilters query={query} />
      </div>
      <h2 className="sr-only">Search results</h2>
      <p className="mt-6 text-small text-body" role="status">
        {result.total === 0
          ? "No stays found"
          : `Showing ${from}–${to} of ${result.total} ${result.total === 1 ? "stay" : "stays"}`}
        {query.type ? ` · ${PROPERTY_TYPE_LABELS[query.type]}` : ""}
        {query.search ? ` · “${query.search}”` : ""}
      </p>

      {result.items.length ? (
        <ul className="mt-4 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {result.items.map((property, index) => (
            <li key={property.id}>
              <PropertyCard property={property} priority={index < 3} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4 flex flex-col items-center rounded-card border border-dashed border-border-strong bg-card px-6 py-14 text-center">
          <span className="grid size-14 place-items-center rounded-pill bg-primary-soft text-primary-strong">
            <Icon name="search" size={24} />
          </span>
          <h2 className="mt-4 text-section">No stays match your search</h2>
          <p className="mt-2 max-w-md text-body">Try a different place, fewer guests or another property type.</p>
          <Link
            href="/properties"
            className="mt-5 rounded-sm font-semibold text-primary-strong underline underline-offset-4 hover:text-primary focus-visible:outline-none focus-visible:focus-ring"
          >
            Clear all filters
          </Link>
        </div>
      )}

      <Pagination query={query} page={result.page} totalPages={result.totalPages} />
    </>
  );
}

function ResultsSkeleton() {
  return (
    <div aria-hidden="true" className="mt-8 animate-pulse">
      <div className="h-24 rounded-card bg-surface-muted" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-96 rounded-card bg-surface-muted" />
        ))}
      </div>
    </div>
  );
}
