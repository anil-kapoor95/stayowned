import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Extra line icons used only by the marketing pages (home, how it works, FAQ, contact).
 * Same 24px grid and stroke style as components/ui/Icon.
 */
const paths = {
  card: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M2.5 10h19M6.5 15h4" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M2.5 12h19M12 2.5c2.6 2.8 3.9 6 3.9 9.5s-1.3 6.7-3.9 9.5c-2.6-2.8-3.9-6-3.9-9.5S9.4 5.3 12 2.5Z" />
    </>
  ),
  phone: (
    <path d="M21 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 1.1 4.2 2 2 0 0 1 3.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L7.1 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.8 2.1Z" />
  ),
  chat: (
    <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.8-.9L3 20.5l1.5-4.6a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 12 3.5a8.4 8.4 0 0 1 9 8Z" />
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  bolt: <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />,
  badgeCheck: (
    <>
      <path d="M12 2.5 14.6 4l3-.2.9 2.9 2.5 1.7-1 2.8 1 2.8-2.5 1.7-.9 2.9-3 .1L12 21.5 9.4 20l-3 .1-.9-2.9L3 15.5l1-2.8-1-2.8 2.5-1.7.9-2.9 3 .2Z" />
      <path d="m8.5 12 2.3 2.3 4.7-4.6" />
    </>
  ),
  coins: (
    <>
      <circle cx="9" cy="9" r="6" />
      <path d="M17.6 10.4A6 6 0 1 1 10.4 17.6M7.5 7.5h2.2a1.4 1.4 0 0 1 0 2.8H8.3a1.4 1.4 0 0 0 0 2.8h2.2M9 6v1.5M9 13.1v1.4" />
    </>
  ),
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </>
  ),
  facebook: (
    <path d="M15 3h-2.5A4.5 4.5 0 0 0 8 7.5V10H5.5v3.5H8V21h3.5v-7.5H14l.5-3.5h-3V7.8a1.3 1.3 0 0 1 1.3-1.3H15Z" />
  ),
  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M7.5 10.5V17M7.5 7.5v.01M11 17v-6.5M11 13.2a2.7 2.7 0 0 1 5.5 0V17" />
    </>
  ),
  xLogo: <path d="M4 4l6.5 8.7L4.3 20H6l5.3-6.1 4.6 6.1H20l-6.8-9.2L19 4h-1.7l-4.9 5.6L8.1 4Z" />,
  youtube: (
    <>
      <path d="M21.6 7.2a2.6 2.6 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.6 2.6 0 0 0 2.4 7.2 27 27 0 0 0 2 12a27 27 0 0 0 .4 4.8 2.6 2.6 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.8A27 27 0 0 0 22 12a27 27 0 0 0-.4-4.8Z" />
      <path d="m10 15 5-3-5-3Z" />
    </>
  ),
  send: <path d="m22 2-7 20-4-9-9-4Zm0 0L11 13" />,
} as const;

export type MarketingIconName = keyof typeof paths;

export function MarketingIcon({
  name,
  size = 20,
  className,
  ...rest
}: { name: MarketingIconName; size?: number } & Omit<SVGProps<SVGSVGElement>, "name">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={cn("shrink-0", className)}
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}
