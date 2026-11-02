import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookingFlow } from "@/features/booking/BookingFlow";
import { getBookingSetup, label } from "@/lib/api/booking";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// Prices, availability and the booking form come from the back office on each request.
export const instant = false;

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";
const count = (value: string | string[] | undefined) => {
  const n = Number.parseInt(one(value), 10);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const setup = await getBookingSetup(slug);
  if (!setup) return { title: "Page not found", robots: { index: false } };
  return {
    title: { absolute: `${label(setup.labels, "book_book_now")} — ${setup.property.name}` },
    robots: { index: false },
  };
}

export default async function BookingPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const setup = await getBookingSetup(slug);
  if (!setup) notFound();
  return (
    <BookingFlow
      setup={setup}
      initial={{
        date_from: one(query.from),
        date_to: one(query.to),
        adults: count(query.adults),
        children: count(query.children),
      }}
    />
  );
}
