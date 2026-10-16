import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

/** Wordmark from Figma: "Stay" in navy + "Owned" in brand orange. */
export function Logo({ inverted = false, className }: { inverted?: boolean; className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center rounded-sm font-heading text-logo focus-visible:outline-none focus-visible:focus-ring",
        className,
      )}
      aria-label={`${siteConfig.name} — home`}
    >
      <span className={inverted ? "text-on-dark" : "text-nav"}>Stay</span>
      <span className="text-brand">Owned</span>
    </Link>
  );
}
