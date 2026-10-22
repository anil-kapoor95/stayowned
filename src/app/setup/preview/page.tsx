import type { Metadata } from "next";
import { DraftPreview } from "@/features/onboarding/components/DraftPreview";
import { SignupGate } from "@/features/onboarding/components/SignupGate";

export const metadata: Metadata = { title: "Preview your booking page" };

export default function PreviewPage() {
  return (
    <SignupGate step="preview" showFlash={false} fallbackClassName="container-page py-10">
      <DraftPreview />
    </SignupGate>
  );
}
