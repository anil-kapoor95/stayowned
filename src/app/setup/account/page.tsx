import type { Metadata } from "next";
import { AccountStep } from "@/features/onboarding/steps/AccountStep";
import { WizardShell } from "@/features/onboarding/components/WizardShell";
import {
  AccountPanelBenefits,
  AccountPanelIntro,
  PreviewPanel,
} from "@/features/onboarding/components/PreviewPanel";

export const metadata: Metadata = { title: "Create your free account" };

export default function AccountPage() {
  return (
    <WizardShell
      step="account"
      aside={<PreviewPanel variant="details" intro={<AccountPanelIntro />} footer={<AccountPanelBenefits />} />}
    >
      <AccountStep />
    </WizardShell>
  );
}
