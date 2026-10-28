"use client";

import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { SafeImage } from "@/components/ui/SafeImage";
import { getAmenity, PROPERTY_TYPE_LABELS } from "@/data/amenities";
import { bookingLinkHost } from "@/config/site";
import { cn, formatPrice, pluralize } from "@/lib/utils";
import type { Property } from "@/types/property";

type Variant = "details" | "photos" | "content" | "phone";

/** The "LIVE PREVIEW (WHAT GUESTS SEE)" card from the wizard's right-hand panel. */
export function LivePreviewCard({ property, variant }: { property: Property; variant: Variant }) {
  const cover = property.images[0];
  const typeLabel = `Entire private ${PROPERTY_TYPE_LABELS[property.type].toLowerCase()}`;
  const place = [property.location.locality, property.location.region].filter(Boolean).join(", ");
  const price = property.price.amount > 0 ? formatPrice(property.price.amount, property.price.currency) : "—";
  const rating = property.rating;

  return (
    <div className="overflow-hidden rounded-media bg-surface text-left shadow-panel">
      {variant !== "phone" ? (
        <div className="flex items-center gap-3 border-b border-divider bg-surface px-3 py-2.5">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-pill bg-window-close" />
            <span className="size-2.5 rounded-pill bg-window-minimise" />
            <span className="size-2.5 rounded-pill bg-window-zoom" />
          </span>
          <span className="flex min-w-0 flex-1 items-center justify-between gap-2 rounded-sm bg-surface-muted px-3 py-1 text-caption">
            <span className="truncate text-body">
              https://{bookingLinkHost}/
              <strong className="font-bold text-primary-strong">{property.slug || "your-page"}</strong>
            </span>
            <span className="shrink-0 rounded-sm bg-success-soft px-1.5 py-px text-micro font-bold text-success">
              SSL LIVE
            </span>
          </span>
        </div>
      ) : null}

      <div className={cn("relative aspect-hero w-full", !cover && "bg-secondary-active")}>
        {cover ? (
          <SafeImage src={cover.src} alt={cover.alt} fill sizes="(min-width: 1024px) 400px, 90vw" className="object-cover" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-image-scrim via-image-scrim/45 via-45% to-transparent" />
        {variant === "phone" && rating ? (
          <RatingPill rating={rating} className="absolute left-3 top-3" />
        ) : null}
        <div className="absolute inset-x-0 bottom-0 p-4 text-on-dark">
          {variant === "phone" ? (
            <p className="text-caption font-bold uppercase tracking-wide text-primary-on-dark">{typeLabel}</p>
          ) : (
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <span className="rounded-sm bg-primary-strong px-2 py-0.5 text-caption font-bold uppercase tracking-wide text-on-primary">
                {typeLabel}
              </span>
              {rating ? <RatingPill rating={rating} /> : null}
            </div>
          )}
          <p className="font-heading text-title text-on-dark">
            {property.name}
            {variant === "phone" ? ` ${property.location.locality}` : ""}
          </p>
          {variant !== "phone" ? (
            <p className="text-caption text-on-dark-muted">
              {property.summary}
              {place ? ` · ${place}` : ""}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-3 p-4">
        {variant === "details" ? <DetailsBody property={property} /> : null}
        {variant === "photos" ? <Thumbnails property={property} /> : null}
        {variant === "content" ? <ContentBody property={property} place={place} /> : null}
        {variant === "phone" ? <PhoneBody property={property} place={place} /> : null}

        <div className={cn("flex items-end justify-between gap-3", variant === "details" && "border-t border-divider pt-3")}>
          <div>
            <p className="text-heading">
              <span className="font-heading text-stat">{price}</span>{" "}
              <span className="text-caption text-muted">/ night</span>
            </p>
            {variant !== "content" && variant !== "photos" ? (
              <p className="text-caption font-semibold text-success">
                Direct booking rate{variant === "details" ? " · 0% commission" : ""}
              </p>
            ) : null}
            {variant === "photos" ? (
              <p className="text-caption font-semibold text-success">Direct booking rate · 0% commission</p>
            ) : null}
          </div>
          {/* Visual only: this is a preview of the guest page, not an interactive control. */}
          <span aria-hidden="true" className="rounded-sm bg-primary px-3.5 py-2 text-small font-semibold text-on-primary">
            {variant === "phone" ? "Book now →" : "Book Now"}
          </span>
        </div>
      </div>
    </div>
  );
}

function RatingPill({ rating, className }: { rating: NonNullable<Property["rating"]>; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm bg-secondary/70 px-2 py-0.5 text-caption text-on-dark backdrop-blur-sm",
        className,
      )}
    >
      <Icon name="star" size={12} className="text-rating" />
      <strong className="font-bold">{rating.average.toFixed(2)}</strong>
      <span className="text-on-dark-muted">({rating.count} reviews)</span>
    </span>
  );
}

function Pill({ icon, children, highlight }: { icon?: IconName; children: ReactNode; highlight?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-caption font-medium",
        highlight ? "bg-primary-soft text-primary-strong" : "bg-tag-bg text-heading",
      )}
    >
      {icon ? <Icon name={icon} size={13} /> : null}
      {children}
    </span>
  );
}

function DetailsBody({ property }: { property: Property }) {
  const extras = property.amenities.filter((id) => id !== "private-pool").slice(0, 3);
  return (
    <>
      <div className="flex flex-wrap gap-1.5">
        {property.bedrooms > 0 ? <Pill icon="bed">{pluralize(property.bedrooms, "bedroom")}</Pill> : null}
        {property.bathrooms > 0 ? <Pill icon="bath">{pluralize(property.bathrooms, "bath")}</Pill> : null}
        {property.maxGuests > 0 ? <Pill icon="users">{pluralize(property.maxGuests, "guest")}</Pill> : null}
        {property.amenities.includes("private-pool") ? (
          <Pill icon="waves" highlight>
            Private Pool
          </Pill>
        ) : null}
      </div>
      {extras.length > 0 ? (
        <p className="text-caption text-body">{extras.map((id) => getAmenity(id).label).join(" · ")}</p>
      ) : null}
    </>
  );
}

function Thumbnails({ property }: { property: Property }) {
  const thumbs = property.images.slice(1, 4);
  if (thumbs.length === 0) return <p className="text-caption text-muted">Add more photos to fill your gallery.</p>;
  return (
    <div className="grid grid-cols-3 gap-2">
      {thumbs.map((image) => (
        <div key={image.src} className="relative aspect-thumb overflow-hidden rounded-sm">
          <SafeImage src={image.src} alt={image.alt} fill sizes="120px" className="object-cover" />
        </div>
      ))}
    </div>
  );
}

function ContentBody({ property, place }: { property: Property; place: string }) {
  return (
    <>
      <div>
        {property.headline ? <p className="font-heading text-title text-heading">{property.headline}</p> : null}
        <p className="mt-0.5 text-caption text-muted">{place}</p>
      </div>
      {property.description ? <p className="line-clamp-3 text-caption text-body">{property.description}</p> : null}
      <div className="flex flex-wrap gap-1.5">
        {property.highlights.map((item) => (
          <Pill key={item} highlight>
            {item}
          </Pill>
        ))}
      </div>
      <ul className="divide-y divide-divider border-y border-divider">
        {property.faqs.slice(0, 2).map((faq) => (
          <li key={faq.question} className="flex items-center justify-between gap-2 py-2 text-caption font-semibold text-heading">
            {faq.question}
            <Icon name="plus" size={13} className="text-primary" />
          </li>
        ))}
      </ul>
    </>
  );
}

function PhoneBody({ property, place }: { property: Property; place: string }) {
  const chips = property.amenities.slice(0, 3).map(getAmenity);
  return (
    <>
      {property.headline ? (
        <p className="font-heading text-base font-bold leading-snug text-heading">{property.headline}</p>
      ) : null}
      <p className="flex items-start gap-1.5 text-caption text-body">
        <Icon name="mapPin" size={13} className="mt-0.5 shrink-0" />
        {[
          place,
          property.maxGuests > 0 ? pluralize(property.maxGuests, "Guest") : "",
          property.bedrooms > 0 ? pluralize(property.bedrooms, "Bed") : "",
        ]
          .filter(Boolean)
          .join(" · ")}
      </p>
      <div className="flex flex-wrap gap-1.5 border-t border-divider pt-3">
        {chips.map((amenity) => (
          <Pill key={amenity.id} icon={amenity.icon}>
            {amenity.shortLabel}
          </Pill>
        ))}
      </div>
    </>
  );
}
