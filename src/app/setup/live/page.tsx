import type { Metadata } from "next";
import { LiveStep } from "@/features/onboarding/steps/LiveStep";
import { SignupGate } from "@/features/onboarding/components/SignupGate";

export const metadata: Metadata = { title: "Your page is live" };

export default function LivePage() {
  return (
    <SignupGate step="live" fallbackClassName="container-page py-10" flashClassName="container-page -mb-2 pt-6">
      <LiveStep />
    </SignupGate>
  );
}
