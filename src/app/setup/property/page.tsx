import type { Metadata } from "next";
import { PropertyStep } from "@/features/onboarding/steps/PropertyStep";
import { WizardShell } from "@/features/onboarding/components/WizardShell";
import { ActiveThemeCard, PreviewPanel } from "@/features/onboarding/components/PreviewPanel";

export const metadata: Metadata = { title: "Tell us about your property" };

export default function PropertyPage() {
  return (
    <WizardShell
      step="property"
      aside={
        <>
          <PreviewPanel variant="details" />
          <ActiveThemeCard />
        </>
      }
    >
      <PropertyStep />
    </WizardShell>
  );
}
