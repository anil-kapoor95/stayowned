import type { Metadata } from "next";
import { PreviewFrame } from "@/features/onboarding/components/DraftPreview";
import { SignupGate } from "@/features/onboarding/components/SignupGate";

export const metadata: Metadata = { title: "Mobile preview" };

/** Shown inside the phone frame of /setup/preview (an iframe, so the page uses its mobile layout). */
export default function PreviewFramePage() {
  return (
    <SignupGate step="preview" showFlash={false} fallbackClassName="p-4">
      <PreviewFrame />
    </SignupGate>
  );
}
