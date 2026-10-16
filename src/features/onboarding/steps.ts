export const WIZARD_STEPS = [
  { id: "account", label: "Account", href: "/setup/account" },
  { id: "property", label: "Property", href: "/setup/property" },
  { id: "photos", label: "Photos", href: "/setup/photos" },
  { id: "description", label: "AI description", href: "/setup/description" },
  { id: "theme", label: "Theme", href: "/setup/theme" },
] as const;

export type WizardStepId = (typeof WIZARD_STEPS)[number]["id"];

export const ACCOUNT_HREF = "/setup/account";
export const LIVE_HREF = "/setup/live";
export const PREVIEW_HREF = "/setup/preview";
