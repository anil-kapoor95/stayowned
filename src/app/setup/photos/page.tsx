import type { Metadata } from "next";
import { PhotosStep } from "@/features/onboarding/steps/PhotosStep";
import { WizardShell } from "@/features/onboarding/components/WizardShell";
import { PreviewPanel } from "@/features/onboarding/components/PreviewPanel";

export const metadata: Metadata = { title: "Add photos" };

export default function PhotosPage() {
  return (
    <WizardShell step="photos" aside={<PreviewPanel variant="photos" />}>
      <PhotosStep />
    </WizardShell>
  );
}
