import { InfoPageLayout } from "@/components/info/InfoPageLayout";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { placeholderPages, type PlaceholderSlug } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

/**
 * Pages linked from the Figma header/footer that have no design yet. They share a
 * consistent "coming soon" layout so no link is dead, and are kept out of the index.
 */
export function placeholderMetadata(slug: PlaceholderSlug) {
  const page = placeholderPages[slug];
  return pageMetadata({ title: page.title, description: page.description, path: `/${slug}`, noindex: true });
}

export function PlaceholderPage({ slug }: { slug: PlaceholderSlug }) {
  const page = placeholderPages[slug];
  return (
    <InfoPageLayout title={page.title} description={page.description} path={`/${slug}`}>
      <section className="flex max-w-3xl flex-col items-start gap-4 rounded-card border border-dashed border-border-strong bg-card p-6 sm:flex-row sm:items-center sm:p-8">
        <span className="grid size-12 shrink-0 place-items-center rounded-pill bg-primary-soft text-primary-strong">
          <Icon name="clock" size={22} />
        </span>
        <div className="flex-1">
          <h2 className="font-heading text-title">This page is coming soon</h2>
          <p className="mt-1 text-body">
            It isn&apos;t part of the current design yet. In the meantime you can create your booking page or get in touch.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button href="/setup/account">Create free page</Button>
          <Button href="/contact" variant="outline">
            Contact us
          </Button>
        </div>
      </section>
    </InfoPageLayout>
  );
}
