import type { Metadata } from "next";
import { HostSite } from "@/components/layout/HostSite";
import { notFound } from "next/navigation";
import { BookingConfirmed } from "@/features/booking/BookingConfirmed";
import { getBookingSetup, label } from "@/lib/api/booking";
import { sitePaths } from "@/lib/site-paths";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const instant = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const setup = await getBookingSetup(slug);
  if (!setup) return { title: "Page not found", robots: { index: false } };
  return { title: { absolute: `${label(setup.labels, "book_reference")} — ${setup.property.name}` }, robots: { index: false } };
}

export default async function BookingConfirmedPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const setup = await getBookingSetup(slug);
  if (!setup) notFound();
  const paths = await sitePaths(setup.slug, setup.company_slug);
  if (paths.domainCompany && setup.company_slug !== paths.domainCompany) notFound();
  const ref = Array.isArray(query.ref) ? query.ref[0] : query.ref;
  const key = Array.isArray(query.key) ? query.key[0] : query.key;
  return (
    <>
      <HostSite />
      <BookingConfirmed setup={setup} basePath={paths.property} reference={ref ?? ""} bookingKey={key ?? ""} />
    </>
  );
}
