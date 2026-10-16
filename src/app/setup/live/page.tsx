import type { Metadata } from "next";
import { LiveStep } from "@/features/onboarding/steps/LiveStep";

export const metadata: Metadata = { title: "Your page is live" };

export default function LivePage() {
  return <LiveStep />;
}
