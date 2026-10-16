import { redirect } from "next/navigation";
import { ACCOUNT_HREF } from "@/features/onboarding/steps";

/**
 * No home page is designed yet, so the root URL sends visitors to the first
 * onboarding step (temporary 307). Replace this file when a home page exists.
 */
export default function HomePage() {
  redirect(ACCOUNT_HREF);
}
