import type { Metadata } from "next";
import { AccountStep } from "@/features/onboarding/steps/AccountStep";
import { WizardShell } from "@/features/onboarding/components/WizardShell";
import { PreviewPanel } from "@/features/onboarding/components/PreviewPanel";

export const metadata: Metadata = { title: "Your account" };

/** Step 1 again, after it is done: change name, e-mail, phone or password, then continue. */
export default function AccountEditPage() {
  return (
    <WizardShell step="account" editing aside={<PreviewPanel variant="details" />}>
      <AccountStep />
    </WizardShell>
  );
}
