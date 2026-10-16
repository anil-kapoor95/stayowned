import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="container-page flex flex-1 flex-col items-center justify-center py-section text-center">
      <span className="grid size-16 place-items-center rounded-pill bg-primary-soft text-primary-strong">
        <Icon name="home" size={28} />
      </span>
      <p className="mt-6 text-eyebrow uppercase text-primary">404</p>
      <h1 className="mt-2 text-display">We couldn&apos;t find that page</h1>
      <p className="mt-3 max-w-md text-lead text-body">
        The link may be broken, or the property may no longer be listed.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button href="/properties">Browse stays</Button>
        <Button href="/" variant="outline">
          Create your booking page
        </Button>
      </div>
    </div>
  );
}
