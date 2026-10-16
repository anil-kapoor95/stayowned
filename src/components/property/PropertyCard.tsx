import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { SafeImage } from "@/components/ui/SafeImage";
import { PROPERTY_TYPE_LABELS } from "@/data/amenities";
import { formatPrice, pluralize } from "@/lib/utils";
import type { Property } from "@/types/property";

export function propertyHref(slug: string) {
  return `/properties/${slug}`;
}

/** Listing card. The title link is stretched over the whole card for a large hit area. */
export function PropertyCard({ property, priority = false }: { property: Property; priority?: boolean }) {
  const cover = property.images[0];
  const place = `${property.location.locality}, ${property.location.region}`;
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-card border border-border bg-card shadow-card transition-shadow duration-(--duration-base) focus-within:focus-ring hover:shadow-panel">
      <div className="relative aspect-photo overflow-hidden bg-surface-muted">
        {cover ? (
          <SafeImage
            src={cover.src}
            alt={cover.alt}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 380px, (min-width: 640px) 45vw, 100vw"
            className="object-cover transition-transform duration-500 ease-(--ease-standard) group-hover:scale-[1.03] motion-reduce:transform-none"
          />
        ) : null}
        <span className="absolute left-3 top-3 rounded-sm bg-primary-strong px-2 py-0.5 text-caption font-bold uppercase tracking-wide text-on-primary">
          {PROPERTY_TYPE_LABELS[property.type]}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-heading text-title text-heading">
            <Link
              href={propertyHref(property.slug)}
              className="outline-none after:absolute after:inset-0 after:content-['']"
            >
              {property.name}
            </Link>
          </h3>
          {property.rating ? (
            <p className="flex shrink-0 items-center gap-1 text-small font-semibold text-heading">
              <Icon name="star" size={14} className="text-rating" />
              {property.rating.average.toFixed(2)}
              <span className="sr-only"> out of 5 from {property.rating.count} reviews</span>
            </p>
          ) : null}
        </div>
        <p className="-mt-2 flex items-center gap-1.5 text-small text-body">
          <Icon name="mapPin" size={14} className="shrink-0" /> {place}
        </p>
        <p className="line-clamp-2 text-small text-body">{property.headline}</p>
        <ul className="flex flex-wrap gap-1.5 text-caption text-heading">
          <li className="flex items-center gap-1 rounded-sm bg-tag-bg px-2 py-1">
            <Icon name="bed" size={13} /> {pluralize(property.bedrooms, "bedroom")}
          </li>
          <li className="flex items-center gap-1 rounded-sm bg-tag-bg px-2 py-1">
            <Icon name="users" size={13} /> Sleeps {property.maxGuests}
          </li>
        </ul>
        <p className="mt-auto border-t border-divider pt-3 text-heading">
          <span className="font-heading text-stat">{formatPrice(property.price.amount, property.price.currency)}</span>{" "}
          <span className="text-small text-muted">/ night</span>
        </p>
      </div>
    </article>
  );
}
