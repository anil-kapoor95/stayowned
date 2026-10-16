import type { Metadata } from "next";
import { ThemeStep } from "@/features/onboarding/steps/ThemeStep";
import { WizardShell } from "@/features/onboarding/components/WizardShell";

export const metadata: Metadata = { title: "Pick a theme" };

export default function ThemePage() {
  return (
    <WizardShell step="theme" wide>
      <ThemeStep />
    </WizardShell>
  );
}
