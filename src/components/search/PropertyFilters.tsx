import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SelectField, TextField } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { PROPERTY_TYPE_LABELS } from "@/data/amenities";
import { SORT_OPTIONS } from "@/lib/properties/query";
import { PROPERTY_TYPES, type PropertyQuery } from "@/types/property";

/**
 * Search, filter and sort form. Submits with GET so the results are server-rendered,
 * shareable, crawlable URLs and work without JavaScript.
 */
export function PropertyFilters({ query }: { query: PropertyQuery }) {
  const hasFilters = Boolean(query.search || query.type || query.guests || (query.sort && query.sort !== "recommended"));
  return (
    <form
      method="get"
      action="/properties"
      role="search"
      aria-label="Search properties"
      className="grid grid-cols-1 gap-4 rounded-card border border-border bg-card p-4 shadow-card sm:grid-cols-2 sm:p-5 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))_auto] lg:items-end"
    >
      <TextField
        id="filter-q"
        name="q"
        type="search"
        label="Where to?"
        placeholder="Search by place or name"
        defaultValue={query.search ?? ""}
        prefix={<Icon name="search" size={17} />}
        wrapperClassName="sm:col-span-2 lg:col-span-1"
      />
      <SelectField id="filter-type" name="type" label="Property type" defaultValue={query.type ?? ""}>
        <option value="">All types</option>
        {PROPERTY_TYPES.map((type) => (
          <option key={type} value={type}>
            {PROPERTY_TYPE_LABELS[type]}
          </option>
        ))}
      </SelectField>
      <SelectField id="filter-guests" name="guests" label="Guests" defaultValue={query.guests ? String(query.guests) : ""}>
        <option value="">Any</option>
        {[1, 2, 4, 6, 8, 10].map((count) => (
          <option key={count} value={count}>
            {count}+ guests
          </option>
        ))}
      </SelectField>
      <SelectField id="filter-sort" name="sort" label="Sort by" defaultValue={query.sort ?? "recommended"}>
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </SelectField>
      <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-1">
        <Button type="submit" size="lg" className="flex-1 lg:flex-none">
          <Icon name="search" size={17} /> Search
        </Button>
        {hasFilters ? (
          <Link
            href="/properties"
            className="whitespace-nowrap rounded-sm text-small font-semibold text-heading underline underline-offset-2 hover:text-link-hover focus-visible:outline-none focus-visible:focus-ring"
          >
            Clear
          </Link>
        ) : null}
      </div>
    </form>
  );
}
