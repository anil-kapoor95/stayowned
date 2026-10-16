import {
  PROPERTY_TYPES,
  type PaginatedResult,
  type Property,
  type PropertyQuery,
  type PropertySort,
  type PropertyType,
} from "@/types/property";
import { firstParam } from "@/lib/utils";

export const DEFAULT_PAGE_SIZE = 6;
export const SORT_OPTIONS: { value: PropertySort; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
];

/** Pure filter/sort/paginate — shared by the mock repository and any client-side use. */
export function queryProperties(all: Property[], query: PropertyQuery): PaginatedResult<Property> {
  const search = query.search?.trim().toLowerCase();
  let items = all.filter((property) => {
    if (query.type && property.type !== query.type) return false;
    if (query.guests && property.maxGuests < query.guests) return false;
    if (search) {
      const haystack = [
        property.name,
        property.location.locality,
        property.location.region,
        property.location.country,
        property.headline,
      ]
        .join(" ")
        .toLowerCase();
      if (!search.split(/\s+/).every((term) => haystack.includes(term))) return false;
    }
    return true;
  });

  items = sortProperties(items, query.sort ?? "recommended");

  const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE;
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, query.page ?? 1), totalPages);
  const start = (page - 1) * pageSize;

  return { items: items.slice(start, start + pageSize), total, page, pageSize, totalPages };
}

export function sortProperties(items: Property[], sort: PropertySort): Property[] {
  const copy = [...items];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.price.amount - b.price.amount);
    case "price-desc":
      return copy.sort((a, b) => b.price.amount - a.price.amount);
    case "rating":
      return copy.sort((a, b) => (b.rating?.average ?? 0) - (a.rating?.average ?? 0));
    case "recommended":
    default:
      return copy.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  }
}

const isType = (value: string | undefined): value is PropertyType =>
  Boolean(value) && (PROPERTY_TYPES as readonly string[]).includes(value as string);
const isSort = (value: string | undefined): value is PropertySort =>
  SORT_OPTIONS.some((option) => option.value === value);

/** Parses and validates URL search params into a PropertyQuery (invalid values are dropped). */
export function parsePropertyQuery(
  params: Record<string, string | string[] | undefined>,
): PropertyQuery {
  const search = firstParam(params.q)?.slice(0, 80);
  const type = firstParam(params.type);
  const sort = firstParam(params.sort);
  const guests = Number.parseInt(firstParam(params.guests) ?? "", 10);
  const page = Number.parseInt(firstParam(params.page) ?? "", 10);
  return {
    search: search || undefined,
    type: isType(type) ? type : undefined,
    sort: isSort(sort) ? sort : undefined,
    guests: Number.isFinite(guests) && guests > 0 && guests <= 30 ? guests : undefined,
    page: Number.isFinite(page) && page > 0 ? page : undefined,
  };
}

/** Serialises a query back to a URL search string, omitting defaults. */
export function propertyQueryToSearch(query: PropertyQuery): string {
  const params = new URLSearchParams();
  if (query.search) params.set("q", query.search);
  if (query.type) params.set("type", query.type);
  if (query.guests) params.set("guests", String(query.guests));
  if (query.sort && query.sort !== "recommended") params.set("sort", query.sort);
  if (query.page && query.page > 1) params.set("page", String(query.page));
  const search = params.toString();
  return search ? `?${search}` : "";
}
