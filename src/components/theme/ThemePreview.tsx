import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { ThemeOption } from "@/data/themes";

/**
 * Miniature mock of a guest page in a given theme (Theme frame cards).
 * Colours come from the --color-theme-* tokens scoped by data-theme.
 */
export function ThemePreview({
  theme,
  propertyName,
  place,
  large = false,
}: {
  theme: ThemeOption;
  propertyName: string;
  place: string;
  large?: boolean;
}) {
  return (
    <div
      data-theme={theme.id}
      className={cn("rounded-input border border-black/5 bg-theme-canvas", large ? "p-5" : "p-3")}
      aria-hidden="true"
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "font-bold text-theme-title",
            theme.serif ? "font-serif italic" : "font-body",
            large ? "text-base" : "text-small",
          )}
        >
          {propertyName}
        </span>
        <span className={cn("rounded-pill bg-theme-cta font-semibold text-theme-cta-text", large ? "px-3 py-1 text-small" : "px-2.5 py-0.5 text-caption")}>
          Book now
        </span>
      </div>
      <div className={cn("relative mt-3 flex flex-col justify-end rounded-sm bg-theme-hero", large ? "h-56 p-6" : "h-32 p-3.5")}>
        {theme.plan === "pro" ? <Badge variant="pro" className="absolute right-3 top-3">Pro</Badge> : null}
        <p className={cn("text-white", theme.serif ? "font-serif" : "font-body font-bold", large ? "text-section" : "text-base")}>
          {theme.previewHeadline}
        </p>
        <p className="text-caption text-white/85">{place}</p>
      </div>
      <div className="mt-2.5 grid grid-cols-3 gap-2">
        {[0, 1, 2].map((item) => (
          <span key={item} className={cn("rounded-sm bg-theme-thumb", large ? "h-16" : "h-9")} />
        ))}
      </div>
    </div>
  );
}
