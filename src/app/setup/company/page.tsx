import type { Metadata } from "next";
import { CompanyStep } from "@/features/onboarding/steps/CompanyStep";
import { WizardShell } from "@/features/onboarding/components/WizardShell";
import { PreviewPanel } from "@/features/onboarding/components/PreviewPanel";

export const metadata: Metadata = { title: "Your company" };

export default function CompanyPage() {
  return (
    <WizardShell step="company" aside={<PreviewPanel variant="details" />}>
      <CompanyStep />
    </WizardShell>
  );
}
