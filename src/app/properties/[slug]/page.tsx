import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PropertyDetails } from "@/components/property/PropertyDetails";
import { propertyRepository } from "@/lib/properties/repository";
import { pageMetadata, truncate } from "@/lib/seo";

export async function generateStaticParams() {
  const slugs = await propertyRepository.listSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/properties/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const property = await propertyRepository.getBySlug(slug);
  if (!property) return { title: "Property not found", robots: { index: false } };
  const cover = property.images[0];
  return pageMetadata({
    title: `${property.name} — ${property.summary} in ${property.location.locality}`,
    description: truncate(`${property.headline}. ${property.description}`),
    path: `/properties/${property.slug}`,
    images: cover ? [{ url: cover.src, width: cover.width, height: cover.height, alt: cover.alt }] : undefined,
  });
}

export default async function PropertyPage({ params }: PageProps<"/properties/[slug]">) {
  const { slug } = await params;
  const property = await propertyRepository.getBySlug(slug);
  if (!property) notFound();

  return (
    <div data-theme={property.theme} className="flex-1 bg-background">
      <PropertyDetails
        property={property}
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Properties", href: "/properties" },
              { label: property.name, href: `/properties/${property.slug}` },
            ]}
          />
        }
      />
    </div>
  );
}
