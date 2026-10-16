import { InfoPageLayout } from "@/components/info/InfoPageLayout";
import { ThemePreview } from "@/components/theme/ThemePreview";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { THEMES } from "@/data/themes";
import { pageMetadata } from "@/lib/seo";

const description = "Five designer looks for your booking page. Casa is free; Luxe, Homestay, Urban and Coastal come with Pro.";

export const metadata = pageMetadata({ title: "Themes", description, path: "/themes" });

export default function ThemesPage() {
  return (
    <InfoPageLayout title="Themes" description={description} path="/themes">
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {THEMES.map((theme) => (
          <li key={theme.id} className="rounded-card border border-border bg-card p-4 shadow-card">
            <ThemePreview theme={theme} propertyName="Green Casa" place="Assagao, North Goa" />
            <h2 className="mt-4 flex items-center gap-2 font-heading text-base font-bold">
              {theme.name}
              <Badge variant={theme.plan === "free" ? "free" : "pro"}>{theme.plan === "free" ? "Free" : "Pro"}</Badge>
            </h2>
            <p className="mt-0.5 text-small text-body">{theme.description}</p>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/setup/account">Create free page</Button>
        <Button href="/properties" variant="outline">
          See live example pages
        </Button>
      </div>
    </InfoPageLayout>
  );
}
