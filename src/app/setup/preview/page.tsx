import type { Metadata } from "next";
import { DraftPreview } from "@/features/onboarding/components/DraftPreview";

export const metadata: Metadata = { title: "Preview your booking page" };

export default function PreviewPage() {
  return <DraftPreview />;
}
