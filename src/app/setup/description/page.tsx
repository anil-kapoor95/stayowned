import type { Metadata } from "next";
import { DescriptionStep } from "@/features/onboarding/steps/DescriptionStep";
import { WizardShell } from "@/features/onboarding/components/WizardShell";
import { PreviewPanel } from "@/features/onboarding/components/PreviewPanel";

export const metadata: Metadata = { title: "Review your page description" };

export default function DescriptionPage() {
  return (
    <WizardShell step="description" aside={<PreviewPanel variant="content" />}>
      <DescriptionStep />
    </WizardShell>
  );
}
