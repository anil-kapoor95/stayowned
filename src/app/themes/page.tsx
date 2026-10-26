import { ThemesPage } from "@/components/marketing/ThemesPage";
import { pageMetadata } from "@/lib/seo";

const description = "Five designer looks for your booking page. Casa is free; Luxe, Homestay, Urban and Coastal come with Pro.";

export const metadata = pageMetadata({ title: "Themes", description, path: "/themes" });

export default function Page() {
  return <ThemesPage />;
}
