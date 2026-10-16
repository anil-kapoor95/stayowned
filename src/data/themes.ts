import type { ThemeId } from "@/types/property";

export interface ThemeOption {
  id: ThemeId;
  name: string;
  description: string;
  plan: "free" | "pro";
  /** Sample hero headline shown on the theme card (from Figma). */
  previewHeadline: string;
  /** Luxe & Coastal previews use a serif display face in Figma. */
  serif: boolean;
}

/** Theme gallery from the "Theme" Figma frame. Colours live in tokens.css ([data-theme]). */
export const THEMES: readonly ThemeOption[] = [
  {
    id: "casa",
    name: "Casa",
    description: "Clean & modern · works for any stay",
    plan: "free",
    previewHeadline: "Your private pool villa",
    serif: false,
  },
  {
    id: "luxe",
    name: "Luxe",
    description: "Premium villas & boutique stays",
    plan: "pro",
    previewHeadline: "Quiet luxury in Assagao",
    serif: true,
  },
  {
    id: "homestay",
    name: "Homestay",
    description: "Family homes & farm stays",
    plan: "pro",
    previewHeadline: "Stay with us in Goa",
    serif: false,
  },
  {
    id: "urban",
    name: "Urban",
    description: "City apartments",
    plan: "pro",
    previewHeadline: "Your home in the city",
    serif: false,
  },
  {
    id: "coastal",
    name: "Coastal",
    description: "Resorts & holiday homes",
    plan: "pro",
    previewHeadline: "Slow days by the sea",
    serif: true,
  },
];

export function getTheme(id: ThemeId): ThemeOption {
  return THEMES.find((theme) => theme.id === id) ?? THEMES[0];
}
