import { permanentRedirect } from "next/navigation";

export const instant = false;

type Props = { params: Promise<{ slug: string }> };

/** Old link /property/<slug>: the property is now at /<slug> (shared links keep working). */
export default async function OldPropertyLink({ params }: Props) {
  const { slug } = await params;
  permanentRedirect(`/${encodeURIComponent(slug)}`);
}
