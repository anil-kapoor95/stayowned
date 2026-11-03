import { permanentRedirect } from "next/navigation";

export const instant = false;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** Old return link of the payment page /property/<slug>/book/confirmed: now /<slug>/book/confirmed. */
export default async function OldConfirmedLink({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) for (const one of Array.isArray(v) ? v : v ? [v] : []) qs.append(k, one);
  const s = qs.toString();
  permanentRedirect(`/${encodeURIComponent(slug)}/book/confirmed${s ? `?${s}` : ""}`);
}
