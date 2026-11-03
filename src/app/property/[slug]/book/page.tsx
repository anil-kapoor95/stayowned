import { permanentRedirect } from "next/navigation";

export const instant = false;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const queryOf = (query: Record<string, string | string[] | undefined>) => {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) for (const one of Array.isArray(v) ? v : v ? [v] : []) qs.append(k, one);
  const s = qs.toString();
  return s ? `?${s}` : "";
};

/** Old link /property/<slug>/book: now /<slug>/book. */
export default async function OldBookingLink({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  permanentRedirect(`/${encodeURIComponent(slug)}/book${queryOf(query)}`);
}
