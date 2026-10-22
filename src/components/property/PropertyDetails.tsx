import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { getAmenity, PROPERTY_TYPE_LABELS } from "@/data/amenities";
import { formatPrice, pluralize } from "@/lib/utils";
import type { Property } from "@/types/property";
import { InquiryForm } from "./InquiryForm";
import { PropertyGallery } from "./PropertyGallery";

/**
 * Guest-facing property page body. Not designed in Figma — derived from the
 * wizard's "live preview" card and the Casa theme, and themed via data-theme.
 * Presentational only, so it renders the same for repository data and drafts.
 */
export function PropertyDetails({ property, breadcrumbs }: { property: Property; breadcrumbs?: ReactNode }) {
  const place = [property.location.locality, property.location.region].filter(Boolean).join(", ");
  const amenities = property.amenities.map(getAmenity);
  return (
    <div className="container-page py-8 sm:py-10">
      {breadcrumbs}
      <header className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-eyebrow uppercase text-primary-strong">
            Entire {PROPERTY_TYPE_LABELS[property.type].toLowerCase()} · Sleeps {property.maxGuests}
          </p>
          <h1 className="mt-1 text-display">{property.name}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-small text-body">
            <span className="flex items-center gap-1.5">
              <Icon name="mapPin" size={15} /> {place}
              {property.location.country ? `, ${property.location.country}` : ""}
            </span>
            {property.rating ? (
              <span className="flex items-center gap-1.5">
                <Icon name="star" size={15} className="text-rating" />
                <strong className="text-heading">{property.rating.average.toFixed(2)}</strong>
                <span>({property.rating.count} reviews)</span>
              </span>
            ) : null}
          </p>
        </div>
      </header>

      <div className="mt-6">
        <PropertyGallery images={property.images} name={property.name} />
      </div>

      <div className="mt-10 grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="grid gap-10">
          <section aria-labelledby="about-title">
            <h2 id="about-title" className={property.headline ? "text-section" : "sr-only"}>
              {property.headline || `About ${property.name}`}
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2 text-small text-heading">
              <Stat icon="bed">{pluralize(property.bedrooms, "bedroom")}</Stat>
              <Stat icon="bath">{pluralize(property.bathrooms, "bathroom")}</Stat>
              <Stat icon="users">Up to {pluralize(property.maxGuests, "guest")}</Stat>
            </ul>
            {property.description ? (
              <div className="mt-5 grid max-w-prose gap-4 text-lead text-body">
                {property.description.split(/\n\s*\n/).map((paragraph, index) => (
                  <p key={index} className="whitespace-pre-line">
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : null}
            {property.highlights.length ? (
              <ul className="mt-5 flex flex-wrap gap-2" aria-label="Highlights">
                {property.highlights.map((item) => (
                  <li key={item} className="rounded-sm bg-primary-soft px-2.5 py-1 text-small font-medium text-primary-strong">
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>

          {amenities.length ? (
            <section aria-labelledby="amenities-title" className="border-t border-divider pt-8">
              <h2 id="amenities-title" className="text-section">
                What this place offers
              </h2>
              <ul className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
                {amenities.map((amenity) => (
                  <li key={amenity.id} className="flex items-center gap-3 text-base text-heading">
                    <span className="grid size-10 place-items-center rounded-input bg-surface-muted text-primary-strong">
                      <Icon name={amenity.icon} size={18} />
                    </span>
                    {amenity.label}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {property.faqs.length ? (
            <section aria-labelledby="faq-title" className="border-t border-divider pt-8">
              <h2 id="faq-title" className="text-section">
                Questions guests ask
              </h2>
              <div className="mt-4 divide-y divide-divider rounded-card border border-border bg-card">
                {property.faqs.map((faq) => (
                  <details key={faq.question} className="group px-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-semibold text-heading [&::-webkit-details-marker]:hidden">
                      {faq.question}
                      <Icon name="plus" size={18} className="shrink-0 text-primary transition-transform group-open:rotate-45" />
                    </summary>
                    <p className="pb-4 text-body">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          ) : null}

          <section aria-labelledby="rules-title" className="border-t border-divider pt-8">
            <h2 id="rules-title" className="text-section">
              Good to know
            </h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-3">
              <Fact icon="clock" label="Check-in" value={`From ${property.availability.checkInTime}`} />
              <Fact icon="clock" label="Check-out" value={`By ${property.availability.checkOutTime}`} />
              <Fact icon="calendar" label="Minimum stay" value={pluralize(property.availability.minNights, "night")} />
            </dl>
            <p className="mt-6 flex items-center gap-2 text-small text-body">
              <Icon name="shield" size={16} className="text-success" />
              Hosted by <strong className="text-heading">{property.host.name}</strong> · {property.host.responseTime}
            </p>
          </section>
        </div>

        <aside aria-labelledby="book-title" className="rounded-card border border-border bg-card p-5 shadow-card sm:p-6 lg:sticky lg:top-[calc(var(--spacing-header)+1.5rem)]">
          <h2 id="book-title" className="sr-only">
            Book {property.name}
          </h2>
          {property.price.amount > 0 ? (
            <p className="text-heading">
              <span className="font-heading text-section">{formatPrice(property.price.amount, property.price.currency)}</span>{" "}
              <span className="text-small text-muted">/ night</span>
            </p>
          ) : (
            // No rate set yet (Prices in the back office): never show "0".
            <p className="font-heading text-title text-heading">Price on request</p>
          )}
          <p className="mb-5 mt-1 text-small font-semibold text-success">Direct booking rate · 0% commission</p>
          <InquiryForm property={property} />
        </aside>
      </div>
    </div>
  );
}

function Stat({ icon, children }: { icon: "bed" | "bath" | "users"; children: ReactNode }) {
  return (
    <li className="flex items-center gap-1.5 rounded-sm bg-tag-bg px-3 py-1.5">
      <Icon name={icon} size={15} /> {children}
    </li>
  );
}

function Fact({ icon, label, value }: { icon: "clock" | "calendar"; label: string; value: string }) {
  return (
    <div className="rounded-input border border-border bg-card p-4">
      <dt className="flex items-center gap-2 text-caption font-semibold uppercase tracking-wide text-muted">
        <Icon name={icon} size={14} /> {label}
      </dt>
      <dd className="mt-1 font-semibold text-heading">{value}</dd>
    </div>
  );
}
