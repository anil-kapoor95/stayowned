/** Sign-up steps, in the order of the back end (pjJabbApi::$steps). */
export const WIZARD_STEPS = [
  { id: "account", number: 1, label: "Account", href: "/setup/account" },
  { id: "company", number: 2, label: "Company", href: "/setup/company" },
  { id: "property", number: 3, label: "Property", href: "/setup/property" },
  { id: "photos", number: 4, label: "Photos", href: "/setup/photos" },
  { id: "description", number: 5, label: "AI description", href: "/setup/description" },
  { id: "theme", number: 6, label: "Theme", href: "/setup/theme" },
] as const;

export type WizardStepId = (typeof WIZARD_STEPS)[number]["id"];

export const ACCOUNT_HREF = "/setup/account";
/** Step 1 again after it is done (change name, e-mail, phone or password); /setup/account resumes instead. */
export const ACCOUNT_EDIT_HREF = "/setup/account/edit";
export const LIVE_HREF = "/setup/live";
export const PREVIEW_HREF = "/setup/preview";

export function stepNumber(id: WizardStepId): number {
  return WIZARD_STEPS.find((step) => step.id === id)?.number ?? 1;
}

/** Page for a back-end "next_step" value (a step number, or "done"). */
export function hrefForNextStep(next: number | "done"): string {
  if (next === "done") return LIVE_HREF;
  return WIZARD_STEPS.find((step) => step.number === next)?.href ?? ACCOUNT_HREF;
}
